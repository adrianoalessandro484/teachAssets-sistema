using Innovatech.Application.Interfaces;
using Innovatech.Domain.Entities;
using Innovatech.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Innovatech.Infrastructure.Persistence;

/// <summary>
/// Carga datos iniciales de prueba para los 3 roles y el catálogo base de equipos.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        if (await context.Usuarios.AnyAsync())
        {
            return;
        }

        var admin = new Usuario
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Nombres = "Carlos",
            Apellidos = "Mendoza",
            Correo = "admin@innovatech.com",
            PasswordHash = passwordHasher.Hash("Admin123!"),
            Area = "Gerencia de TI",
            Rol = RolUsuario.Administrador,
            Estado = true,
            FechaCreacion = DateTime.UtcNow
        };

        var responsable = new Usuario
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Nombres = "Lucía",
            Apellidos = "Fernández",
            Correo = "responsable@innovatech.com",
            PasswordHash = passwordHasher.Hash("Resp123!"),
            Area = "Soporte Técnico",
            Rol = RolUsuario.ResponsableTecnologia,
            Estado = true,
            FechaCreacion = DateTime.UtcNow
        };

        var colaborador = new Usuario
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Nombres = "Diego",
            Apellidos = "Rojas",
            Correo = "colaborador@innovatech.com",
            PasswordHash = passwordHasher.Hash("Colab123!"),
            Area = "Desarrollo de Software",
            Rol = RolUsuario.Colaborador,
            Estado = true,
            FechaCreacion = DateTime.UtcNow
        };

        await context.Usuarios.AddRangeAsync(admin, responsable, colaborador);

        var equipos = new List<Equipo>
        {
            new()
            {
                CodigoPatrimonial = "INV-LAP-001",
                Nombre = "ThinkPad T14 Gen 4",
                Categoria = CategoriaEquipo.Laptop,
                Marca = "Lenovo",
                Ubicacion = "Almacén TI - Piso 3",
                Estado = EstadoEquipo.Disponible
            },
            new()
            {
                CodigoPatrimonial = "INV-LAP-002",
                Nombre = "Latitude 5440",
                Categoria = CategoriaEquipo.Laptop,
                Marca = "Dell",
                Ubicacion = "Almacén TI - Piso 3",
                Estado = EstadoEquipo.Disponible
            },
            new()
            {
                CodigoPatrimonial = "INV-MON-001",
                Nombre = "UltraSharp U2723QE 27\"",
                Categoria = CategoriaEquipo.Monitor,
                Marca = "Dell",
                Ubicacion = "Almacén TI - Piso 3",
                Estado = EstadoEquipo.Disponible
            },
            new()
            {
                CodigoPatrimonial = "INV-PRO-001",
                Nombre = "PowerLite E20",
                Categoria = CategoriaEquipo.ProyectorMultimedia,
                Marca = "Epson",
                Ubicacion = "Sala de Reuniones B",
                Estado = EstadoEquipo.Mantenimiento
            },
            new()
            {
                CodigoPatrimonial = "INV-TAB-001",
                Nombre = "iPad Air M2",
                Categoria = CategoriaEquipo.Tablet,
                Marca = "Apple",
                Ubicacion = "Almacén TI - Piso 2",
                Estado = EstadoEquipo.Disponible
            },
            new()
            {
                CodigoPatrimonial = "INV-RED-001",
                Nombre = "Catalyst 2960-X",
                Categoria = CategoriaEquipo.EquipoRed,
                Marca = "Cisco",
                Ubicacion = "Data Center",
                Estado = EstadoEquipo.Disponible
            }
        };

        await context.Equipos.AddRangeAsync(equipos);

        var movimientos = equipos.Select(e => new MovimientoEquipo
        {
            EquipoId = e.Id,
            UsuarioResponsableId = admin.Id,
            TipoMovimiento = TipoMovimiento.Registro,
            EstadoAnterior = null,
            EstadoNuevo = e.Estado,
            FechaMovimiento = DateTime.UtcNow,
            Detalle = $"Carga inicial de inventario: '{e.Nombre}' ({e.CodigoPatrimonial})."
        });

        await context.MovimientosEquipos.AddRangeAsync(movimientos);
        await context.SaveChangesAsync();
    }
}
