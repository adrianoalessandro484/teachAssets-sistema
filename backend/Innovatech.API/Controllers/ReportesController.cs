using Innovatech.Application.DTOs.Reportes;
using Innovatech.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Innovatech.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class ReportesController(IReporteService reporteService) : BaseApiController
{
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardDto>> GetDashboard(CancellationToken ct)
    {
        var result = await reporteService.GetDashboardAsync(ct);
        return Ok(result);
    }

    [HttpGet("equipos-por-estado")]
    public async Task<ActionResult<IReadOnlyList<EquiposPorEstadoDto>>> GetEquiposPorEstado(CancellationToken ct)
    {
        var result = await reporteService.GetEquiposPorEstadoAsync(ct);
        return Ok(result);
    }

    [HttpGet("equipos-mas-utilizados")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<IReadOnlyList<EquipoMasUtilizadoDto>>> GetEquiposMasUtilizados([FromQuery] int top = 10, CancellationToken ct = default)
    {
        var result = await reporteService.GetEquiposMasUtilizadosAsync(top, ct);
        return Ok(result);
    }

    [HttpGet("prestamos-por-area")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<IReadOnlyList<PrestamosPorAreaDto>>> GetPrestamosPorArea(CancellationToken ct)
    {
        var result = await reporteService.GetPrestamosPorAreaAsync(ct);
        return Ok(result);
    }

    [HttpGet("movimientos")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<IReadOnlyList<MovimientoEquipoDto>>> GetHistorialMovimientos([FromQuery] MovimientoFilterDto filter, CancellationToken ct)
    {
        var result = await reporteService.GetHistorialMovimientosAsync(filter, ct);
        return Ok(result);
    }
}
