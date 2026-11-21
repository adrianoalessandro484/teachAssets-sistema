using Innovatech.Application.DTOs.Equipos;
using Innovatech.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Innovatech.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class EquiposController(IEquipoService equipoService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EquipoDto>>> GetAll([FromQuery] EquipoFilterDto filter, CancellationToken ct)
    {
        var result = await equipoService.GetAllAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EquipoDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await equipoService.GetByIdAsync(id, ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<EquipoDto>> Create([FromBody] CreateEquipoDto dto, CancellationToken ct)
    {
        var created = await equipoService.CreateAsync(dto, CurrentUserId, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<EquipoDto>> Update(Guid id, [FromBody] UpdateEquipoDto dto, CancellationToken ct)
    {
        var updated = await equipoService.UpdateAsync(id, dto, CurrentUserId, ct);
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/estado")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<EquipoDto>> UpdateEstado(Guid id, [FromBody] UpdateEstadoEquipoDto dto, CancellationToken ct)
    {
        var updated = await equipoService.UpdateEstadoAsync(id, dto, CurrentUserId, ct);
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await equipoService.DeleteAsync(id, ct);
        return NoContent();
    }
}
