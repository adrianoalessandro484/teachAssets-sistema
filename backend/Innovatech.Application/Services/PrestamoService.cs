using Innovatech.Application.DTOs.Prestamos;
using Innovatech.Application.Interfaces;
using Innovatech.Domain.Entities;
using Innovatech.Domain.Enums;
using Innovatech.Domain.Exceptions;

namespace Innovatech.Application.Services;

public class PrestamoService(
    IPrestamoRepository prestamoRepository,
    IEquipoRepository equipoRepository,
    IUsuarioRepository usuarioRepository,
    IMovimientoEquipoRepository movimientoRepository,
    IUnitOfWork unitOfWork) : IPrestamoService
{
    public async Task<IReadOnlyList<PrestamoDto>> GetAllAsync(
        PrestamoFilterDto filter,
        Guid actorId,
        RolUsuario actorRol,
        CancellationToken ct = default)
    {
        if (actorRol == RolUsuario.Colaborador)
        {
            filter.UsuarioId = actorId;
        }

        var prestamos = await prestamoRepository.GetAllWithDetailsAsync(filter, ct);
        return prestamos.Select(MapToDto).ToList();
    }

    public async Task<PrestamoDto> GetByIdAsync(Guid id, Guid actorId, RolUsuario actorRol, CancellationToken ct = default)
    {
        var prestamo = await prestamoRepository.GetByIdWithDetailsAsync(id, ct)
            ?? throw new NotFoundException("Préstamo no encontrado.");

        if (actorRol == RolUsuario.Colaborador && prestamo.UsuarioId != actorId)
        {
            throw new ForbiddenException("No tiene permisos para consultar el préstamo de otro colaborador.");
        }

        return MapToDto(prestamo);
    }

    public async Task<PrestamoDto> SolicitarAsync(SolicitarPrestamoDto dto, Guid solicitanteId, CancellationToken ct = default)
    {
        var solicitante = await usuarioRepository.GetByIdAsync(solicitanteId, ct)
            ?? throw new NotFoundException("Usuario solicitante no encontrado.");

        if (!solicitante.Estado)
        {
            throw new ForbiddenException("Un usuario deshabilitado no puede solicitar préstamos.");
        }

        var equipo = await equipoRepository.GetByIdAsync(dto.EquipoId, ct)
            ?? throw new NotFoundException("Equipo tecnológico no encontrado.");

        ValidarDisponibilidadEquipoParaPrestamo(equipo);

        // RN-01: Un equipo solo puede estar asociado a un préstamo activo.
        if (await prestamoRepository.HasActivePrestamoForEquipoAsync(equipo.Id, ct))
        {
            throw new ConflictException("El equipo seleccionado ya se encuentra asociado a un préstamo activo.");
        }

        var fechaPrestamo = NormalizeUtc(dto.FechaPrestamo);
        var fechaDevolucionEstimada = NormalizeUtc(dto.FechaDevolucionEstimada);

        if (fechaPrestamo.ToLocalTime().Date < DateTime.Today)
        {
            throw new BusinessRuleException("La fecha de préstamo no puede ser anterior al día de hoy.");
        }

        // RN-04: La fecha de devolución debe ser posterior a la fecha de préstamo.
        if (fechaDevolucionEstimada <= fechaPrestamo)
        {
            throw new BusinessRuleException("La fecha estimada de devolución debe ser posterior a la fecha de préstamo.");
        }

        var prestamo = new Prestamo
        {
            FechaSolicitud = DateTime.UtcNow,
            FechaPrestamo = fechaPrestamo,
            FechaDevolucionEstimada = fechaDevolucionEstimada,
            Estado = EstadoPrestamo.Pendiente,
            Observacion = string.IsNullOrWhiteSpace(dto.Observacion) ? null : dto.Observacion.Trim(),
            UsuarioId = solicitanteId,
            EquipoId = equipo.Id
        };

        await prestamoRepository.AddAsync(prestamo, ct);
        await unitOfWork.SaveChangesAsync(ct);

        var creado = await prestamoRepository.GetByIdWithDetailsAsync(prestamo.Id, ct)
            ?? throw new NotFoundException("Error al recuperar la solicitud de préstamo.");

        return MapToDto(creado);
    }

    public async Task<PrestamoDto> AprobarAsync(Guid id, Guid responsableId, CancellationToken ct = default)
    {
        // RN-05: Todo préstamo debe registrar un responsable.
        var responsable = await usuarioRepository.GetByIdAsync(responsableId, ct)
            ?? throw new NotFoundException("Usuario responsable no encontrado.");

        if (!responsable.Estado)
        {
            throw new ForbiddenException("Un responsable deshabilitado no puede aprobar préstamos.");
        }

        var prestamo = await prestamoRepository.GetByIdWithDetailsAsync(id, ct)
            ?? throw new NotFoundException("Solicitud de préstamo no encontrada.");

        if (prestamo.Estado != EstadoPrestamo.Pendiente)
        {
            throw new BusinessRuleException($"Solo se pueden aprobar solicitudes en estado 'Pendiente'. Estado actual: {prestamo.Estado}.");
        }

        var equipo = await equipoRepository.GetByIdAsync(prestamo.EquipoId, ct)
            ?? throw new NotFoundException("Equipo asociado no encontrado.");

        ValidarDisponibilidadEquipoParaPrestamo(equipo);

        // RN-01: Un equipo solo puede estar asociado a un préstamo activo.
        if (await prestamoRepository.HasActivePrestamoForEquipoAsync(equipo.Id, ct))
        {
            throw new ConflictException("El equipo ya cuenta con un préstamo activo.");
        }

        var estadoAnterior = equipo.Estado;
        equipo.Estado = EstadoEquipo.Prestado;

        prestamo.Estado = EstadoPrestamo.Activo;
        prestamo.ResponsableId = responsableId;
        if (prestamo.FechaPrestamo < DateTime.UtcNow.AddMinutes(-5))
        {
            // Se conserva la fecha solicitada si es futura; si fue anterior al momento de aprobación, ajustamos si excede devolución estimada.
            if (prestamo.FechaDevolucionEstimada <= DateTime.UtcNow)
            {
                throw new BusinessRuleException("La fecha estimada de devolución ya expiró y debe ser posterior a la fecha actual.");
            }
        }

        equipoRepository.Update(equipo);
        prestamoRepository.Update(prestamo);

        await movimientoRepository.AddAsync(new MovimientoEquipo
        {
            EquipoId = equipo.Id,
            UsuarioResponsableId = responsableId,
            TipoMovimiento = TipoMovimiento.PrestamoAprobado,
            EstadoAnterior = estadoAnterior,
            EstadoNuevo = EstadoEquipo.Prestado,
            FechaMovimiento = DateTime.UtcNow,
            Detalle = $"Préstamo aprobado para {prestamo.Usuario.Nombres} {prestamo.Usuario.Apellidos} ({prestamo.Usuario.Area})."
        }, ct);

        await unitOfWork.SaveChangesAsync(ct);

        var actualizado = await prestamoRepository.GetByIdWithDetailsAsync(prestamo.Id, ct)!;
        return MapToDto(actualizado!);
    }

    public async Task<PrestamoDto> RechazarAsync(Guid id, RechazarPrestamoDto dto, Guid responsableId, CancellationToken ct = default)
    {
        var prestamo = await prestamoRepository.GetByIdWithDetailsAsync(id, ct)
            ?? throw new NotFoundException("Solicitud de préstamo no encontrada.");

        if (prestamo.Estado != EstadoPrestamo.Pendiente)
        {
            throw new BusinessRuleException($"Solo se pueden rechazar solicitudes en estado 'Pendiente'. Estado actual: {prestamo.Estado}.");
        }

        prestamo.Estado = EstadoPrestamo.Rechazado;
        prestamo.ResponsableId = responsableId;
        prestamo.ObservacionDevolucion = $"Solicitud rechazada: {dto.Motivo.Trim()}";

        prestamoRepository.Update(prestamo);
        await unitOfWork.SaveChangesAsync(ct);

        var actualizado = await prestamoRepository.GetByIdWithDetailsAsync(prestamo.Id, ct)!;
        return MapToDto(actualizado!);
    }

    public async Task<PrestamoDto> RegistrarDevolucionAsync(
        Guid id,
        RegistrarDevolucionDto dto,
        Guid responsableId,
        CancellationToken ct = default)
    {
        // RN-10: Toda devolución deberá registrar observaciones.
        if (string.IsNullOrWhiteSpace(dto.ObservacionDevolucion))
        {
            throw new BusinessRuleException("Toda devolución debe registrar observaciones.");
        }

        var prestamo = await prestamoRepository.GetByIdWithDetailsAsync(id, ct)
            ?? throw new NotFoundException("Préstamo no encontrado.");

        if (prestamo.Estado != EstadoPrestamo.Activo)
        {
            throw new BusinessRuleException("Solo se puede registrar la devolución de un préstamo que se encuentre en estado 'Activo'.");
        }

        var fechaDevolucion = NormalizeUtc(dto.FechaDevolucion);

        // RN-04: La fecha de devolución debe ser posterior a la fecha de préstamo.
        if (fechaDevolucion <= prestamo.FechaPrestamo)
        {
            throw new BusinessRuleException("La fecha de devolución debe ser posterior a la fecha de préstamo.");
        }

        var equipo = await equipoRepository.GetByIdAsync(prestamo.EquipoId, ct)
            ?? throw new NotFoundException("Equipo asociado no encontrado.");

        var estadoAnterior = equipo.Estado;
        var nuevoEstadoEquipo = dto.EnviarAMantenimiento ? EstadoEquipo.Mantenimiento : EstadoEquipo.Disponible;

        equipo.Estado = nuevoEstadoEquipo;
        prestamo.Estado = EstadoPrestamo.Devuelto;
        prestamo.FechaDevolucion = fechaDevolucion;
        prestamo.ObservacionDevolucion = dto.ObservacionDevolucion.Trim();
        prestamo.ResponsableId ??= responsableId;

        equipoRepository.Update(equipo);
        prestamoRepository.Update(prestamo);

        await movimientoRepository.AddAsync(new MovimientoEquipo
        {
            EquipoId = equipo.Id,
            UsuarioResponsableId = responsableId,
            TipoMovimiento = TipoMovimiento.Devolucion,
            EstadoAnterior = estadoAnterior,
            EstadoNuevo = nuevoEstadoEquipo,
            FechaMovimiento = DateTime.UtcNow,
            Detalle = $"Devolución registrada por {prestamo.Usuario.Nombres} {prestamo.Usuario.Apellidos}. Obs: {prestamo.ObservacionDevolucion}"
        }, ct);

        await unitOfWork.SaveChangesAsync(ct);

        var actualizado = await prestamoRepository.GetByIdWithDetailsAsync(prestamo.Id, ct)!;
        return MapToDto(actualizado!);
    }

    private static void ValidarDisponibilidadEquipoParaPrestamo(Equipo equipo)
    {
        // RN-02: No se puede prestar un equipo en estado “Mantenimiento”.
        if (equipo.Estado == EstadoEquipo.Mantenimiento)
        {
            throw new BusinessRuleException("No se puede prestar un equipo que se encuentra en estado 'Mantenimiento'.");
        }

        // RN-03: No se puede prestar un equipo en estado “Baja”.
        if (equipo.Estado == EstadoEquipo.Baja)
        {
            throw new BusinessRuleException("No se puede prestar un equipo que se encuentra en estado 'Baja'.");
        }

        if (equipo.Estado == EstadoEquipo.Prestado)
        {
            throw new ConflictException("El equipo se encuentra actualmente en estado 'Prestado'.");
        }
    }

    private static DateTime NormalizeUtc(DateTime dateTime) => dateTime.Kind switch
    {
        DateTimeKind.Utc => dateTime,
        DateTimeKind.Local => dateTime.ToUniversalTime(),
        _ => DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
    };

    private static PrestamoDto MapToDto(Prestamo prestamo) => new()
    {
        Id = prestamo.Id,
        FechaSolicitud = prestamo.FechaSolicitud,
        FechaPrestamo = prestamo.FechaPrestamo,
        FechaDevolucionEstimada = prestamo.FechaDevolucionEstimada,
        FechaDevolucion = prestamo.FechaDevolucion,
        Estado = prestamo.Estado,
        Observacion = prestamo.Observacion,
        ObservacionDevolucion = prestamo.ObservacionDevolucion,
        UsuarioId = prestamo.UsuarioId,
        UsuarioNombre = $"{prestamo.Usuario.Nombres} {prestamo.Usuario.Apellidos}".Trim(),
        UsuarioArea = prestamo.Usuario.Area,
        ResponsableId = prestamo.ResponsableId,
        ResponsableNombre = prestamo.Responsable is null
            ? null
            : $"{prestamo.Responsable.Nombres} {prestamo.Responsable.Apellidos}".Trim(),
        EquipoId = prestamo.EquipoId,
        EquipoCodigoPatrimonial = prestamo.Equipo.CodigoPatrimonial,
        EquipoNombre = prestamo.Equipo.Nombre,
        EquipoCategoria = prestamo.Equipo.Categoria
    };
}
