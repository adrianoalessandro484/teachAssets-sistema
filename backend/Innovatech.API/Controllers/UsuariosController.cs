using Innovatech.Application.DTOs.Usuarios;
using Innovatech.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Innovatech.API.Controllers;

[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class UsuariosController(IUsuarioService usuarioService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UsuarioDto>>> GetAll([FromQuery] UsuarioFilterDto filter, CancellationToken ct)
    {
        var result = await usuarioService.GetAllAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UsuarioDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await usuarioService.GetByIdAsync(id, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> Create([FromBody] CreateUsuarioDto dto, CancellationToken ct)
    {
        var created = await usuarioService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UsuarioDto>> Update(Guid id, [FromBody] UpdateUsuarioDto dto, CancellationToken ct)
    {
        var updated = await usuarioService.UpdateAsync(id, dto, ct);
        return Ok(updated);
    }

    // RN-09: Solo el Administrador podrá deshabilitar usuarios.
    [HttpPatch("{id:guid}/estado")]
    public async Task<ActionResult<UsuarioDto>> SetEstado(Guid id, [FromQuery] bool activo, CancellationToken ct)
    {
        var updated = await usuarioService.SetEstadoAsync(id, activo, CurrentUserRole, CurrentUserId, ct);
        return Ok(updated);
    }
}
