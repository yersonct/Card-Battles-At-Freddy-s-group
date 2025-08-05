# 🔍 SCRIPT DE DIAGNÓSTICO COMPLETO - Card Battles At Freddy's
# Ejecutar desde PowerShell para verificar el estado del sistema

Write-Host "🔍 === INICIANDO DIAGNÓSTICO DESDE POWERSHELL ===" -ForegroundColor Cyan

# Verificar si estamos en la carpeta correcta del proyecto
$rutaActual = Get-Location
Write-Host "📁 Ruta actual: $rutaActual" -ForegroundColor Yellow

# Lista de archivos esperados
$archivosEsperados = @(
    "Frontend\html\Partida.html",
    "Frontend\html\CrearSala.html", 
    "Frontend\js\Partida\Partida.js",
    "Frontend\js\Partida\GameFlowController.js",
    "Frontend\js\Partida\CardSelectionManager.js",
    "Frontend\js\Partida\TurnIndicator.js",
    "Frontend\js\Partida\BattleComparator.js",
    "Frontend\js\Partida\RankingFinalDisplay.js",
    "Frontend\css\Partida\GameLogic.css",
    "Backend\Web\Program.cs",
    "Backend\juego.sln"
)

# Resultado del diagnóstico
$resultado = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    archivos = @{}
    backend = @{}
    errores = @()
    recomendaciones = @()
}

Write-Host "📁 1. Verificando estructura de archivos..." -ForegroundColor Green

$archivosEncontrados = 0
$archivosFaltantes = @()

foreach ($archivo in $archivosEsperados) {
    $rutaCompleta = Join-Path $rutaActual $archivo
    $existe = Test-Path $rutaCompleta
    
    if ($existe) {
        $tamano = (Get-Item $rutaCompleta).Length
        $resultado.archivos[$archivo] = @{
            existe = $true
            tamano = $tamano
            ruta = $rutaCompleta
        }
        Write-Host "✅ $archivo - $tamano bytes" -ForegroundColor Green
        $archivosEncontrados++
    } else {
        $resultado.archivos[$archivo] = @{
            existe = $false
            ruta = $rutaCompleta
        }
        Write-Host "❌ $archivo - NO ENCONTRADO" -ForegroundColor Red
        $archivosFaltantes += $archivo
        $resultado.errores += "ARCHIVO_FALTANTE: $archivo"
    }
}

Write-Host "📊 Archivos encontrados: $archivosEncontrados de $($archivosEsperados.Count)" -ForegroundColor Cyan

if ($archivosFaltantes.Count -gt 0) {
    $resultado.recomendaciones += "1. Verificar que todos los archivos del proyecto estén presentes"
    Write-Host "⚠️ Archivos faltantes:" -ForegroundColor Yellow
    foreach ($faltante in $archivosFaltantes) {
        Write-Host "   - $faltante" -ForegroundColor Red
    }
}

Write-Host "`n📜 2. Verificando archivos JavaScript..." -ForegroundColor Green

$archivosJS = @(
    "Frontend\js\Partida\GameFlowController.js",
    "Frontend\js\Partida\CardSelectionManager.js", 
    "Frontend\js\Partida\TurnIndicator.js",
    "Frontend\js\Partida\BattleComparator.js",
    "Frontend\js\Partida\RankingFinalDisplay.js",
    "Frontend\js\Partida\Partida.js"
)

$jsValidos = 0

foreach ($archivoJS in $archivosJS) {
    $rutaJS = Join-Path $rutaActual $archivoJS
    
    if (Test-Path $rutaJS) {
        $contenido = Get-Content $rutaJS -Raw
        $lineas = ($contenido -split "`n").Count
        $clases = ([regex]::Matches($contenido, "class\s+\w+")).Count
        $funciones = ([regex]::Matches($contenido, "function\s+\w+")).Count
        
        # Verificaciones específicas
        $valido = $true
        $problemas = @()
        
        if ($archivoJS -like "*GameFlowController*") {
            if ($contenido -notlike "*class GameFlowController*") {
                $valido = $false
                $problemas += "Clase GameFlowController no encontrada"
            }
            if ($contenido -notlike "*init(*") {
                $valido = $false
                $problemas += "Método init() no encontrado"
            }
        }
        
        if ($archivoJS -like "*Partida.js") {
            if ($contenido -notlike "*class SalaBackend*") {
                $valido = $false
                $problemas += "Clase SalaBackend no encontrada"
            }
            if ($contenido -notlike "*window.debugInfo*") {
                $valido = $false
                $problemas += "Sistema de debugging no encontrado"
            }
        }
        
        if ($valido) {
            Write-Host "✅ $archivoJS - $lineas líneas, $clases clases, $funciones funciones" -ForegroundColor Green
            $jsValidos++
        } else {
            Write-Host "⚠️ $archivoJS - Problemas: $($problemas -join ', ')" -ForegroundColor Yellow
            $resultado.errores += "PROBLEMA_JS: $archivoJS - $($problemas -join ', ')"
        }
    } else {
        Write-Host "❌ $archivoJS - NO ENCONTRADO" -ForegroundColor Red
    }
}

