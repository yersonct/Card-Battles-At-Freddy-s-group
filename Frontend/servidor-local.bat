@echo off
echo Iniciando servidor local para el frontend...
echo.
echo Navega a: http://localhost:8080/html/ListadoCartas.html
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
cd /d "c:\Users\bscl\Desktop\Proyectos 2025\Bootcam\Card-Battles-At-Freddy-s-group\Frontend"
python -m http.server 8080
pause
