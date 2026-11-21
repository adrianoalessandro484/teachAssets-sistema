using Innovatech.Application.DTOs.Equipos;
using Innovatech.Application.Interfaces;
using Innovatech.Domain.Entities;
using Innovatech.Domain.Enums;
using Innovatech.Domain.Exceptions;

namespace Innovatech.Application.Services;

public class EquipoService(
    IEquipoRepository equipoRepository,
    IMovimientoEquipoRepository movimientoRepository,
    IUnitOfWork unitOfWork) : IEquipoService
{
    public async Task<IReadOnlyList<EquipoDto>> GetAllAsync(EquipoFilterDto filter, CancellationToken ct = default)
    {
        var equipos = await equipoRepository.GetAllAsync(filter, ct);
        return equipos.Select(MapToDto).ToList();
    }

    public async Task<EquipoDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var equipo = await equipoRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Equipo tecnológico no encontrado.");
        return MapToDto(equipo);
    }

    public async Task<EquipoDto> CreateAsync(CreateEquipoDto dto, Guid actorId, CancellationToken ct = default)
    {
        var codigo = dto.CodigoPatrimonial.Trim().ToUpperInvariant();

        // RN-07: El código patrimonial debe ser único.
        if (await equipoRepository.ExistsByCodigoAsync(codigo, null, ct))
        {
            throw new ConflictException($"Ya existe un equipo con el código patrimonial '{codigo}'.");
        }

        var equipo = new Equipo
        {
            CodigoPatrimonial = codigo,
            Nombre = dto.Nombre.Trim(),
            Categoria = dto.Categoria,
            Marca = dto.Marca.Trim(),
            Ubicacion = dto.Ubicacion.Trim(),
            Estado = EstadoEquipo.Disponible,
            FechaRegistro = DateTime.UtcNow
        };

        await equipoRepository.AddAsync(equipo, ct);
        await movimientoRepository.AddAsync(new MovimientoEquipo
        {
            EquipoId = equipo.Id,
            UsuarioResponsableId = actorId,
            TipoMovimiento = TipoMovimiento.Registro,
            EstadoAnterior = null,
            EstadoNuevo = EstadoEquipo.Disponible,
            FechaMovimiento = DateTime.UtcNow,
            Detalle = $"Alta de equipo '{equipo.Nombre}' ({equipo.CodigoPatrimonial}) en {equipo.Ubicacion}."
        }, ct);

        await unitOfWork.SaveChangesAsync(ct);

        return MapToDto(equipo);
    }

    public async Task<EquipoDto> UpdateAsync(Guid id, UpdateEquipoDto dto, Guid actorId, CancellationToken ct = default)
    {
        var equipo = await equipoRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Equipo tecnológico no encontrado.");

        var codigo = dto.CodigoPatrimonial.Trim().ToUpperInvariant();

        // RN-07: El código patrimonial debe ser único.
        if (await equipoRepository.ExistsByCodigoAsync(codigo, id, ct))
        {
            throw new ConflictException($"Ya existe otro equipo con el código patrimonial '{codigo}'.");
        }

        equipo.CodigoPatrimonial = codigo;
        equipo.Nombre = dto.Nombre.Trim();
        equipo.Categoria = dto.Categoria;
        equipo.Marca = dto.Marca.Trim();
        equipo.Ubicacion = dto.Ubicacion.Trim();

        equipoRepository.Update(equipo);
        await movimientoRepository.AddAsync(new MovimientoEquipo
        {
            EquipoId = equipo.Id,
            UsuarioResponsableId = actorId,
            TipoMovimiento = TipoMovimiento.Actualizacion,
            EstadoAnterior = equipo.Estado,
            EstadoNuevo = equipo.Estado,
            FechaMovimiento = DateTime.UtcNow,
            Detalle = $"Actualización de datos del equipo '{equipo.Nombre}' ({equipo.CodigoPatrimonial})."
        }, ct);

        await unitOfWork.SaveChangesAsync(ct);

        return MapToDto(equipo);
    }

    public async Task<EquipoDto> UpdateEstadoAsync(Guid id, UpdateEstadoEquipoDto dto, Guid actorId, CancellationToken ct = default)
    {
        var equipo = await equipoRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Equipo tecnológico no encontrado.");

        if (equipo.Estado == EstadoEquipo.Prestado && dto.Estado != EstadoEquipo.Prestado)
        {
            throw new BusinessRuleException("No se puede cambiar manualmente el estado de un equipo que tiene un préstamo activo. Registre primero la devolución.");
        }

        if (dto.Estado == EstadoEquipo.Prestado && equipo.Estado != EstadoEquipo.Prestado)
        {
            throw new BusinessRuleException("El estado 'Prestado' solo puede asignarse al aprobar un préstamo.");
        }

        var estadoAnterior = equipo.Estado;
        if (estadoAnterior == dto.Estado)
        {
            return MapToDto(equipo);
        }

        equipo.Estado = dto.Estado;
        equipoRepository.Update(equipo);

        var motivo = string.IsNullOrWhiteSpace(dto.Motivo) ? "Sin motivo especificado." : dto.Motivo.Trim();
        await movimientoRepository.AddAsync(new MovimientoEquipo
        {
            EquipoId = equipo.Id,
            UsuarioResponsableId = actorId,
            TipoMovimiento = TipoMovimiento.CambioEstado,
            EstadoAnterior = estadoAnterior,
            EstadoNuevo = dto.Estado,
            FechaMovimiento = DateTime.UtcNow,
            Detalle = $"Cambio de estado de {estadoAnterior} a {dto.Estado}. {motivo}"
        }, ct);

        await unitOfWork.SaveChangesAsync(ct);

        return MapToDto(equipo);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var equipo = await equipoRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Equipo tecnológico no encontrado.");

        // RN-06: No se puede eliminar un equipo con historial de préstamos.
        if (await equipoRepository.HasPrestamosAsync(id, ct))
        {
            throw new ConflictException("No se puede eliminar un equipo que cuenta con historial de préstamos. Considere cambiar su estado a 'Baja'.");
        }

        equipoRepository.Remove(equipo);
        await unitOfWork.SaveChangesAsync(ct);
    }

    private static EquipoDto MapToDto(Equipo equipo) => new()
    {
        Id = equipo.Id,
        CodigoPatrimonial = equipo.CodigoPatrimonial,
        Nombre = equipo.Nombre,
        Categoria = equipo.Categoria,
        Marca = equipo.Marca,
        Ubicacion = equipo.Ubicacion,
        Estado = equipo.Estado,
        FechaRegistro = equipo.FechaRegistro
    };
}
