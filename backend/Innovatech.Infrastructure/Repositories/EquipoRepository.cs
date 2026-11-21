using Innovatech.Application.DTOs.Equipos;
using Innovatech.Application.Interfaces;
using Innovatech.Domain.Entities;
using Innovatech.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Innovatech.Infrastructure.Repositories;

public class EquipoRepository(AppDbContext context) : IEquipoRepository
{
    public Task<Equipo?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.Equipos.FirstOrDefaultAsync(e => e.Id == id, ct);

    public Task<bool> ExistsByCodigoAsync(string codigoPatrimonial, Guid? excludeId = null, CancellationToken ct = default)
    {
        var normalized = codigoPatrimonial.Trim().ToUpper();
        return context.Equipos.AnyAsync(
            e => e.CodigoPatrimonial.ToUpper() == normalized && (!excludeId.HasValue || e.Id != excludeId.Value),
            ct);
    }

    public Task<bool> HasPrestamosAsync(Guid equipoId, CancellationToken ct = default)
        => context.Prestamos.AnyAsync(p => p.EquipoId == equipoId, ct);

    public async Task<IReadOnlyList<Equipo>> GetAllAsync(EquipoFilterDto filter, CancellationToken ct = default)
    {
        var query = context.Equipos.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var term = filter.Search.Trim().ToLower();
            query = query.Where(e =>
                e.CodigoPatrimonial.ToLower().Contains(term) ||
                e.Nombre.ToLower().Contains(term) ||
                e.Marca.ToLower().Contains(term) ||
                e.Ubicacion.ToLower().Contains(term));
        }

        if (filter.Categoria.HasValue)
        {
            query = query.Where(e => e.Categoria == filter.Categoria.Value);
        }

        if (filter.Estado.HasValue)
        {
            query = query.Where(e => e.Estado == filter.Estado.Value);
        }

        return await query
            .OrderByDescending(e => e.FechaRegistro)
            .ToListAsync(ct);
    }

    public async Task AddAsync(Equipo equipo, CancellationToken ct = default)
        => await context.Equipos.AddAsync(equipo, ct);

    public void Update(Equipo equipo)
        => context.Equipos.Update(equipo);

    public void Remove(Equipo equipo)
        => context.Equipos.Remove(equipo);
}
