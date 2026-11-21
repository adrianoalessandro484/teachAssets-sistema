using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Innovatech.Application.Interfaces;
using Innovatech.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Innovatech.Infrastructure.Auth;

public class JwtProvider(IConfiguration configuration) : IJwtProvider
{
    public (string Token, DateTime Expiration) GenerateToken(Usuario usuario)
    {
        var key = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("No se ha configurado 'Jwt:Key' en appsettings.");
        var issuer = configuration["Jwt:Issuer"] ?? "Innovatech.TechAsset";
        var audience = configuration["Jwt:Audience"] ?? "Innovatech.TechAsset.Client";
        var expirationMinutes = int.TryParse(configuration["Jwt:ExpirationMinutes"], out var mins) ? mins : 480;

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, usuario.Correo),
            new(ClaimTypes.Name, $"{usuario.Nombres} {usuario.Apellidos}".Trim()),
            new(ClaimTypes.Role, usuario.Rol.ToString()),
            new("area", usuario.Area)
        };

        var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiration,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiration);
    }
}
