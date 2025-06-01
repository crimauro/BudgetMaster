using Microsoft.EntityFrameworkCore;
using BudgetMaster.Domain.Entities;
using BudgetMaster.Domain.Enums;
using BudgetMaster.Infrastructure.Data;

namespace BudgetMaster.Infrastructure.Data
{
    public static class SeedData
    {        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // Asegurar que la base de datos existe
            await context.Database.EnsureCreatedAsync();

            // Crear usuario administrador si no existe
            if (!await context.Users.AnyAsync(u => u.Username == "admin"))
            {
                var adminUser = new User
                {
                    Username = "admin",
                    Email = "admin@budgetmaster.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin"), // En producción usar un hash más seguro
                    FirstName = "Administrador",
                    LastName = "Sistema",
                    DocumentType = DocumentType.DNI,
                    DocumentNumber = "12345678",
                    CreatedDate = DateTime.UtcNow,
                    IsActive = true
                };

                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
            }

            // Obtener el usuario admin para asignar los fondos
            var adminUserId = await context.Users
                .Where(u => u.Username == "admin")
                .Select(u => u.Id)
                .FirstOrDefaultAsync();

            // Crear tipos de gastos básicos si no existen
            var defaultExpenseTypes = new[]
            {
                new { Name = "Alimentación", Description = "Gastos en comida y bebidas" },
                new { Name = "Transporte", Description = "Gastos en movilidad y combustible" },
                new { Name = "Vivienda", Description = "Gastos de alquiler, servicios básicos" },
                new { Name = "Salud", Description = "Gastos médicos y farmacia" },
                new { Name = "Educación", Description = "Gastos educativos y capacitación" },
                new { Name = "Entretenimiento", Description = "Gastos en ocio y diversión" },
                new { Name = "Ropa", Description = "Gastos en vestimenta" },
                new { Name = "Servicios", Description = "Servicios profesionales y técnicos" },
                new { Name = "Otros", Description = "Gastos varios no categorizados" }
            };

            foreach (var expenseType in defaultExpenseTypes)
            {
                if (!await context.ExpenseTypes.AnyAsync(et => et.Name == expenseType.Name))
                {
                    context.ExpenseTypes.Add(new ExpenseType
                    {
                        Name = expenseType.Name,
                        Description = expenseType.Description,
                        CreatedDate = DateTime.UtcNow,
                        IsActive = true
                    });
                }
            }            // Crear fondos monetarios básicos si no existen
            var defaultMonetaryFunds = new[]
            {
                new { Name = "Efectivo", Description = "Dinero en efectivo", InitialBalance = 0m },
                new { Name = "Cuenta Corriente", Description = "Cuenta bancaria corriente", InitialBalance = 0m },
                new { Name = "Cuenta de Ahorros", Description = "Cuenta bancaria de ahorros", InitialBalance = 0m },
                new { Name = "Tarjeta de Crédito", Description = "Gastos con tarjeta de crédito", InitialBalance = 0m }
            };

            foreach (var fund in defaultMonetaryFunds)
            {
                if (!await context.MonetaryFunds.AnyAsync(mf => mf.Name == fund.Name && mf.UserId == adminUserId))
                {
                    context.MonetaryFunds.Add(new MonetaryFund
                    {
                        Name = fund.Name,
                        Description = fund.Description,
                        InitialBalance = fund.InitialBalance,
                        UserId = adminUserId,
                        CreatedDate = DateTime.UtcNow,
                        IsActive = true
                    });
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
