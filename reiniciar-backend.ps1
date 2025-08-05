# 🔄 === REINICIAR BACKEND ===

Write-Host "🔄 === REINICIANDO BACKEND ===" -ForegroundColor Cyan
Write-Host ""

# Buscar y terminar procesos dotnet que estén ejecutando el backend
Write-Host "🔍 Buscando procesos del backend..." -ForegroundColor Yellow

$backendProcesses = Get-Process | Where-Object { 
    $_.ProcessName -eq "dotnet" -and 
    $_.MainModule.FileName -like "*Web*" 
} -ErrorAction SilentlyContinue

if ($backendProcesses) {
    Write-Host "🛑 Terminando procesos existentes..." -ForegroundColor Yellow
    $backendProcesses | Stop-Process -Force
    Start-Sleep -Seconds 3
    Write-Host "✅ Procesos terminados" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No se encontraron procesos del backend ejecutándose" -ForegroundColor Cyan
}

# Navegar al directorio del backend
$backendPath = "c:\Users\bscl\Desktop\Proyectos 2025\Bootcam\Card-Battles-At-Freddy-s-group\Backend\Web"
Set-Location $backendPath

Write-Host "📁 Directorio: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Compilar el proyecto para verificar errores
Write-Host "🔨 Compilando proyecto..." -ForegroundColor Cyan
$buildResult = dotnet build --no-restore 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilación exitosa" -ForegroundColor Green
} else {
    Write-Host "❌ Error en la compilación:" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    Write-Host ""
    Read-Host "Presiona Enter para continuar de todas formas"
}

Write-Host ""
Write-Host "🚀 Iniciando backend actualizado..." -ForegroundColor Cyan
Write-Host "🌐 Disponible en: http://localhost:7147" -ForegroundColor Green
Write-Host "📄 Swagger: http://localhost:7147/swagger" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️ NUEVO: Endpoint GET /api/partida agregado para verificación" -ForegroundColor Yellow
Write-Host ""

# Iniciar backend
dotnet run
