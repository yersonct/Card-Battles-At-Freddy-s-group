# 🎮 === INICIO RÁPIDO CARD BATTLES AT FREDDY'S ===

Write-Host "🎮 === INICIO RÁPIDO CARD BATTLES AT FREDDY'S ===" -ForegroundColor Cyan
Write-Host ""

$projectPath = "c:\Users\bscl\Desktop\Proyectos 2025\Bootcam\Card-Battles-At-Freddy-s-group"

Write-Host "📋 Opciones disponibles:" -ForegroundColor Yellow
Write-Host "1. 🚀 Iniciar Backend" -ForegroundColor White
Write-Host "2. 🔄 Reiniciar Backend (con cambios)" -ForegroundColor White
Write-Host "3. 🌐 Abrir Página de Prueba Completa" -ForegroundColor White
Write-Host "4. 🔍 Abrir Página de Diagnóstico" -ForegroundColor White
Write-Host "5. 📊 Ejecutar Diagnóstico Terminal" -ForegroundColor White
Write-Host "6. 🎯 Todo (Reiniciar Backend + Página)" -ForegroundColor White
Write-Host ""

$opcion = Read-Host "Selecciona una opción (1-6)"

switch ($opcion) {
    "1" {
        Write-Host "🚀 Iniciando Backend..." -ForegroundColor Cyan
        Set-Location "$projectPath\Backend\Web"
        dotnet run
    }
    "2" {
        Write-Host "🔄 Reiniciando Backend..." -ForegroundColor Cyan
        & "$projectPath\reiniciar-backend.ps1"
    }
    "3" {
        Write-Host "🌐 Abriendo Página de Prueba Completa..." -ForegroundColor Cyan
        $htmlPath = "$projectPath\Frontend\html\PruebaCompleta.html"
        Start-Process $htmlPath
        Write-Host "✅ Página abierta en el navegador" -ForegroundColor Green
    }
    "4" {
        Write-Host "🔍 Abriendo Página de Diagnóstico..." -ForegroundColor Cyan
        $htmlPath = "$projectPath\Frontend\html\Diagnostico.html"
        Start-Process $htmlPath
        Write-Host "✅ Página abierta en el navegador" -ForegroundColor Green
    }
    "5" {
        Write-Host "📊 Ejecutando Diagnóstico Terminal..." -ForegroundColor Cyan
        Set-Location $projectPath
        node Frontend/js/diagnostico-terminal.js
    }
    "6" {
        Write-Host "🎯 Iniciando todo..." -ForegroundColor Cyan
        
        # Abrir página de prueba
        $htmlPath = "$projectPath\Frontend\html\PruebaCompleta.html"
        Start-Process $htmlPath
        Write-Host "✅ Página de prueba abierta" -ForegroundColor Green
        
        Start-Sleep -Seconds 2
        
        # Reiniciar backend
        Write-Host "� Reiniciando Backend con cambios..." -ForegroundColor Cyan
        & "$projectPath\reiniciar-backend.ps1"
    }
    default {
        Write-Host "❌ Opción no válida" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Script completado" -ForegroundColor Green
Read-Host "Presiona Enter para salir"
