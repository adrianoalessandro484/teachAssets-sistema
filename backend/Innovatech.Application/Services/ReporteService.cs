using Innovatech.Application.DTOs.Equipos;
using Innovatech.Application.DTOs.Prestamos;
using Innovatech.Application.DTOs.Reportes;
using Innovatech.Application.Interfaces;
using Innovatech.Domain.Enums;

namespace Innovatech.Application.Services;

public class ReporteService(
    IEquipoRepository equipoRepository,
    IPrestamoRepository prestamoRepository,
    IMovimientoEquipoRepository movimientoRepository) : IReporteService
{
    public async Task<DashboardDto> GetDashboardAsync(CancellationToken ct = default)
    {
        var equipos = await equipoRepository.GetAllAsync(new EquipoFilterDto(), ct);
        var prestamos = await prestamoRepository.GetAllWithDetailsAsync(new PrestamoFilterDto(), ct);

        var prestamosValidos = prestamos
            .Where(p => p.Estado == EstadoPrestamo.Activo || p.Estado == EstadoPrestamo.Devuelto)
            .ToList();

        var topArea = prestamosValidos
            .GroupBy(p => p.Usuario.Area)
            .Select(g => new { Area = g.Key, Cantidad = g.Count() })
            .OrderByDescending(x => x.Cantidad)
            .FirstOrDefault();

        return new DashboardDto
        {
            TotalEquipos = equipos.Count,
            EquiposDisponibles = equipos.Count(e => e.Estado == EstadoEquipo.Disponible),
            EquiposPrestados = equipos.Count(e => e.Estado == EstadoEquipo.Prestado),
            EquiposMantenimiento = equipos.Count(e => e.Estado == EstadoEquipo.Mantenimiento),
            EquiposBaja = equipos.Count(e => e.Estado == EstadoEquipo.Baja),
            TotalPrestamos = prestamosValidos.Count,
            PrestamosPendientes = prestamos.Count(p => p.Estado == EstadoPrestamo.Pendiente),
            PrestamosActivos = prestamos.Count(p => p.Estado == EstadoPrestamo.Activo),
            AreaMayorUso = topArea?.Area ?? "Sin registros",
            AreaMayorUsoCantidad = topArea?.Cantidad ?? 0
        };
    }

    public async Task<IReadOnlyList<EquiposPorEstadoDto>> GetEquiposPorEstadoAsync(CancellationToken ct = default)
    {
        var equipos = await equipoRepository.GetAllAsync(new EquipoFilterDto(), ct);

        return Enum.GetValues<EstadoEquipo>()
            .Select(estado => new EquiposPorEstadoDto
            {
                Estado = estado,
                EstadoNombre = estado.ToString(),
                Cantidad = equipos.Count(e => e.Estado == estado)
            })
            .ToList();
    }

    public async Task<IReadOnlyList<EquipoMasUtilizadoDto>> GetEquiposMasUtilizadosAsync(int top = 10, CancellationToken ct = default)
    {
        var prestamos = await prestamoRepository.GetAllWithDetailsAsync(new PrestamoFilterDto(), ct);

        return prestamos
            .Where(p => p.Estado == EstadoPrestamo.Activo || p.Estado == EstadoPrestamo.Devuelto)
            .GroupBy(p => p.EquipoId)
            .Select(g =>
            {
                var eq = g.First().Equipo;
                return new EquipoMasUtilizadoDto
                {
                    EquipoId = eq.Id,
                    CodigoPatrimonial = eq.CodigoPatrimonial,
                    Nombre = eq.Nombre,
                    Categoria = eq.Categoria,
                    Marca = eq.Marca,
                    TotalPrestamos = g.Count()
                };
            })
            .OrderByDescending(x => x.TotalPrestamos)
            .Take(top)
            .ToList();
    }

    public async Task<IReadOnlyList<PrestamosPorAreaDto>> GetPrestamosPorAreaAsync(CancellationToken ct = default)
    {
        var prestamos = await prestamoRepository.GetAllWithDetailsAsync(new PrestamoFilterDto(), ct);

        return prestamos
            .Where(p => p.Estado == EstadoPrestamo.Activo || p.Estado == EstadoPrestamo.Devuelto)
            .GroupBy(p => p.Usuario.Area)
            .Select(g => new PrestamosPorAreaDto
            {
                Area = g.Key,
                TotalPrestamos = g.Count(),
                PrestamosActivos = g.Count(p => p.Estado == EstadoPrestamo.Activo)
            })
            .OrderByDescending(x => x.TotalPrestamos)
            .ToList();
    }

    public async Task<IReadOnlyList<MovimientoEquipoDto>> GetHistorialMovimientosAsync(
        MovimientoFilterDto filter,
        CancellationToken ct = default)
    {
        var movimientos = await movimientoRepository.GetAllWithDetailsAsync(filter, ct);

        return movimientos.Select(m => new MovimientoEquipoDto
        {
            Id = m.Id,
            EquipoId = m.EquipoId,
            EquipoCodigoPatrimonial = m.Equipo.CodigoPatrimonial,
            EquipoNombre = m.Equipo.Nombre,
            UsuarioResponsableId = m.UsuarioResponsableId,
            UsuarioResponsableNombre = m.UsuarioResponsable is null
                ? null
                : $"{m.UsuarioResponsable.Nombres} {m.UsuarioResponsable.Apellidos}".Trim(),
            TipoMovimiento = m.TipoMovimiento,
            EstadoAnterior = m.EstadoAnterior,
            EstadoNuevo = m.EstadoNuevo,
            FechaMovimiento = m.FechaMovimiento,
            Detalle = m.Detalle
        }).ToList();
    }
}
