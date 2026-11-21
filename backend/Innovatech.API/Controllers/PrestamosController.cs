using Innovatech.Application.DTOs.Prestamos;
using Innovatech.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Innovatech.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class PrestamosController(IPrestamoService prestamoService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PrestamoDto>>> GetAll([FromQuery] PrestamoFilterDto filter, CancellationToken ct)
    {
        var result = await prestamoService.GetAllAsync(filter, CurrentUserId, CurrentUserRole, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PrestamoDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await prestamoService.GetByIdAsync(id, CurrentUserId, CurrentUserRole, ct);
        return Ok(result);
    }

    [HttpPost("solicitar")]
    public async Task<ActionResult<PrestamoDto>> Solicitar([FromBody] SolicitarPrestamoDto dto, CancellationToken ct)
    {
        var created = await prestamoService.SolicitarAsync(dto, CurrentUserId, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("{id:guid}/aprobar")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<PrestamoDto>> Aprobar(Guid id, CancellationToken ct)
    {
        var updated = await prestamoService.AprobarAsync(id, CurrentUserId, ct);
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/rechazar")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<PrestamoDto>> Rechazar(Guid id, [FromBody] RechazarPrestamoDto dto, CancellationToken ct)
    {
        var updated = await prestamoService.RechazarAsync(id, dto, CurrentUserId, ct);
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/devolver")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<PrestamoDto>> RegistrarDevolucion(Guid id, [FromBody] RegistrarDevolucionDto dto, CancellationToken ct)
    {
        var updated = await prestamoService.RegistrarDevolucionAsync(id, dto, CurrentUserId, ct);
        return Ok(updated);
    }
}
