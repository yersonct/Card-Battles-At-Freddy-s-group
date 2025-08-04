function usuarioPresente() {
    console.log('Iniciando animación de transición...');
    
    const inicioFreddy = document.querySelector('.container-logo-inicio');
    const empezar = document.querySelector('.container-video');

    if (!inicioFreddy || !empezar) {
        console.error('No se encontraron los elementos para la animación');
        return;
    }

    // Preparar la transición suave
    inicioFreddy.style.transition = "opacity 1.5s ease-out";
    empezar.style.transition = "opacity 1.5s ease-in";
    
    // Preparar el contenedor de empezar (oculto inicialmente)
    empezar.style.display = "inline-block";
    empezar.style.opacity = "0";

    inicioFreddy.style.opacity = "0";

    setTimeout(() => { 
        // Ocultar completamente el logo inicial
        inicioFreddy.style.display = "none";
        
        // Pequeña pausa antes de mostrar el menú
        setTimeout(() => {
            
            empezar.style.opacity = "1";
            
            // Notificar que la animación terminó
            setTimeout(() => {
               
            }, 1500);
            
        }, 200); // Pausa breve para suavizar la transición

    }, 1500); // Tiempo para que termine la transición del fade-out
}
// ===== MANEJO DE AUDIO MEJORADO =====
async function inicializarAudio() {
    const audio = document.getElementById("miAudio");
    if (!audio) {
        
        return;
    }

    try {
        // Configurar el audio
        audio.volume = 0.5; // Volumen al 50%
        
        // Intentar reproducir el audio
        await audio.play();
        
        // Fade in del audio
        fadeInAudio(audio, 2000);
        
    } catch (error) {
       
        // Reproducir audio cuando el usuario interactúe
        const playOnInteraction = () => {
            audio.play()
                .then(() => {
                    
                    fadeInAudio(audio, 1000);
                })
                .catch(e => console.warn('Error al reproducir audio:', e));
            
            // Remover listeners después del primer uso
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('keydown', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction, { once: true });
        document.addEventListener('keydown', playOnInteraction, { once: true });
    }
}

// Función para fade in del audio
function fadeInAudio(audioElement, duration) {
    if (!audioElement) return;
    
    const targetVolume = 0.5;
    const step = targetVolume / (duration / 50);
    let currentVolume = 0;
    
    audioElement.volume = 0;
    
    const fadeInterval = setInterval(() => {
        currentVolume += step;
        if (currentVolume >= targetVolume) {
            audioElement.volume = targetVolume;
            clearInterval(fadeInterval);
        } else {
            audioElement.volume = currentVolume;
        }
    }, 50);
}

// Inicializar audio cuando la página esté lista
window.addEventListener('load', () => {
    console.log('Página cargada, inicializando audio...');
    inicializarAudio();
});

// Configurar efectos de sonido para botones
document.addEventListener('DOMContentLoaded', () => {
    const boton = document.getElementById("miBoton");
    const audioHover = document.getElementById("miAudio2");

    if (boton && audioHover) {
        boton.addEventListener("mouseenter", () => {
            audioHover.play().catch(e => {
               
            });
        });
        
    }
});

// ===== SISTEMA DE ACTIVACIÓN MEJORADO =====
let animacionActivada = false;
let tiempoInicio = Date.now();

function activarAnimacionInicio() {
    if (animacionActivada) {
        return;
    }

    const tiempoTranscurrido = Date.now() - tiempoInicio;
   
    
    animacionActivada = true;
    
    // Añadir un pequeño efecto de loading
    mostrarIndicadorCarga();
    
    setTimeout(() => {
        usuarioPresente();
    }, 800); // Pequeña pausa para el efecto de loading
}

function mostrarIndicadorCarga() {
    const logo = document.querySelector('.container-logo-inicio');
    if (!logo) return;
    
    // Crear indicador de carga
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.innerHTML = '●●●';
    loadingIndicator.style.cssText = `
        position: fixed;
        bottom: 50px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 20px;
        letter-spacing: 5px;
        animation: loadingDots 1s infinite;
        z-index: 1000;
    `;
    
    document.body.appendChild(loadingIndicator);
    
    // Añadir animación CSS para los puntos
    const style = document.createElement('style');
    style.textContent = `
        @keyframes loadingDots {
            0%, 20% { opacity: 0; }
            40% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Remover el indicador después de la animación
    setTimeout(() => {
        if (loadingIndicator.parentNode) {
            loadingIndicator.remove();
        }
        if (style.parentNode) {
            style.remove();
        }
    }, 2000);
}

// Activación automática después de 3 segundos
const activacionAutomatica = setTimeout(() => {
    activarAnimacionInicio();
}, 3000);

// Activación por interacción del usuario (más rápida)
const eventos = ['click', 'keydown', 'touchstart', 'mousemove'];
const activarPorInteraccion = () => {
    clearTimeout(activacionAutomatica); // Cancelar activación automática
    activarAnimacionInicio();
    
    // Remover todos los listeners
    eventos.forEach(evento => {
        document.removeEventListener(evento, activarPorInteraccion);
    });
};

// Agregar listeners para interacción
eventos.forEach(evento => {
    document.addEventListener(evento, activarPorInteraccion, { once: true });
});

// Activación por cambio de visibilidad (cuando vuelve a la pestaña)
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !animacionActivada) {
        activarAnimacionInicio();
    }
});


// ===== NAVEGACIÓN MEJORADA =====
function irTransmision() {
    
    // Fade out del audio antes de navegar
    const audio = document.getElementById("miAudio");
    if (audio && !audio.paused) {
        fadeOutAudio(audio, 500, () => {
            // Navegar después del fade out
            window.location.href = '../html/Pantalla.html';
        });
    } else {
        // Navegar inmediatamente si no hay audio
        window.location.href = '../html/Pantalla.html';
    }
}

// Función para fade out del audio
function fadeOutAudio(audioElement, duration, callback) {
    if (!audioElement) {
        if (callback) callback();
        return;
    }
    
    const startVolume = audioElement.volume;
    const step = startVolume / (duration / 50);
    
    const fadeInterval = setInterval(() => {
        audioElement.volume = Math.max(0, audioElement.volume - step);
        
        if (audioElement.volume <= 0) {
            clearInterval(fadeInterval);
            audioElement.pause();
            if (callback) callback();
        }
    }, 50);
}

// Añadir efectos visuales al botón de empezar
document.addEventListener('DOMContentLoaded', () => {
    const botonEmpezar = document.querySelector('.elementos[onclick="irTransmision()"]');
    
    if (botonEmpezar) {
        // Efecto de hover mejorado
        botonEmpezar.addEventListener('mouseenter', () => {
            botonEmpezar.style.transform = 'scale(1.05)';
            botonEmpezar.style.transition = 'transform 0.2s ease';
        });
        
        botonEmpezar.addEventListener('mouseleave', () => {
            botonEmpezar.style.transform = 'scale(1)';
        });
        
        // Efecto de click
        botonEmpezar.addEventListener('mousedown', () => {
            botonEmpezar.style.transform = 'scale(0.95)';
        });
        
        botonEmpezar.addEventListener('mouseup', () => {
            botonEmpezar.style.transform = 'scale(1.05)';
        });
    }
});