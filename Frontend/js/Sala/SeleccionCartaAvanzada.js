/**
 * Sistema de Selección de Cartas estilo imagen
 * Card Battles At Freddy's
 */

class SeleccionCartaAvanzada {
    constructor() {
        this.cartaSeleccionada = null;
        this.tiempoLimite = 100; // segundos
        this.intervaloCronometro = null;
        this.init();
    }

    init() {
        this.crearInterfazSeleccion();
        this.setupEventListeners();
    }

    crearInterfazSeleccion() {
        // Crear el contenedor principal
        const vistaSeleccion = document.createElement('div');
        vistaSeleccion.className = 'vista-seleccion-carta';
        vistaSeleccion.id = 'vista-seleccion-carta';
        
        vistaSeleccion.innerHTML = `
            <div class="contenedor-carta-seleccionada">               
                <!-- Cronómetro de tiempo -->
                <div class="tiempo-escape" id="cronometro-seleccion">
                    ${this.tiempoLimite}
                </div>
                
                <!-- Carta principal seleccionada -->
                <div class="carta-principal-seleccionada" id="carta-principal-seleccionada">
                    <!-- El contenido se llenará dinámicamente -->
                </div>
                
                <!-- Panel de información -->
                <div class="panel-info-carta">
                    <h3 id="nombre-carta-seleccionada">Nombre de la Carta</h3>
                    
                    <div class="stats-detalladas" id="stats-carta-seleccionada">
                        <div class="stat-item">
                            <span class="stat-label">VIDA</span>
                            <span class="stat-value" id="stat-vida">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">ATAQUE</span>
                            <span class="stat-value" id="stat-ataque">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">PODER</span>
                            <span class="stat-value" id="stat-poder">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">DEFENSA</span>
                            <span class="stat-value" id="stat-defensa">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">VELOCIDAD</span>
                            <span class="stat-value" id="stat-velocidad">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">TERROR</span>
                            <span class="stat-value" id="stat-terror">0</span>
                        </div>
                    </div>
                    
                    <div class="botones-accion-carta">
                        <button class="btn-accion btn-tirar" id="btn-tirar-carta">
                            TIRAR CARTA
                        </button>
                        <button class="btn-accion btn-volver" id="btn-volver-cartas">
                            VOLVER
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(vistaSeleccion);
    }

    setupEventListeners() {
        // Botón tirar carta
        document.getElementById('btn-tirar-carta').addEventListener('click', () => {
            this.tirarCarta();
        });
        
        // Botón volver
        document.getElementById('btn-volver-cartas').addEventListener('click', () => {
            this.cerrarSeleccion();
        });
        
        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.estaVisible()) {
                this.cerrarSeleccion();
            }
        });
        
        // Cerrar clickeando fuera
        document.getElementById('vista-seleccion-carta').addEventListener('click', (e) => {
            if (e.target.id === 'vista-seleccion-carta') {
                this.cerrarSeleccion();
            }
        });
    }

    mostrarSeleccionCarta(cartaElement) {
        this.cartaSeleccionada = cartaElement;
        const datosCarta = this.extraerDatosCarta(cartaElement);
        
        // Marcar la carta como seleccionada para referencias futuras
        cartaElement.classList.add('seleccionada');
        
        // Llenar información de la carta
        this.llenarInformacionCarta(datosCarta);
        
        // Mostrar la vista
        const vista = document.getElementById('vista-seleccion-carta');
        vista.classList.add('activa', 'entrando');
        
        // Iniciar cronómetro
        this.iniciarCronometro();
        
        // Remover clase de animación después de la animación
        setTimeout(() => {
            vista.classList.remove('entrando');
        }, 700);
        
        // Añadir clase de rareza a la carta principal
        const cartaPrincipal = document.getElementById('carta-principal-seleccionada');
        cartaPrincipal.className = `carta-principal-seleccionada ${datosCarta.rareza}`;
        
        // Copiar el HTML de la carta original
        cartaPrincipal.innerHTML = cartaElement.innerHTML;
    }

    extraerDatosCarta(cartaElement) {
        const datos = {};
        
        // Extraer información de la carta
        datos.id = cartaElement.id;
        datos.numero = cartaElement.querySelector('.numero-carta')?.textContent || '#000';
        datos.nombre = cartaElement.querySelector('.nombre-carta')?.textContent || 'Carta Misteriosa';
        datos.imagen = cartaElement.querySelector('.imagen-personaje')?.src || '../img/foto/1.jpg';
        
        // Extraer estadísticas
        const estadisticas = cartaElement.querySelectorAll('.fila-estadistica');
        estadisticas.forEach(stat => {
            const etiqueta = stat.querySelector('.etiqueta-estadistica')?.textContent.toLowerCase();
            const valor = stat.querySelector('.valor-estadistica')?.textContent || '0';
            if (etiqueta) {
                datos[etiqueta] = valor;
            }
        });
        
        // Determinar rareza basada en las clases CSS
        const ladoFrontal = cartaElement.querySelector('.lado-frontal');
        if (ladoFrontal.classList.contains('dorada')) {
            datos.rareza = 'dorada';
        } else if (ladoFrontal.classList.contains('rosa')) {
            datos.rareza = 'rosa';
        } else {
            datos.rareza = 'azul';
        }
        
        return datos;
    }

    llenarInformacionCarta(datos) {
        // Llenar nombre
        document.getElementById('nombre-carta-seleccionada').textContent = datos.nombre;
        
        // Llenar estadísticas
        document.getElementById('stat-vida').textContent = datos.vida || '0';
        document.getElementById('stat-ataque').textContent = datos.ataque || '0';
        document.getElementById('stat-poder').textContent = datos.poder || '0';
        document.getElementById('stat-defensa').textContent = datos.defensa || '0';
        document.getElementById('stat-velocidad').textContent = datos.velocidad || '0';
        document.getElementById('stat-terror').textContent = datos.terror || '0';
    }

    iniciarCronometro() {
        let tiempoRestante = this.tiempoLimite;
        const cronometroElement = document.getElementById('cronometro-seleccion');
        
        this.intervaloCronometro = setInterval(() => {
            cronometroElement.textContent = tiempoRestante;
            
            // Cambiar color según el tiempo restante
            if (tiempoRestante <= 3) {
                cronometroElement.style.background = 'rgba(255, 0, 0, 0.9)';
                cronometroElement.style.animation = 'pulso-tiempo 0.5s infinite';
            } else if (tiempoRestante <= 5) {
                cronometroElement.style.background = 'rgba(255, 165, 0, 0.9)';
            }
            
            tiempoRestante--;
            
            if (tiempoRestante < 0) {
                this.tiempoAgotado();
            }
        }, 1000);
    }

    tiempoAgotado() {
        clearInterval(this.intervaloCronometro);
        
        // Mostrar mensaje de tiempo agotado
        this.mostrarMensaje('⏰ ¡Tiempo agotado! Se selecciona automáticamente.', 'warning');
        
        // Auto-tirar la carta después de 1 segundo
        setTimeout(() => {
            this.tirarCarta();
        }, 1000);
    }

    tirarCarta() {
        if (!this.cartaSeleccionada) return;
        
        // Limpiar cronómetro
        clearInterval(this.intervaloCronometro);
        
        // Marcar la carta como tirada (mantener volteada pero quitar seleccionada)
        this.cartaSeleccionada.classList.remove('seleccionada');
        this.cartaSeleccionada.classList.add('carta-tirada'); // Nueva clase para cartas usadas
        
        // Animación de carta tirada
        this.animarCartaTirada();
        
        // Llamar a la función de juego original si existe
        if (typeof lanzarCartaConAtributo === 'function') {
            const atributoSeleccionado = this.obtenerAtributoSeleccionado();
            lanzarCartaConAtributo(atributoSeleccionado);
        }
        
        // Cerrar vista después de la animación
        setTimeout(() => {
            this.cerrarSeleccion();
        }, 1000);
    }

    obtenerAtributoSeleccionado() {
        // Por ahora retornamos un atributo aleatorio
        // Esto se puede mejorar agregando un selector de atributos
        const atributos = ['vida', 'ataque', 'poder', 'defensa', 'velocidad', 'terror'];
        return atributos[Math.floor(Math.random() * atributos.length)];
    }

    animarCartaTirada() {
        const cartaPrincipal = document.getElementById('carta-principal-seleccionada');
        cartaPrincipal.style.transform = 'translateY(-100vh) rotate(360deg)';
        cartaPrincipal.style.transition = 'all 1s ease-in';
        
        this.mostrarMensaje('🎯 ¡Carta lanzada!', 'success');
    }

    cerrarSeleccion() {
        clearInterval(this.intervaloCronometro);
        
        const vista = document.getElementById('vista-seleccion-carta');
        vista.classList.remove('activa');
        
        // Resetear cronómetro
        document.getElementById('cronometro-seleccion').textContent = this.tiempoLimite;
        document.getElementById('cronometro-seleccion').style.background = 'rgba(255, 0, 0, 0.8)';
        document.getElementById('cronometro-seleccion').style.animation = 'pulso-tiempo 1s infinite';
        
        // ARREGLO: Resetear estado de la carta original cuando se cancela
        if (this.cartaSeleccionada && !this.cartaSeleccionada.classList.contains('carta-tirada')) {
            this.cartaSeleccionada.classList.remove('volteada', 'seleccionada');
            // Resetear transform si tiene alguno aplicado
            this.cartaSeleccionada.style.transform = '';
            this.cartaSeleccionada.style.transition = '';
        }
        
        // Limpiar cualquier otra carta que pueda estar seleccionada
        this.limpiarTodasLasCartas();
        
        this.cartaSeleccionada = null;
    }

    // Método auxiliar para limpiar el estado de todas las cartas
    limpiarTodasLasCartas() {
        const todasLasCartas = document.querySelectorAll('.carta');
        todasLasCartas.forEach(carta => {
            // Solo limpiar cartas que no han sido tiradas
            if (!carta.classList.contains('carta-tirada')) {
                carta.classList.remove('volteada', 'seleccionada');
                carta.style.transform = '';
                carta.style.transition = '';
            }
        });
    }

    estaVisible() {
        return document.getElementById('vista-seleccion-carta').classList.contains('activa');
    }

    mostrarMensaje(texto, tipo = 'info') {
        const mensaje = document.createElement('div');
        mensaje.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${tipo === 'success' ? '#4CAF50' : tipo === 'warning' ? '#FF9800' : '#2196F3'};
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-family: 'Creepster', cursive;
            font-size: 1.2em;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: fadeInOut 2s ease-in-out;
        `;
        mensaje.textContent = texto;
        
        // Agregar animación CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(mensaje);
        
        setTimeout(() => {
            if (mensaje.parentNode) {
                mensaje.parentNode.removeChild(mensaje);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 2000);
    }

    // Método público para ser llamado desde el generador de cartas
    manejarClickCarta(cartaElement) {
        this.mostrarSeleccionCarta(cartaElement);
    }
}

// Inicializar el sistema de selección
let sistemaSeleccion;
document.addEventListener('DOMContentLoaded', () => {
    sistemaSeleccion = new SeleccionCartaAvanzada();
});

// Función global para integrar con el sistema existente
window.mostrarSeleccionAvanzada = function(cartaElement) {
    if (sistemaSeleccion) {
        sistemaSeleccion.manejarClickCarta(cartaElement);
    }
};

// Sobrescribir la función voltearCarta original para usar el nuevo sistema
const voltearCartaOriginal = window.voltearCarta;
window.voltearCarta = function(cartaElement) {
    // Si la carta ya está volteada o seleccionada, mostrar selección avanzada
    if (cartaElement.classList.contains('volteada') || cartaElement.classList.contains('seleccionada')) {
        if (sistemaSeleccion) {
            sistemaSeleccion.manejarClickCarta(cartaElement);
        }
    } else {
        // Comportamiento original para voltear
        if (voltearCartaOriginal) {
            voltearCartaOriginal(cartaElement);
        } else {
            cartaElement.classList.toggle('volteada');
        }
    }
};

// Export para usar en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SeleccionCartaAvanzada;
}
