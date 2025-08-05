# 🔍 === SCRIPT DE INICIO BACKEND CARD BATTLES AT FREDDY'S ===

Write-Host "🔍 === INICIANDO BACKEND CARD BATTLES AT FREDDY'S ===" -ForegroundColor Cyan
Write-Host ""

# Navegar al directorio del backend
$backendPath = "c:\Users\bscl\Desktop\Proyectos 2025\Bootcam\Card-Battles-At-Freddy-s-group\Backend\Web"
Set-Location $backendPath

Write-Host "📁 Directorio actual: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Verificar archivos necesarios
Write-Host "🔍 Verificando archivos necesarios..." -ForegroundColor Cyan

if (Test-Path "Program.cs") {
    Write-Host "✅ Program.cs encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Program.cs no encontrado" -ForegroundColor Red
    Read-Host "Presiona Enter para continuar"
    exit 1
}

if (Test-Path "Web.csproj") {
    Write-Host "✅ Web.csproj encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Web.csproj no encontrado" -ForegroundColor Red
    Read-Host "Presiona Enter para continuar"
    exit 1
}

# Verificar .NET SDK
Write-Host ""
Write-Host "🔍 Verificando .NET SDK..." -ForegroundColor Cyan

try {
    $dotnetVersion = dotnet --version
    Write-Host "✅ .NET SDK versión: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ .NET SDK no encontrado" -ForegroundColor Red
    Write-Host "💡 Instala .NET SDK desde: https://dotnet.microsoft.com/download" -ForegroundColor Yellow
    Read-Host "Presiona Enter para continuar"
    exit 1
}

# Restaurar dependencias
Write-Host ""
Write-Host "📦 Restaurando dependencias..." -ForegroundColor Cyan
try {
    dotnet restore
    Write-Host "✅ Dependencias restauradas" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error al restaurar dependencias, continuando..." -ForegroundColor Yellow
}

# Verificar puerto 7147
Write-Host ""
Write-Host "🔍 Verificando si el puerto 7147 está en uso..." -ForegroundColor Cyan

$portInUse = Get-NetTCPConnection -LocalPort 7147 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️ Puerto 7147 ya está en uso" -ForegroundColor Yellow
    Write-Host "🔄 Intentando detener procesos en el puerto..." -ForegroundColor Cyan
    
    $processes = Get-Process | Where-Object { $_.ProcessName -like "*dotnet*" }
    if ($processes) {
        Write-Host "📋 Procesos dotnet encontrados:" -ForegroundColor Yellow
        $processes | Format-Table Id, ProcessName, CPU -AutoSize
        
        $response = Read-Host "¿Deseas terminar estos procesos? (s/n)"
        if ($response -eq "s" -or $response -eq "S") {
            $processes | Stop-Process -Force
            Write-Host "✅ Procesos terminados" -ForegroundColor Green
            Start-Sleep -Seconds 2
        }
    }
} else {
    Write-Host "✅ Puerto 7147 disponible" -ForegroundColor Green
}

# Iniciar backend
Write-Host ""
Write-Host "🚀 Iniciando backend..." -ForegroundColor Cyan
Write-Host "⏰ Esto puede tomar unos momentos..." -ForegroundColor Yellow
Write-Host "🌐 El backend estará disponible en: http://localhost:7147" -ForegroundColor Green
Write-Host "📄 Para ver la documentación API: http://localhost:7147/swagger" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️ IMPORTANTE: Mantén esta ventana abierta mientras usas la aplicación" -ForegroundColor Yellow
Write-Host "❌ Para detener el backend: Ctrl+C" -ForegroundColor Red
Write-Host ""

try {
    dotnet run
} catch {
    Write-Host ""
    Write-Host "❌ Error al iniciar el backend" -ForegroundColor Red
    Write-Host "💡 Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "   1. Verificar que la base de datos esté configurada" -ForegroundColor White
    Write-Host "   2. Revisar la cadena de conexión en appsettings.json" -ForegroundColor White
    Write-Host "   3. Verificar que MariaDB/MySQL esté ejecutándose" -ForegroundColor White
    Write-Host "   4. Revisar errores de dependencias en el proyecto" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para continuar"
}
