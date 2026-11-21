namespace Innovatech.Domain.Enums;

/// <summary>
/// Tipos de eventos registrados en el historial de movimientos de equipos.
/// </summary>
public enum TipoMovimiento
{
    Registro = 1,
    PrestamoAprobado = 2,
    Devolucion = 3,
    CambioEstado = 4,
    Actualizacion = 5
}
