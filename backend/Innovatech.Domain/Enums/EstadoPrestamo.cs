namespace Innovatech.Domain.Enums;

/// <summary>
/// Ciclo de vida de una solicitud o préstamo de equipo.
/// </summary>
public enum EstadoPrestamo
{
    Pendiente = 1,
    Activo = 2,
    Devuelto = 3,
    Rechazado = 4
}
