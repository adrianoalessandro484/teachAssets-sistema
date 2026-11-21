using Innovatech.Application.DTOs.Equipos;
using Innovatech.Application.DTOs.Prestamos;
using Innovatech.Application.DTOs.Reportes;
using Innovatech.Application.DTOs.Usuarios;
using Innovatech.Domain.Entities;

namespace Innovatech.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Usuario?> GetByCorreoAsync(string correo, CancellationToken ct = default);
    Task<bool> ExistsByCorreoAsync(string correo, Guid? excludeId = null, CancellationToken ct = default);
    Task<IReadOnlyList<Usuario>> GetAllAsync(UsuarioFilterDto filter, CancellationToken ct = default);
    Task AddAsync(Usuario usuario, CancellationToken ct = default);
    void Update(Usuario usuario);
}

public interface IEquipoRepository
{
    Task<Equipo?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> ExistsByCodigoAsync(string codigoPatrimonial, Guid? excludeId = null, CancellationToken ct = default);
    Task<bool> HasPrestamosAsync(Guid equipoId, CancellationToken ct = default);
    Task<IReadOnlyList<Equipo>> GetAllAsync(EquipoFilterDto filter, CancellationToken ct = default);
    Task AddAsync(Equipo equipo, CancellationToken ct = default);
    void Update(Equipo equipo);
    void Remove(Equipo equipo);
}

public interface IPrestamoRepository
{
    Task<Prestamo?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default);
    Task<bool> HasActivePrestamoForEquipoAsync(Guid equipoId, CancellationToken ct = default);
    Task<IReadOnlyList<Prestamo>> GetAllWithDetailsAsync(PrestamoFilterDto filter, CancellationToken ct = default);
    Task AddAsync(Prestamo prestamo, CancellationToken ct = default);
    void Update(Prestamo prestamo);
}

public interface IMovimientoEquipoRepository
{
    Task<IReadOnlyList<MovimientoEquipo>> GetAllWithDetailsAsync(MovimientoFilterDto filter, CancellationToken ct = default);
    Task AddAsync(MovimientoEquipo movimiento, CancellationToken ct = default);
}

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string passwordHash);
}

public interface IJwtProvider
{
    (string Token, DateTime Expiration) GenerateToken(Usuario usuario);
}
