// Función para mostrar el modal de confirmación de salida
function mostrarModalSalir() {
    const modal = document.getElementById('modalSalir');
    modal.style.display = 'flex';
    // Agregar clase para animación
    setTimeout(() => {
        modal.classList.add('mostrar');
    }, 10);
}

// Función para confirmar salida
function confirmarSalir() {
    // Cerrar la ventana/pestaña o redirigir a otra página
    // Redirigimos a la página de transición
    window.location.href = '../html/InicioDelJuego.html';
    // Si window.close() no funciona (en algunos navegadores), 
    // puedes redirigir a otra página o mostrar un mensaje
    // window.location.href = 'about:blank';
}
window.onload = function() {
  const audio = document.getElementById("miAudio");
  audio.play();
};
// Función para cancelar salida
function cancelarSalir() {
    const modal = document.getElementById('modalSalir');
    modal.classList.remove('mostrar');
    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Función para ir a la pantalla de transición - MOVIDA FUERA DEL DOMContentLoaded
function irTransmision() {
    // Obtener el elemento que fue clicado para determinar la URL
    const elemento = event.target.closest('.elementos') || event.target.closest('[data-url]');
    let destino = './videoTerror.html'; // Por defecto ir al video terror
    
    if (elemento && elemento.getAttribute('data-url')) {
        destino = elemento.getAttribute('data-url');
    }
    
    // Guardamos la URL de destino en el almacenamiento local
    localStorage.setItem("urlDestino", destino);

    // Redirigimos a la página de transición
    window.location.href = '../html/Pantalla.html';
}

// Cerrar modal al hacer clic fuera del contenido
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modalSalir');

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            cancelarSalir();
        }
    });

    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modalSalir');
            if (modal.style.display === 'flex') {
                cancelarSalir();
            }
        }
    });
});
