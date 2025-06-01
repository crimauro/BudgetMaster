# Script para configurar la base de datos BudgetMaster en SQL Server

Write-Host "=== Configuración de Base de Datos BudgetMaster ===" -ForegroundColor Green

# Cambiar al directorio del proyecto
Set-Location "c:\Source\BudgetMaster"

Write-Host "1. Compilando la solución..." -ForegroundColor Yellow
dotnet build

Write-Host "2. Creando migración inicial..." -ForegroundColor Yellow
dotnet ef migrations add InitialCreate --project BudgetMaster_Backend\BudgetMaster.Infrastructure --startup-project BudgetMaster_Backend\BudgetMaster.API

Write-Host "3. Aplicando migración a la base de datos..." -ForegroundColor Yellow
dotnet ef database update --project BudgetMaster_Backend\BudgetMaster.Infrastructure --startup-project BudgetMaster_Backend\BudgetMaster.API

Write-Host "4. Base de datos configurada exitosamente!" -ForegroundColor Green
Write-Host "Base de datos: BudgetMasterDB" -ForegroundColor Cyan
Write-Host "Servidor: localhost" -ForegroundColor Cyan
Write-Host "Usuario: sa" -ForegroundColor Cyan

Write-Host "5. Iniciando la aplicación..." -ForegroundColor Yellow
Set-Location "BudgetMaster_Backend\BudgetMaster.API"
dotnet run

Read-Host "Presiona Enter para continuar..."
