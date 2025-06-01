# Script para probar la API de BudgetMaster
Write-Host "=== Prueba de API BudgetMaster ===" -ForegroundColor Green

$baseUrl = "http://localhost:5050"

# 1. Test de autenticación
Write-Host "1. Probando autenticación con usuario admin/admin..." -ForegroundColor Yellow

$loginBody = @{
    username = "admin"
    password = "admin"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login exitoso!" -ForegroundColor Green
    Write-Host "Token obtenido: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Cyan
    
    $token = $loginResponse.token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # 2. Test de tipos de gastos
    Write-Host "2. Obteniendo tipos de gastos..." -ForegroundColor Yellow
    $expenseTypes = Invoke-RestMethod -Uri "$baseUrl/api/expensetypes" -Method GET -Headers $headers
    Write-Host "✅ Se encontraron $($expenseTypes.Count) tipos de gastos" -ForegroundColor Green
    
    # 3. Test de fondos monetarios
    Write-Host "3. Obteniendo fondos monetarios..." -ForegroundColor Yellow
    $monetaryFunds = Invoke-RestMethod -Uri "$baseUrl/api/monetaryfunds" -Method GET -Headers $headers
    Write-Host "✅ Se encontraron $($monetaryFunds.Count) fondos monetarios" -ForegroundColor Green
    
    Write-Host "🎉 Todas las pruebas pasaron exitosamente!" -ForegroundColor Green
    Write-Host "La base de datos está configurada correctamente en:" -ForegroundColor Cyan
    Write-Host "   Servidor: localhost" -ForegroundColor White
    Write-Host "   Base de datos: BudgetMasterDB" -ForegroundColor White
    Write-Host "   Usuario: sa" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error en las pruebas: $($_.Exception.Message)" -ForegroundColor Red
}

Read-Host "Presiona Enter para continuar..."
