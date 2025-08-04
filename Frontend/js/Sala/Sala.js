// Utilidades optimizadas para Sala.html
window.onload = function() {
  const audio = document.getElementById("miAudio");
  audio.play();
};
class SalaOptimizada {
    constructor() {
        this.cartas = [];
        this.jugadores = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        this.cartasGeneradas = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.preloadImages();
        this.optimizeRendering();
    }

    setupEventListeners() {
        // Usar delegación de eventos para mejor rendimiento
        document.addEventListener('click', this.handleCardClick.bind(this));
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        // Optimizar resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 150);
        });
    }

    handleCardClick(event) {
        if (event.target.closest('.carta')) {
            const carta = event.target.closest('.carta');
            this.selectCard(carta);
        }
    }

    handleKeyboard(event) {
        if (event.key === 'Escape') {
            this.deselectAllCards();
        }
    }

    handleResize() {
        // Reajustar elementos si es necesario
        this.optimizeCardLayout();
    }

    selectCard(carta) {
        // Implementación optimizada de selección de carta
        this.deselectAllCards();
        carta.classList.add('seleccionada');
        carta.setAttribute('aria-selected', 'true');
        
        // Notificar a lectores de pantalla
        this.announceCardSelection(carta);
    }

    deselectAllCards() {
        const cartas = document.querySelectorAll('.carta');
        cartas.forEach(carta => {
            carta.classList.remove('seleccionada');
            carta.setAttribute('aria-selected', 'false');
        });
    }

    announceCardSelection(carta) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Carta ${carta.id} seleccionada`;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    preloadImages() {
        // Precargar imágenes críticas
        const imagesToPreload = [
            '../img/foto/1.jpg',
            '../img/foto/2.jpg',
            '../img/foto/3.jpg',
            '../img/foto/4.jpg'
        ];

        imagesToPreload.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    optimizeRendering() {
        // Usar requestAnimationFrame para animaciones suaves
        this.rafId = null;
        this.pendingUpdates = new Set();
    }

    scheduleUpdate(updateFn) {
        this.pendingUpdates.add(updateFn);
        
        if (!this.rafId) {
            this.rafId = requestAnimationFrame(() => {
                this.processPendingUpdates();
            });
        }
    }

    processPendingUpdates() {
        this.pendingUpdates.forEach(updateFn => updateFn());
        this.pendingUpdates.clear();
        this.rafId = null;
    }

    optimizeCardLayout() {
        // Optimizar layout de cartas basado en el viewport
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        const cartas = document.querySelectorAll('.carta');
        
        if (viewport.width < 768) {
            // Layout móvil
            cartas.forEach((carta, index) => {
                carta.style.setProperty('--card-scale', '0.8');
            });
        } else {
            // Layout desktop
            cartas.forEach(carta => {
                carta.style.removeProperty('--card-scale');
            });
        }
    }

    // Método para generar cartas dinámicamente (reemplaza el HTML estático)
    generateCards(cardData = null) {
        if (this.cartasGeneradas) return;

        const contenedor = document.querySelector('.contenedor-cartas-completo');
        const template = document.getElementById('carta-template');
        
        if (!contenedor || !template) {
            console.warn('No se encontraron elementos necesarios para generar cartas');
            return;
        }

        // Limpiar contenedor
        contenedor.innerHTML = '';

        for (let i = 1; i <= 8; i++) {
            const cartaElement = this.createOptimizedCard(i, cardData?.[i-1]);
            contenedor.appendChild(cartaElement);
        }

        this.cartasGeneradas = true;
        this.optimizeCardLayout();
    }

    createOptimizedCard(index, data = null) {
        const template = document.getElementById('carta-template');
        const carta = template.content.cloneNode(true);
        const cartaElement = carta.querySelector('.carta');
        
        // Configurar ID y atributos
        cartaElement.id = `carta-${index}`;
        cartaElement.setAttribute('data-card-index', index);
        cartaElement.setAttribute('aria-label', `Carta ${index}`);
        
        // Poblar datos si están disponibles
        if (data) {
            this.populateCardData(carta, data);
        } else {
            // Datos de ejemplo
            this.populateCardData(carta, {
                numero: index,
                nombre: `Carta ${index}`,
                imagen: '../img/foto/1.jpg',
                vida: Math.floor(Math.random() * 100) + 50,
                ataque: Math.floor(Math.random() * 50) + 25,
                poder: Math.floor(Math.random() * 75) + 30,
                defensa: Math.floor(Math.random() * 60) + 20,
                velocidad: Math.floor(Math.random() * 80) + 10,
                terror: Math.floor(Math.random() * 90) + 40
            });
        }

        return carta;
    }

    populateCardData(cartaElement, data) {
        // Poblar números y nombres
        const numeroCarta = cartaElement.querySelector('.numero-carta');
        const nombreCarta = cartaElement.querySelector('.nombre-carta');
        const imagen = cartaElement.querySelector('.imagen-personaje');
        
        if (numeroCarta) numeroCarta.textContent = data.numero || '';
        if (nombreCarta) nombreCarta.textContent = data.nombre || '';
        if (imagen) {
            imagen.src = data.imagen || '../img/foto/1.jpg';
            imagen.alt = data.nombre || 'Carta de juego';
            imagen.loading = 'lazy'; // Carga lazy para rendimiento
        }

        // Poblar estadísticas
        const estadisticas = {
            vida: data.vida,
            ataque: data.ataque,
            poder: data.poder,
            defensa: data.defensa,
            velocidad: data.velocidad,
            terror: data.terror
        };

        Object.entries(estadisticas).forEach(([stat, valor]) => {
            const elemento = cartaElement.querySelector(`.valor-estadistica.${stat}`);
            if (elemento) {
                elemento.textContent = valor || '0';
            }
        });
    }

    // Método para actualizar información de jugadores
    updatePlayerInfo(playerId, info) {
        const jugador = document.querySelector(`[data-jugador="${playerId}"]`);
        if (!jugador) return;

        const input = jugador.querySelector('input');
        if (input && info.nombre) {
            input.value = info.nombre;
        }

        // Actualizar indicadores de cartas
        const contenedorCartas = jugador.querySelector('.contenedor-cantidad-cartas-jugador');
        if (contenedorCartas && typeof info.cartasRestantes === 'number') {
            const indicadores = contenedorCartas.querySelectorAll('.cantidad-no-jugadas');
            indicadores.forEach((indicador, index) => {
                indicador.style.visibility = index < info.cartasRestantes ? 'visible' : 'hidden';
            });
        }
    }

    // Método para mejorar la accesibilidad
    improveAccessibility() {
        // Agregar skip links
        const skipLink = document.createElement('a');
        skipLink.href = '#contenedor-cartas-completo';
        skipLink.textContent = 'Saltar a las cartas';
        skipLink.className = 'sr-only';
        skipLink.addEventListener('focus', function() {
            this.classList.remove('sr-only');
        });
        skipLink.addEventListener('blur', function() {
            this.classList.add('sr-only');
        });
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Mejorar navegación por teclado
        this.setupKeyboardNavigation();
    }

    setupKeyboardNavigation() {
        const cartas = document.querySelectorAll('.carta');
        let currentIndex = 0;

        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.carta')) {
                switch(e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        currentIndex = Math.min(currentIndex + 1, cartas.length - 1);
                        cartas[currentIndex].focus();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        currentIndex = Math.max(currentIndex - 1, 0);
                        cartas[currentIndex].focus();
                        break;
                }
            }
        });
    }

    // Cleanup para evitar memory leaks
    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        this.pendingUpdates.clear();
    }
}

// Inicializar cuando el DOM esté listo
let salaOptimizada;
document.addEventListener('DOMContentLoaded', () => {
    salaOptimizada = new SalaOptimizada();
    
    // Generar cartas si no se han generado aún
    salaOptimizada.generateCards();
    
    // Mejorar accesibilidad
    salaOptimizada.improveAccessibility();
});

// Cleanup al cerrar la página
window.addEventListener('beforeunload', () => {
    if (salaOptimizada) {
        salaOptimizada.destroy();
    }
});

// Export para usar en otros módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SalaOptimizada;
}
