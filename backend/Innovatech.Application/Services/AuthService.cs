using Innovatech.Application.DTOs.Auth;
using Innovatech.Application.Interfaces;
using Innovatech.Domain.Exceptions;

namespace Innovatech.Application.Services;

public class AuthService(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    IJwtProvider jwtProvider) : IAuthService
{
    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken ct = default)
    {
        var correoNormalizado = request.Correo.Trim().ToLowerInvariant();
        var usuario = await usuarioRepository.GetByCorreoAsync(correoNormalizado, ct);

        if (usuario is null || !passwordHasher.Verify(request.Password, usuario.PasswordHash))
        {
            throw new UnauthorizedException("Correo electrónico o contraseña incorrectos.");
        }

        if (!usuario.Estado)
        {
            throw new ForbiddenException("Su cuenta se encuentra deshabilitada. Contacte al Administrador.");
        }

        var (token, expiration) = jwtProvider.GenerateToken(usuario);

        return new LoginResponseDto
        {
            Token = token,
            Expiration = expiration,
            Usuario = new AuthUserDto
            {
                Id = usuario.Id,
                Nombres = usuario.Nombres,
                Apellidos = usuario.Apellidos,
                Correo = usuario.Correo,
                Area = usuario.Area,
                Rol = usuario.Rol,
                Estado = usuario.Estado
            }
        };
    }

    public async Task<AuthUserDto> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var usuario = await usuarioRepository.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("Usuario no encontrado.");

        if (!usuario.Estado)
        {
            throw new ForbiddenException("Su cuenta se encuentra deshabilitada.");
        }

        return new AuthUserDto
        {
            Id = usuario.Id,
            Nombres = usuario.Nombres,
            Apellidos = usuario.Apellidos,
            Correo = usuario.Correo,
            Area = usuario.Area,
            Rol = usuario.Rol,
            Estado = usuario.Estado
        };
    }
}
