using Innovatech.Application.DTOs.Auth;
using Innovatech.Application.DTOs.Equipos;
using Innovatech.Application.DTOs.Prestamos;
using Innovatech.Application.DTOs.Reportes;
using Innovatech.Application.DTOs.Usuarios;
using Innovatech.Domain.Enums;

namespace Innovatech.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken ct = default);
    Task<AuthUserDto> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
}

public interface IUsuarioService
{
    Task<IReadOnlyList<UsuarioDto>> GetAllAsync(UsuarioFilterDto filter, CancellationToken ct = default);
    Task<UsuarioDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<UsuarioDto> CreateAsync(CreateUsuarioDto dto, CancellationToken ct = default);
    Task<UsuarioDto> UpdateAsync(Guid id, UpdateUsuarioDto dto, CancellationToken ct = default);
    Task<UsuarioDto> SetEstadoAsync(Guid id, bool activo, RolUsuario actorRol, Guid actorId, CancellationToken ct = default);
}

public interface IEquipoService
{
    Task<IReadOnlyList<EquipoDto>> GetAllAsync(EquipoFilterDto filter, CancellationToken ct = default);
    Task<EquipoDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<EquipoDto> CreateAsync(CreateEquipoDto dto, Guid actorId, CancellationToken ct = default);
    Task<EquipoDto> UpdateAsync(Guid id, UpdateEquipoDto dto, Guid actorId, CancellationToken ct = default);
    Task<EquipoDto> UpdateEstadoAsync(Guid id, UpdateEstadoEquipoDto dto, Guid actorId, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

public interface IPrestamoService
{
    Task<IReadOnlyList<PrestamoDto>> GetAllAsync(PrestamoFilterDto filter, Guid actorId, RolUsuario actorRol, CancellationToken ct = default);
    Task<PrestamoDto> GetByIdAsync(Guid id, Guid actorId, RolUsuario actorRol, CancellationToken ct = default);
    Task<PrestamoDto> SolicitarAsync(SolicitarPrestamoDto dto, Guid solicitanteId, CancellationToken ct = default);
    Task<PrestamoDto> AprobarAsync(Guid id, Guid responsableId, CancellationToken ct = default);
    Task<PrestamoDto> RechazarAsync(Guid id, RechazarPrestamoDto dto, Guid responsableId, CancellationToken ct = default);
    Task<PrestamoDto> RegistrarDevolucionAsync(Guid id, RegistrarDevolucionDto dto, Guid responsableId, CancellationToken ct = default);
}

public interface IReporteService
{
    Task<DashboardDto> GetDashboardAsync(CancellationToken ct = default);
    Task<IReadOnlyList<EquiposPorEstadoDto>> GetEquiposPorEstadoAsync(CancellationToken ct = default);
    Task<IReadOnlyList<EquipoMasUtilizadoDto>> GetEquiposMasUtilizadosAsync(int top = 10, CancellationToken ct = default);
    Task<IReadOnlyList<PrestamosPorAreaDto>> GetPrestamosPorAreaAsync(CancellationToken ct = default);
    Task<IReadOnlyList<MovimientoEquipoDto>> GetHistorialMovimientosAsync(MovimientoFilterDto filter, CancellationToken ct = default);
}
