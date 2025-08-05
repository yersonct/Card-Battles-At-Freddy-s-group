@echo off
echo 🔍 === DIAGNÓSTICO RÁPIDO - Card Battles At Freddy's ===
echo.

echo 📁 Verificando archivos principales...
echo.

REM Verificar archivos HTML
if exist "Frontend\html\Partida.html" (
    echo ✅ Partida.html encontrado
) else (
    echo ❌ Partida.html NO encontrado
)

if exist "Frontend\html\CrearSala.html" (
    echo ✅ CrearSala.html encontrado
) else (
    echo ❌ CrearSala.html NO encontrado
)

echo.
echo 📜 Verificando archivos JavaScript principales...
echo.

REM Verificar archivos JS principales
if exist "Frontend\js\Partida\Partida.js" (
    echo ✅ Partida.js encontrado
) else (
    echo ❌ Partida.js NO encontrado
)

if exist "Frontend\js\Partida\GameFlowController.js" (
    echo ✅ GameFlowController.js encontrado
) else (
    echo ❌ GameFlowController.js NO encontrado
)

if exist "Frontend\js\Partida\CardSelectionManager.js" (
    echo ✅ CardSelectionManager.js encontrado
) else (
    echo ❌ CardSelectionManager.js NO encontrado
)

if exist "Frontend\js\Partida\TurnIndicator.js" (
    echo ✅ TurnIndicator.js encontrado
) else (
    echo ❌ TurnIndicator.js NO encontrado
)

if exist "Frontend\js\Partida\BattleComparator.js" (
    echo ✅ BattleComparator.js encontrado
) else (
    echo ❌ BattleComparator.js NO encontrado
)

if exist "Frontend\js\Partida\RankingFinalDisplay.js" (
    echo ✅ RankingFinalDisplay.js encontrado
) else (
    echo ❌ RankingFinalDisplay.js NO encontrado
)

echo.
echo 🎨 Verificando archivos CSS...
echo.

if exist "Frontend\css\Partida\GameLogic.css" (
    echo ✅ GameLogic.css encontrado
) else (
    echo ❌ GameLogic.css NO encontrado
)

echo.
echo 🔧 Verificando backend...
echo.

if exist "Backend\juego.sln" (
    echo ✅ juego.sln encontrado
) else (
    echo ❌ juego.sln NO encontrado
)

if exist "Backend\Web\Program.cs" (
    echo ✅ Program.cs encontrado
) else (
    echo ❌ Program.cs NO encontrado
)

echo.
echo 🌐 Probando conexión al backend...
echo.

REM Usar curl para probar endpoints si está disponible
curl --version >nul 2>&1
if %errorlevel% == 0 (
    echo 🌐 Probando endpoint de partida...
    curl -s -o nul -w "Status: %%{http_code}" "http://localhost:7147/api/partida" 2>nul
    if %errorlevel% == 0 (
        echo ✅ Backend responde
    ) else (
        echo ❌ Backend no responde o no está ejecutándose
    )
) else (
    echo ⚠️ curl no disponible, no se puede probar backend
    echo 💡 Para verificar backend manualmente:
    echo    - Abrir navegador en: http://localhost:7147/api/partida
    echo    - O ejecutar: cd Backend ^&^& dotnet run
)

echo.
echo 📊 === INSTRUCCIONES ===
echo.
echo 💡 Para diagnóstico completo ejecutar:
echo    PowerShell: .\diagnostico.ps1
echo    Node.js: node Frontend\js\diagnostico-terminal.js
echo.
echo 💡 Para ver errores en navegador:
echo    1. Abrir Partida.html
echo    2. F12 (Consola)
echo    3. Ejecutar: diagnosticar()
echo.
echo 💡 Si hay archivos faltantes:
echo    1. Verificar que todos los archivos estén implementados
echo    2. Revisar rutas y nombres de archivos
echo.
echo 💡 Si backend no responde:
echo    1. cd Backend
echo    2. dotnet run
echo    3. Verificar puerto 7147
echo.

pause
