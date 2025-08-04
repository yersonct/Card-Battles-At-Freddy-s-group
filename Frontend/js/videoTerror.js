// Esperar a que el video termine o después de un tiempo determinado
document.addEventListener('DOMContentLoaded', function() {
    const video = document.querySelector('video');
    
    if (video) {
        // Opción 1: Esperar a que el video termine naturalmente
        video.addEventListener('ended', function() {
            // Regresar a Lobby después de que termine el video
            window.location.href = "../html/Lobby.html";
        });
        
        // Opción 2: Tiempo fijo como respaldo (en caso de que el video no tenga duración definida)
        setTimeout(() => {
            window.location.href = "../html/Lobby.html";
        }, 10000); // 10 segundos como máximo
        
        // Opción 3: Permitir al usuario hacer clic para saltar
        video.addEventListener('click', function() {
            window.location.href = "../html/Lobby.html";
        });
        
        // También permitir presionar cualquier tecla para continuar
        document.addEventListener('keydown', function() {
            window.location.href = "../html/Lobby.html";
        });
    } else {
        // Si no hay video, regresar inmediatamente
        setTimeout(() => {
            window.location.href = "../html/Lobby.html";
        }, 3000);
    }
});