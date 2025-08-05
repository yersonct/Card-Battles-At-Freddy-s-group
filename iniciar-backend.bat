@echo off
echo 🔍 === INICIANDO BACKEND CARD BATTLES AT FREDDY'S ===
echo.

cd /d "c:\Users\bscl\Desktop\Proyectos 2025\Bootcam\Card-Battles-At-Freddy-s-group\Backend\Web"

echo 📁 Directorio actual: %CD%
echo.

echo 🔍 Verificando archivos necesarios...
if exist "Program.cs" (
    echo ✅ Program.cs encontrado
) else (
    echo ❌ Program.cs no encontrado
    pause
    exit /b 1
)

if exist "Web.csproj" (
    echo ✅ Web.csproj encontrado
) else (
    echo ❌ Web.csproj no encontrado
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando backend con dotnet run...
echo ⏰ Esto puede tomar unos momentos...
echo.

dotnet run

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error al iniciar el backend
    echo 💡 Posibles soluciones:
    echo    1. Verificar que .NET SDK esté instalado
    echo    2. Verificar que la base de datos esté configurada
    echo    3. Revisar errores de dependencias
    pause
) else (
    echo.
    echo ✅ Backend iniciado correctamente
)
