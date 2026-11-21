using Innovatech.Application.DTOs.Usuarios;
using Innovatech.Application.Interfaces;
using Innovatech.Domain.Entities;
using Innovatech.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Innovatech.Infrastructure.Repositories;

public class UsuarioRepository(AppDbContext context) : IUsuarioRepository
{
    public Task<Usuario?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => context.Usuarios.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<Usuario?> GetByCorreoAsync(string correo, CancellationToken ct = default)
    {
        var normalized = correo.Trim().ToLower();
        return context.Usuarios.FirstOrDefaultAsync(u => u.Correo.ToLower() == normalized, ct);
    }

    public Task<bool> ExistsByCorreoAsync(string correo, Guid? excludeId = null, CancellationToken ct = default)
    {
        var normalized = correo.Trim().ToLower();
        return context.Usuarios.AnyAsync(
            u => u.Correo.ToLower() == normalized && (!excludeId.HasValue || u.Id != excludeId.Value),
            ct);
    }

    public async Task<IReadOnlyList<Usuario>> GetAllAsync(UsuarioFilterDto filter, CancellationToken ct = default)
    {
        var query = context.Usuarios.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var term = filter.Search.Trim().ToLower();
            query = query.Where(u =>
                u.Nombres.ToLower().Contains(term) ||
                u.Apellidos.ToLower().Contains(term) ||
                u.Correo.ToLower().Contains(term) ||
                u.Area.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(filter.Area))
        {
            var area = filter.Area.Trim().ToLower();
            query = query.Where(u => u.Area.ToLower().Contains(area));
        }

        if (filter.Rol.HasValue)
        {
            query = query.Where(u => u.Rol == filter.Rol.Value);
        }

        if (filter.Estado.HasValue)
        {
            query = query.Where(u => u.Estado == filter.Estado.Value);
        }

        return await query
            .OrderByDescending(u => u.FechaCreacion)
            .ToListAsync(ct);
    }

    public async Task AddAsync(Usuario usuario, CancellationToken ct = default)
        => await context.Usuarios.AddAsync(usuario, ct);

    public void Update(Usuario usuario)
        => context.Usuarios.Update(usuario);
}
