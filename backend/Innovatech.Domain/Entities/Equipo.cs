using Innovatech.Domain.Enums;

namespace Innovatech.Domain.Entities;

/// <summary>
/// Representa un activo tecnológico perteneciente al inventario institucional.
/// </summary>
public class Equipo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CodigoPatrimonial { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public CategoriaEquipo Categoria { get; set; }
    public string Marca { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public EstadoEquipo Estado { get; set; } = EstadoEquipo.Disponible;
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    public ICollection<Prestamo> Prestamos { get; set; } = new List<Prestamo>();
    public ICollection<MovimientoEquipo> Movimientos { get; set; } = new List<MovimientoEquipo>();
}
