using Innovatech.Application.DTOs.Auth;
using Innovatech.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Innovatech.API.Controllers;

[Route("api/[controller]")]
public class AuthController(IAuthService authService) : BaseApiController
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request, CancellationToken ct)
    {
        var response = await authService.LoginAsync(request, ct);
        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthUserDto>> Me(CancellationToken ct)
    {
        var user = await authService.GetCurrentUserAsync(CurrentUserId, ct);
        return Ok(user);
    }
}
