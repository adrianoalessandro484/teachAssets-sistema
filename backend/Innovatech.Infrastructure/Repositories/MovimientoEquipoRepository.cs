using Innovatech.Application.DTOs.Reportes;
using Innovatech.Application.Interfaces;
using Innovatech.Domain.Entities;
using Innovatech.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Innovatech.Infrastructure.Repositories;

public class MovimientoEquipoRepository(AppDbContext context) : IMovimientoEquipoRepository
{
    public async Task<IReadOnlyList<MovimientoEquipo>> GetAllWithDetailsAsync(
        MovimientoFilterDto filter,
        CancellationToken ct = default)
    {
        var query = context.MovimientosEquipos
            .AsNoTracking()
            .Include(m => m.Equipo)
            .Include(m => m.UsuarioResponsable)
            .AsQueryable();

        if (filter.EquipoId.HasValue)
        {
            query = query.Where(m => m.EquipoId == filter.EquipoId.Value);
        }

        if (filter.TipoMovimiento.HasValue)
        {
            query = query.Where(m => m.TipoMovimiento == filter.TipoMovimiento.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var term = filter.Search.Trim().ToLower();
            query = query.Where(m =>
                m.Equipo.CodigoPatrimonial.ToLower().Contains(term) ||
                m.Equipo.Nombre.ToLower().Contains(term) ||
                m.Detalle.ToLower().Contains(term));
        }

        return await query
            .OrderByDescending(m => m.FechaMovimiento)
            .ToListAsync(ct);
    }

    public async Task AddAsync(MovimientoEquipo movimiento, CancellationToken ct = default)
        => await context.MovimientosEquipos.AddAsync(movimiento, ct);
}
