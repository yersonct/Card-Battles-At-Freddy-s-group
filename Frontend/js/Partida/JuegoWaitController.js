/**
 * Controlador de espera y verificación antes de iniciar el juego
 * Card Battles At Freddy's
 */

class JuegoWaitController {
    constructor() {
        this.maxIntentos = 10;
        this.intervalos = [];
        this.verificacionCompleta = false;
        
        console.log('Iniciando verificación de datos de partida...');
        this.init();
    }

    async init() {
        // Mostrar pantalla de carga
        this.mostrarPantallaCarga();
        
        // Verificar datos de partida
        await this.verificarDatosPartida();
    }

    mostrarPantallaCarga() {
        const cargaElement = document.createElement('div');
        cargaElement.id = 'pantalla-carga';
        cargaElement.innerHTML = `
            <div class="carga-contenido">
                <h1>Card Battles At Freddy's</h1>
                <div class="carga-spinner"></div>
                <p id="carga-mensaje">Verificando datos de partida...</p>
                <div class="carga-puntos">
                    <span>.</span><span>.</span><span>.</span>
                </div>
            </div>
        `;
        
        // Estilos para la pantalla de carga
        cargaElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #1a1a1a;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Creepster', cursive;
        `;
        
        // Agregar estilos del spinner
        const style = document.createElement('style');
        style.textContent = `
            .carga-contenido {
                text-align: center;
            }
            .carga-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #333;
                border-top: 4px solid #ff6b35;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 20px auto;
            }
            .carga-puntos {
                font-size: 2em;
                margin-top: 10px;
            }
            .carga-puntos span {
                animation: pulse 1.5s infinite;
            }
            .carga-puntos span:nth-child(2) {
                animation-delay: 0.3s;
            }
            .carga-puntos span:nth-child(3) {
                animation-delay: 0.6s;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(cargaElement);
    }

    actualizarMensajeCarga(mensaje) {
        const mensajeElement = document.getElementById('carga-mensaje');
        if (mensajeElement) {
            mensajeElement.textContent = mensaje;
        }
    }

    async verificarDatosPartida() {
        let intentos = 0;
        
        while (intentos < this.maxIntentos && !this.verificacionCompleta) {
            intentos++;
            
            try {
                this.actualizarMensajeCarga(`Verificando datos... (${intentos}/${this.maxIntentos})`);
                
                // Verificar localStorage
                const partidaId = localStorage.getItem('partidaId');
                const jugadorId = localStorage.getItem('jugadorId');
                const jugadorNombre = localStorage.getItem('jugadorNombre');
                
                console.log('Datos actuales:', { partidaId, jugadorId, jugadorNombre });
                
                if (!partidaId) {
                    throw new Error('No se encontró ID de partida');
                }
                
                // Verificar conexión con backend
                if (jugadorId && jugadorNombre) {
                    this.actualizarMensajeCarga('Verificando conexión con servidor...');
                    
                    const response = await fetch(`http://localhost:7147/api/partida/${partidaId}/estado`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const estado = await response.json();
                        console.log('Estado de partida verificado:', estado);
                        
                        this.actualizarMensajeCarga('¡Conexión exitosa! Iniciando juego...');
                        await this.esperarUnPoco(1000);
                        
                        this.verificacionCompleta = true;
                        this.iniciarJuego();
                        return;
                    } else {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }
                } else {
                    throw new Error('Faltan datos de jugador');
                }
                
            } catch (error) {
                console.warn(`Intento ${intentos} falló:`, error.message);
                
                if (intentos >= this.maxIntentos) {
                    this.manejarErrorFinal(error);
                    return;
                }
                
                // Esperar antes del siguiente intento
                await this.esperarUnPoco(1000);
            }
        }
    }

    async esperarUnPoco(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    manejarErrorFinal(error) {
        console.error('No se pudo verificar la partida después de todos los intentos:', error);
        
        this.actualizarMensajeCarga(' Error de conexión - Revisa el botón de errores 🚨');
        
        // NO redirigir automáticamente si el sistema de captura está activo
        if (window.errorCapture) {
            // Solo mostrar mensaje de error, no redirigir
            const pantallaCarga = document.getElementById('pantalla-carga');
            if (pantallaCarga) {
                const contenido = pantallaCarga.querySelector('.carga-contenido');
                if (contenido) {
                    contenido.innerHTML = `
                        <h1> Error de Conexión</h1>
                        <div class="error-details">
                            <p><strong>No se pudo conectar al backend</strong></p>
                            <p>Error: ${error.message}</p>
                            <div class="error-actions" style="margin-top: 20px;">
                                <button onclick="window.location.reload()" style="
                                    background: #ffc107;
                                    color: black;
                                    border: none;
                                    padding: 10px 20px;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    margin: 5px;
                                    font-family: inherit;
                                "> Reintentar</button>
                                <button onclick="window.errorCapture.mostrarModalErrores()" style="
                                    background: #dc3545;
                                    color: white;
                                    border: none;
                                    padding: 10px 20px;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    margin: 5px;
                                    font-family: inherit;
                                "> Ver Errores</button>
                                <button onclick="window.location.href='./CrearSala.html'" style="
                                    background: #6c757d;
                                    color: white;
                                    border: none;
                                    padding: 10px 20px;
                                    border-radius: 5px;
                                    cursor: pointer;
                                    margin: 5px;
                                    font-family: inherit;
                                "> Volver</button>
                            </div>
                        </div>
                    `;
                }
            }
            return; // No redirigir
        }
        
        // Fallback original (solo si no hay sistema de captura)
        setTimeout(() => {
            window.location.href = './CrearSala.html';
        }, 3000);
    }

    iniciarJuego() {
        console.log('Iniciando el juego...');
        
        // Ocultar pantalla de carga
        const pantallaCarga = document.getElementById('pantalla-carga');
        if (pantallaCarga) {
            pantallaCarga.style.opacity = '0';
            setTimeout(() => pantallaCarga.remove(), 500);
        }
        
        // Inicializar el juego principal
        if (typeof window.inicializarJuegoSimple === 'function') {
            window.juegoSimple = window.inicializarJuegoSimple();
        } else {
            console.error('JuegoSimple no está disponible');
            this.manejarErrorFinal(new Error('JuegoSimple no cargado'));
        }
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar en la página de partida
    if (window.location.pathname.includes('Partida.html')) {
        window.juegoWaitController = new JuegoWaitController();
    }
});

// Export para compatibilidad
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JuegoWaitController;
}
