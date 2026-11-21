using Innovatech.Domain.Enums;

namespace Innovatech.Domain.Entities;

/// <summary>
/// Registra la trazabilidad histórica de altas, cambios de estado, préstamos y devoluciones de equipos.
/// </summary>
public class MovimientoEquipo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EquipoId { get; set; }
    public Equipo Equipo { get; set; } = null!;

    public Guid? UsuarioResponsableId { get; set; }
    public Usuario? UsuarioResponsable { get; set; }

    public TipoMovimiento TipoMovimiento { get; set; }
    public EstadoEquipo? EstadoAnterior { get; set; }
    public EstadoEquipo EstadoNuevo { get; set; }
    public DateTime FechaMovimiento { get; set; } = DateTime.UtcNow;
    public string Detalle { get; set; } = string.Empty;
}