Write-Host "📊 Archivos JS válidos: $jsValidos de $($archivosJS.Count)" -ForegroundColor Cyan

Write-Host "`n🌐 3. Verificando backend..." -ForegroundColor Green

$endpoints = @(
    "http://localhost:7147/api/partida",
    "http://localhost:7147/api/jugador", 
    "http://localhost:7147/api/carta",
    "http://localhost:7147/api/ronda"
)

$conexionesExitosas = 0

foreach ($endpoint in $endpoints) {
    $endpointName = ($endpoint -split "/")[-1]
    
    try {
        Write-Host "🌐 Probando: $endpoint" -ForegroundColor Cyan
        
        $response = Invoke-WebRequest -Uri $endpoint -Method GET -TimeoutSec 5 -ErrorAction Stop
        
        $resultado.backend[$endpointName] = @{
            status = $response.StatusCode
            ok = $response.StatusCode -eq 200
        }
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $endpointName : OK ($($response.StatusCode))" -ForegroundColor Green
            $conexionesExitosas++
        } else {
            Write-Host "⚠️ $endpointName : $($response.StatusCode)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ $endpointName : $($_.Exception.Message)" -ForegroundColor Red
        $resultado.backend[$endpointName] = @{
            error = $_.Exception.Message
            ok = $false
        }
        $resultado.errores += "BACKEND_ERROR: $endpoint - $($_.Exception.Message)"
    }
}

# Evaluar conexión general del backend
if ($conexionesExitosas -eq 0) {
    $resultado.backend.conexionGeneral = "FALLIDA"
    $resultado.recomendaciones += "2. Verificar que el backend esté ejecutándose en puerto 7147"
    $resultado.recomendaciones += "3. Ejecutar: cd Backend && dotnet run"
    Write-Host "❌ Backend completamente inaccesible" -ForegroundColor Red
} elseif ($conexionesExitosas -lt $endpoints.Count) {
    $resultado.backend.conexionGeneral = "PARCIAL"
    $resultado.recomendaciones += "4. Algunos endpoints del backend no responden correctamente"
    Write-Host "⚠️ Backend parcialmente accesible ($conexionesExitosas/$($endpoints.Count))" -ForegroundColor Yellow
} else {
    $resultado.backend.conexionGeneral = "EXITOSA"
    Write-Host "✅ Backend funcionando correctamente" -ForegroundColor Green
}

Write-Host "`n📊 4. Generando reporte final..." -ForegroundColor Green

# Calcular estado general
$tieneErroresCriticos = $resultado.errores | Where-Object { $_ -like "*ARCHIVO_FALTANTE*" -or $_ -like "*BACKEND_ERROR*" }
$estadoGeneral = if ($tieneErroresCriticos) { "CRITICO" } else { "ESTABLE" }

# Guardar reporte en archivo JSON
$reporteJson = $resultado | ConvertTo-Json -Depth 3
$rutaReporte = Join-Path $rutaActual "diagnostico-powershell.json"
$reporteJson | Out-File -FilePath $rutaReporte -Encoding UTF8

Write-Host "`n📊 === REPORTE FINAL ===" -ForegroundColor Cyan
Write-Host "🎯 Estado General: $estadoGeneral" -ForegroundColor $(if ($estadoGeneral -eq "CRITICO") { "Red" } else { "Green" })
Write-Host "⚠️ Errores Encontrados: $($resultado.errores.Count)" -ForegroundColor Yellow
Write-Host "💡 Recomendaciones: $($resultado.recomendaciones.Count)" -ForegroundColor Yellow
Write-Host "📁 Archivos verificados: $($resultado.archivos.Count)" -ForegroundColor Cyan
Write-Host "🌐 Backend: $($resultado.backend.conexionGeneral)" -ForegroundColor Cyan

if ($resultado.errores.Count -gt 0) {
    Write-Host "`n❌ ERRORES CRÍTICOS:" -ForegroundColor Red
    for ($i = 0; $i -lt $resultado.errores.Count; $i++) {
        Write-Host "$($i + 1). $($resultado.errores[$i])" -ForegroundColor Red
    }
}

if ($resultado.recomendaciones.Count -gt 0) {
    Write-Host "`n💡 RECOMENDACIONES:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $resultado.recomendaciones.Count; $i++) {
        Write-Host "$($i + 1). $($resultado.recomendaciones[$i])" -ForegroundColor Yellow
    }
}

Write-Host "`n💾 Reporte guardado en: $rutaReporte" -ForegroundColor Green
Write-Host "📋 Para ver reporte completo: Get-Content $rutaReporte | ConvertFrom-Json" -ForegroundColor Green

Write-Host "`n🎯 Diagnóstico completado" -ForegroundColor Cyan

# Salir con código de error si el estado es crítico
if ($estadoGeneral -eq "CRITICO") {
    exit 1
} else {
    exit 0
}
