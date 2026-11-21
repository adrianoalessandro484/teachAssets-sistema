using System.Security.Claims;
using Innovatech.Domain.Enums;
using Innovatech.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Innovatech.API.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    protected Guid CurrentUserId
    {
        get
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (!Guid.TryParse(raw, out var userId))
            {
                throw new UnauthorizedException("Token inválido o sin identificador de usuario.");
            }

            return userId;
        }
    }

    protected RolUsuario CurrentUserRole
    {
        get
        {
            var raw = User.FindFirstValue(ClaimTypes.Role);
            if (!Enum.TryParse<RolUsuario>(raw, true, out var role))
            {
                throw new UnauthorizedException("Token inválido o sin rol asignado.");
            }

            return role;
        }
    }
}
