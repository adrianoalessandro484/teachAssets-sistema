using Innovatech.Application.DTOs.Usuarios;
using Innovatech.Application.Interfaces;
using Innovatech.Domain.Entities;
using Innovatech.Domain.Enums;
using Innovatech.Domain.Exceptions;

namespace Innovatech.Application.Services;

public class UsuarioService(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork) : IUsuarioService
{
    public async Task<IReadOnlyList<UsuarioDto>> GetAllAsync(UsuarioFilterDto filter, CancellationToken ct = default)
    {
        var usuarios = await usuarioRepository.GetAllAsync(filter, ct);
        return usuarios.Select(MapToDto).ToList();
    }

    public async Task<UsuarioDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var usuario = await usuarioRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Usuario no encontrado.");
        return MapToDto(usuario);
    }

    public async Task<UsuarioDto> CreateAsync(CreateUsuarioDto dto, CancellationToken ct = default)
    {
        var correo = dto.Correo.Trim().ToLowerInvariant();

        // RN-08: El correo electrónico del usuario debe ser único.
        if (await usuarioRepository.ExistsByCorreoAsync(correo, null, ct))
        {
            throw new ConflictException($"Ya existe un usuario registrado con el correo '{correo}'.");
        }

        var usuario = new Usuario
        {
            Nombres = dto.Nombres.Trim(),
            Apellidos = dto.Apellidos.Trim(),
            Correo = correo,
            PasswordHash = passwordHasher.Hash(dto.Password),
            Area = dto.Area.Trim(),
            Rol = dto.Rol,
            Estado = true,
            FechaCreacion = DateTime.UtcNow
        };

        await usuarioRepository.AddAsync(usuario, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return MapToDto(usuario);
    }

    public async Task<UsuarioDto> UpdateAsync(Guid id, UpdateUsuarioDto dto, CancellationToken ct = default)
    {
        var usuario = await usuarioRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Usuario no encontrado.");

        var correo = dto.Correo.Trim().ToLowerInvariant();

        // RN-08: El correo electrónico del usuario debe ser único.
        if (await usuarioRepository.ExistsByCorreoAsync(correo, id, ct))
        {
            throw new ConflictException($"Ya existe otro usuario registrado con el correo '{correo}'.");
        }

        usuario.Nombres = dto.Nombres.Trim();
        usuario.Apellidos = dto.Apellidos.Trim();
        usuario.Correo = correo;
        usuario.Area = dto.Area.Trim();
        usuario.Rol = dto.Rol;

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            usuario.PasswordHash = passwordHasher.Hash(dto.Password);
        }

        usuarioRepository.Update(usuario);
        await unitOfWork.SaveChangesAsync(ct);

        return MapToDto(usuario);
    }

    public async Task<UsuarioDto> SetEstadoAsync(
        Guid id,
        bool activo,
        RolUsuario actorRol,
        Guid actorId,
        CancellationToken ct = default)
    {
        // RN-09: Solo el Administrador podrá deshabilitar usuarios.
        if (actorRol != RolUsuario.Administrador)
        {
            throw new ForbiddenException("Solo el Administrador puede habilitar o deshabilitar usuarios.");
        }

        if (!activo && id == actorId)
        {
            throw new BusinessRuleException("No puedes deshabilitar tu propia cuenta de Administrador mientras estás autenticado.");
        }

        var usuario = await usuarioRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Usuario no encontrado.");

        usuario.Estado = activo;
        usuarioRepository.Update(usuario);
        await unitOfWork.SaveChangesAsync(ct);

        return MapToDto(usuario);
    }

    private static UsuarioDto MapToDto(Usuario usuario) => new()
    {
        Id = usuario.Id,
        Nombres = usuario.Nombres,
        Apellidos = usuario.Apellidos,
        NombreCompleto = $"{usuario.Nombres} {usuario.Apellidos}".Trim(),
        Correo = usuario.Correo,
        Area = usuario.Area,
        Rol = usuario.Rol,
        Estado = usuario.Estado,
        FechaCreacion = usuario.FechaCreacion
    };
}
