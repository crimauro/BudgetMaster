@echo off
echo === Configurando Base de Datos BudgetMaster ===

cd /d "c:\Source\BudgetMaster"

echo.
echo 1. Compilando la solucion...
dotnet build

echo.
echo 2. Instalando herramientas EF (si no estan instaladas)...
dotnet tool install --global dotnet-ef --skip-existing

echo.
echo 3. Creando migracion inicial...
dotnet ef migrations add InitialCreate --project BudgetMaster_Backend\BudgetMaster.Infrastructure --startup-project BudgetMaster_Backend\BudgetMaster.API

echo.
echo 4. Aplicando migracion a la base de datos...
dotnet ef database update --project BudgetMaster_Backend\BudgetMaster.Infrastructure --startup-project BudgetMaster_Backend\BudgetMaster.API

echo.
echo 5. Base de datos configurada exitosamente!
echo    Base de datos: BudgetMasterDB
echo    Servidor: localhost
echo    Usuario: sa

echo.
echo 6. Iniciando la aplicacion...
cd BudgetMaster_Backend\BudgetMaster.API
dotnet run

pause
