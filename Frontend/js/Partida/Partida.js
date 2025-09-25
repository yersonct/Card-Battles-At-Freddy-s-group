// Controlador de Sala conectado al Backend - INTEGRADO CON GAME FLOW

// ===== CONFIGURACIÓN DEL BACKEND =====
const API_BASE = 'http://localhost:7147/api';
let partidaBackendId = null;
let codigoPartidaBackend = null;
let jugadoresBackend = [];
let modoOfflineActivo = false;

// ===== INICIALIZACIÓN DEL BACKEND =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Inicializando integración con backend...');
    inicializarBackendIntegration();
});

async function inicializarBackendIntegration() {
    try {
        // Recuperar datos del localStorage
        partidaBackendId = localStorage.getItem('partidaId');
        codigoPartidaBackend = localStorage.getItem('codigoPartida');
        const jugadoresData = localStorage.getItem('jugadoresPartida');
        modoOfflineActivo = localStorage.getItem('modoOffline') === 'true';
        
        console.log(' Datos del backend recuperados:', {
            partidaId: partidaBackendId,
            codigo: codigoPartidaBackend,
            modoOffline: modoOfflineActivo,
            jugadores: jugadoresData ? 'Disponible' : 'No disponible'
        });
        
        if (jugadoresData) {
            jugadoresBackend = JSON.parse(jugadoresData);
            console.log(' Jugadores registrados:', jugadoresBackend);
            
            // Actualizar el sistema de juego con los jugadores reales
            actualizarSistemaConJugadoresReales();
        }
        
        if (!modoOfflineActivo && partidaBackendId) {
            await conectarConBackendReal();
        }
        
    } catch (error) {
        console.error(' Error en inicialización del backend:', error);
        modoOfflineActivo = true;
    }
}

async function conectarConBackendReal() {
    try {
        console.log(' Conectando con backend real...');
        
        // Verificar estado de la partida
        const response = await fetch(`${API_BASE}/partida/${partidaBackendId}/estado`);
        
        if (response.ok) {
            const estadoPartida = await response.json();
            console.log(' Conectado con backend - Estado:', estadoPartida);
            
            // Actualizar datos del juego
            if (estadoPartida.jugadores) {
                jugadoresBackend = estadoPartida.jugadores;
            }
        } else {
            throw new Error('No se pudo conectar con el backend');
        }
        
    } catch (error) {
        console.error(' Backend no disponible, continuando en modo offline:', error);
        modoOfflineActivo = true;
    }
}

function actualizarSistemaConJugadoresReales() {
    console.log(' Actualizando sistema con jugadores reales...');
    
    // Actualizar la variable global de jugadores del sistema existente
    if (window.jugadoresPartida && jugadoresBackend.length > 0) {
        // Mapear jugadores del backend al formato esperado por el juego
        window.jugadoresPartida = jugadoresBackend.map((jugador, index) => ({
            id: index + 1,
            nombre: jugador.Nombre || jugador.nombre,
            avatar: jugador.Avatar || jugador.avatar,
            cartas: [], // Se llenará después
            turno: index === 0 // El primer jugador empieza
        }));
        
        console.log(' Jugadores actualizados en el sistema:', window.jugadoresPartida);
        
        // Actualizar interfaz de jugadores
        actualizarInterfazJugadores();
    }
}

function actualizarInterfazJugadores() {
    console.log(' Actualizando la interfaz para los jugadores...');
    actualizarUIJugadorCompleto(1, jugadoresBackend.length > 0 ? jugadoresBackend[0] : null);
    actualizarUIJugadorCompleto(2, jugadoresBackend.length > 1 ? jugadoresBackend[1] : null);
    console.log(' Interfaz de jugadores actualizada.');
}

/**
 * Función robusta para actualizar el nombre y avatar de un jugador en la UI.
 * Esta función es a prueba de errores para no detener el script.
 * @param {number} numeroJugador - El número del jugador (1 o 2).
 * @param {object | null} datosJugador - El objeto con los datos del jugador.
 */
function actualizarUIJugadorCompleto(numeroJugador, datosJugador) {
    const contenedor = document.querySelector(`.iconos-${numeroJugador}`);
    if (!contenedor) return;

    const nombreEl = contenedor.querySelector('input');
    const avatarEl = contenedor.querySelector('img');

    if (!nombreEl || !avatarEl) {
        console.error(`Elementos de UI (input o img) no encontrados para el jugador ${numeroJugador}.`);
        return;
    }

    // Mostrar el contenedor del jugador si hay datos, ocultarlo si no.
    contenedor.style.display = datosJugador ? 'block' : 'none';

    if (datosJugador) {
        nombreEl.value = datosJugador.Nombre || datosJugador.nombre || `Jugador ${numeroJugador}`;
        avatarEl.alt = `Avatar de ${nombreEl.value}`;

        const avatarInfo = datosJugador.Avatar || datosJugador.avatar;
        if (avatarInfo && typeof avatarInfo === 'string') {
            const backendBaseUrl = API_BASE.replace('/api', '');
            const nombreArchivo = avatarInfo.split(/[\\/]/).pop();
            avatarEl.src = `${backendBaseUrl}/img/foto/${nombreArchivo}`;
            avatarEl.onerror = () => { avatarEl.src = '../img/foto/icono.png'; };
        } else {
            // Ocultar jugadores extra
            contenedor.style.display = 'none';
        }
    };

    console.log(' Interfaz de jugadores actualizada');
}

//  VARIABLE GLOBAL PARA DEBUGGING - ACCESIBLE DESDE CONSOLA Y LOCALSTORAGE
window.debugInfo = {
    errores: [],
    partidaData: {},
    dependencias: {},
    localStorage: {},
    ultimoError: null,
    
    // Cargar errores desde localStorage
    cargarDesdeLocalStorage: function() {
        try {
            const erroresGuardados = localStorage.getItem('debugInfo_errores');
            const ultimoErrorGuardado = localStorage.getItem('debugInfo_ultimoError');
            const partidaDataGuardada = localStorage.getItem('debugInfo_partidaData');
            
            if (erroresGuardados) {
                this.errores = JSON.parse(erroresGuardados);
            }
            if (ultimoErrorGuardado) {
                this.ultimoError = JSON.parse(ultimoErrorGuardado);
            }
            if (partidaDataGuardada) {
                this.partidaData = JSON.parse(partidaDataGuardada);
            }
            
            console.log(' Errores cargados desde localStorage:', this.errores.length, 'errores encontrados');
        } catch (e) {
            console.warn(' Error cargando debug info desde localStorage:', e);
        }
    },
    
    // Guardar errores en localStorage
    guardarEnLocalStorage: function() {
        try {
            localStorage.setItem('debugInfo_errores', JSON.stringify(this.errores));
            localStorage.setItem('debugInfo_ultimoError', JSON.stringify(this.ultimoError));
            localStorage.setItem('debugInfo_partidaData', JSON.stringify(this.partidaData));
            localStorage.setItem('debugInfo_timestamp', new Date().toISOString());
            
            console.log(' Debug info guardado en localStorage');
        } catch (e) {
            console.error(' Error guardando debug info en localStorage:', e);
        }
    },
    
    // Limpiar errores del localStorage
    limpiarLocalStorage: function() {
        localStorage.removeItem('debugInfo_errores');
        localStorage.removeItem('debugInfo_ultimoError');
        localStorage.removeItem('debugInfo_partidaData');
        localStorage.removeItem('debugInfo_timestamp');
        this.errores = [];
        this.ultimoError = null;
        this.partidaData = {};
        console.log(' Debug info limpiado del localStorage');
    },
    
    // Método para ver todos los errores
    verErrores: function() {
        console.table(this.errores);
        console.log(' También disponible en localStorage como debugInfo_errores');
        return this.errores;
    },
    
    // Método para ver el último error en detalle
    ultimoErrorDetalle: function() {
        console.log(' ÚLTIMO ERROR DETALLADO:', this.ultimoError);
        console.log(' También disponible en localStorage como debugInfo_ultimoError');
        return this.ultimoError;
    },
    
    // Método para exportar todo para análisis
    exportarTodo: function() {
        const reporte = {
            timestamp: new Date().toISOString(),
            errores: this.errores,
            partidaData: this.partidaData,
            dependencias: this.dependencias,
            localStorage: this.localStorage,
            ultimoError: this.ultimoError
        };
        console.log(' REPORTE COMPLETO PARA ANÁLISIS:', JSON.stringify(reporte, null, 2));
        console.log(' Guardando reporte en localStorage...');
        localStorage.setItem('debugInfo_reporteCompleto', JSON.stringify(reporte, null, 2));
        return reporte;
    },
    
    // Agregar nuevo error y guardarlo
    agregarError: function(error, partidaData, dependencias) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            message: error.message,
            name: error.name,
            stack: error.stack,
            partidaData: partidaData || {},
            dependencias: dependencias || {}
        };
        
        this.ultimoError = errorInfo;
        this.errores.push(errorInfo);
        this.partidaData = partidaData || {};
        this.dependencias = dependencias || {};
        
        // Guardar automáticamente en localStorage
        this.guardarEnLocalStorage();
        
        console.log(' Error guardado en localStorage. Total errores:', this.errores.length);
        return errorInfo;
    }
};

// Cargar errores existentes al iniciar
window.debugInfo.cargarDesdeLocalStorage();

// 🔒 PREVENIR REDIRECCIONES NO DESEADAS DURANTE DEBUGGING
window.debugMode = true;
window.preventRedirects = true;

// Interceptar intentos de redirección
const originalReplace = window.location.replace;
const originalAssign = window.location.assign;

window.location.replace = function(url) {
    if (window.preventRedirects) {
        console.warn(' REDIRECCIÓN BLOQUEADA (replace):', url);
        console.warn(' Para habilitar redirecciones: window.preventRedirects = false');
        return;
    }
    return originalReplace.call(window.location, url);
};

window.location.assign = function(url) {
    if (window.preventRedirects) {
        console.warn(' REDIRECCIÓN BLOQUEADA (assign):', url);
        console.warn(' Para habilitar redirecciones: window.preventRedirects = false');
        return;
    }
    return originalAssign.call(window.location, url);
};

// También interceptar cambios directos de href
Object.defineProperty(window.location, 'href', {
    set: function(url) {
        if (window.preventRedirects) {
            console.warn(' REDIRECCIÓN BLOQUEADA (href):', url);
            console.warn(' Para habilitar redirecciones: window.preventRedirects = false');
            return;
        }
        window.location.assign(url);
    },
    get: function() {
        return window.location.toString();
    }
});

class SalaBackend {
    constructor() {
        this.partidaId = null;
        this.jugadorId = null;
        this.jugadorNombre = null;
        this.gameFlowController = null; // Cambio: usar GameFlowController en lugar de juegoController
        this.cartasJugador = [];
        this.estadoPartida = null;
        this.cartaSeleccionada = null;
        this.atributoSeleccionado = null;

        // Estado de la interfaz
        this.interfazListaParaJugar = false;

        console.log(' SalaBackend inicializado con GameFlowController');
    }

    // Inicializar la sala con datos del backend
    async init() {
        try {
            // Obtener datos de la partida desde localStorage
            this.partidaId = localStorage.getItem('partidaId');
            this.jugadorId = localStorage.getItem('jugadorId');
            this.jugadorNombre = localStorage.getItem('jugadorNombre');

            if (!this.partidaId || !this.jugadorId) {
                throw new Error('No se encontraron datos de partida');
            }

            console.log(' Datos de partida:', {
                partidaId: this.partidaId,
                jugadorId: this.jugadorId,
                jugadorNombre: this.jugadorNombre
            });

            // Inicializar el GameFlowController
            if (typeof GameFlowController !== 'undefined') {
                this.gameFlowController = new GameFlowController();
                await this.gameFlowController.init(this.partidaId, this.jugadorId);

                console.log(' GameFlowController inicializado');
            } else {
                throw new Error('GameFlowController no está disponible');
            }

            // Configurar interfaz inicial
            this.configurarInterfaz();

            // Iniciar polling de estado
            this.iniciarPolling();

            console.log(' Sala inicializada correctamente');

        } catch (error) {
            console.error(' Error al inicializar sala:', error);
            
            // GUARDAR ERROR EN VARIABLE GLOBAL Y LOCALSTORAGE PARA DEBUGGING
            const partidaData = {
                partidaId: this.partidaId,
                jugadorId: this.jugadorId,
                jugadorNombre: this.jugadorNombre
            };
            
            const dependencias = {
                GameFlowController: typeof GameFlowController !== 'undefined',
                CardSelectionManager: typeof CardSelectionManager !== 'undefined',
                TurnIndicator: typeof TurnIndicator !== 'undefined',
                BattleComparator: typeof BattleComparator !== 'undefined',
                RankingFinalDisplay: typeof RankingFinalDisplay !== 'undefined',
                partidaService: typeof window.partidaService !== 'undefined'
            };
            
            // Usar el método mejorado que guarda automáticamente en localStorage
            const errorInfo = window.debugInfo.agregarError(error, partidaData, dependencias);
            
            // También guardar copia del localStorage actual
            window.debugInfo.localStorage = { ...localStorage };
            
            // NO REDIRIGIR - QUEDARSE EN LA PÁGINA PARA VER ERRORES
            // this.mostrarError('Error al cargar la partida: ' + error.message);
            
            // DEBUGGING COMPLETO PARA ANALIZAR PROBLEMAS
            console.error(' === ANÁLISIS COMPLETO DEL ERROR ===');
            console.error(' Stack completo del error:', error.stack);
            console.error(' Mensaje del error:', error.message);
            console.error(' Tipo de error:', error.name);
            
            // Verificar datos del localStorage
            console.error(' === DATOS DEL LOCALSTORAGE ===');
            console.error(' partidaId:', this.partidaId);
            console.error(' jugadorId:', this.jugadorId);
            console.error(' jugadorNombre:', this.jugadorNombre);
            console.error(' Todo el localStorage:', { ...localStorage });
            
            // Verificar disponibilidad de dependencias
            console.error(' === VERIFICACIÓN DE DEPENDENCIAS ===');
            console.error(' GameFlowController disponible:', typeof GameFlowController !== 'undefined');
            console.error(' window.partidaService disponible:', typeof window.partidaService !== 'undefined');
            console.error(' Todas las clases disponibles:', {
                GameFlowController: typeof GameFlowController,
                CardSelectionManager: typeof CardSelectionManager,
                TurnIndicator: typeof TurnIndicator,
                BattleComparator: typeof BattleComparator,
                RankingFinalDisplay: typeof RankingFinalDisplay
            });
            
            // Información sobre cómo acceder desde consola
            console.error(' === ACCESO DESDE CONSOLA ===');
            console.error(' Para ver todos los errores: window.debugInfo.verErrores()');
            console.error(' Para ver el último error: window.debugInfo.ultimoErrorDetalle()');
            console.error(' Para exportar todo: window.debugInfo.exportarTodo()');
            console.error(' Para acceso directo: window.debugInfo');
            
            console.error(' === ACCESO DESDE OTRAS PÁGINAS ===');
            console.error(' Los errores están guardados en localStorage:');
            console.error('• localStorage.getItem("debugInfo_errores") - Todos los errores');
            console.error('• localStorage.getItem("debugInfo_ultimoError") - Último error');
            console.error('• localStorage.getItem("debugInfo_partidaData") - Datos de partida');
            console.error('• localStorage.getItem("debugInfo_reporteCompleto") - Reporte completo');
            
            console.error(' === DESDE CREAR SALA EJECUTA ===');
            console.error(' JSON.parse(localStorage.getItem("debugInfo_errores"))');
            console.error(' JSON.parse(localStorage.getItem("debugInfo_ultimoError"))');
            
            console.error(' === PARA LIMPIAR ERRORES ===');
            console.error(' window.debugInfo.limpiarLocalStorage() // Desde cualquier página');
            
            // Mostrar error persistente en pantalla (sin auto-remover)
            this.mostrarErrorPersistente(error);
        }
    }

    // Suscribirse a eventos del controlador del juego (LEGACY - GameFlowController maneja esto)
    suscribirseAEventos() {
        // El GameFlowController maneja sus propios eventos internamente
        console.log(' Eventos manejados por GameFlowController');
    }

    // Cargar estado inicial de la partida (LEGACY - GameFlowController maneja esto)
    async cargarEstadoPartida() {
        // El GameFlowController maneja la carga de estado internamente
        console.log(' Estado manejado por GameFlowController');
    }

    // Configurar la interfaz inicial (simplificada - GameFlowController maneja la lógica)
    configurarInterfaz() {
        console.log(' Configurando interfaz inicial...');

        // Solo configurar elementos básicos, el GameFlowController maneja el resto
        this.actualizarInfoJugador();

        // El GameFlowController ya se encarga de:
        // - Selección de cartas
        // - Botones de atributos  
        // - Lógica de turnos
        // - Comparación de cartas
        // - Ranking final

        console.log(' Interfaz configurada - GameFlowController activo');
    }

    // Actualizar información del jugador actual
    actualizarInfoJugador() {
        // Actualizar nombre del jugador en la interfaz
        const elementosNombre = document.querySelectorAll('.nombre-jugador-actual');
        elementosNombre.forEach(el => {
            el.textContent = this.jugadorNombre || 'Jugador';
        });

        console.log(' Información del jugador actualizada');
    }

    // Configurar eventos de selección de cartas
    configurarSeleccionCartas() {
        document.addEventListener('click', (event) => {
            const carta = event.target.closest('.carta');
            if (carta && carta.dataset.cartaId) {
                this.seleccionarCarta(carta);
            }
        });
    }

    // Métodos de compatibilidad y utilidades

    // Obtener información del estado actual
    getEstadoActual() {
        if (this.gameFlowController) {
            return this.gameFlowController.getEstadoActual();
        }

        return {
            partidaId: this.partidaId,
            jugadorId: this.jugadorId,
            error: 'GameFlowController no inicializado'
        };
    }

    // Método de compatibilidad para mostrar errores
    mostrarError(mensaje) {
        console.error('', mensaje);

        // Mostrar error en la interfaz
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 9999;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        `;
        errorDiv.textContent = mensaje;

        document.body.appendChild(errorDiv);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Mostrar error persistente para debugging (NO se auto-remueve)
    mostrarErrorPersistente(error) {
        console.error(' MOSTRANDO ERROR PERSISTENTE PARA DEBUGGING');
        
        // Crear panel de error detallado que NO desaparece
        const errorPanel = document.createElement('div');
        errorPanel.className = 'error-panel-debug';
        errorPanel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            right: 10px;
            background: rgba(139, 0, 0, 0.95);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 99999;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            max-height: 80vh;
            overflow-y: auto;
            border: 2px solid #ff0000;
        `;
        
        errorPanel.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 15px;">
                <h2 style="margin: 0; color: #ffdddd;">🚨 ERROR DE DEBUGGING - NO REDIRIGIR</h2>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-left: auto;">
                    ✕ Cerrar
                </button>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <strong> DATOS DE PARTIDA:</strong><br>
                • PartidaId: ${this.partidaId || 'NULL'}<br>
                • JugadorId: ${this.jugadorId || 'NULL'}<br>
                • JugadorNombre: ${this.jugadorNombre || 'NULL'}
            </div>
            
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <strong> ERROR:</strong><br>
                • Mensaje: ${error.message}<br>
                • Tipo: ${error.name}<br>
                • GameFlowController disponible: ${typeof GameFlowController !== 'undefined' ? ' SÍ' : ' NO'}
            </div>
            
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <strong> STACK TRACE:</strong><br>
                <pre style="white-space: pre-wrap; font-size: 10px;">${error.stack || 'No stack disponible'}</pre>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">
                <strong> INSTRUCCIONES DE DEBUGGING:</strong><br>
                1. Revisa la consola del navegador (F12) para más detalles<br>
                2. Verifica que todos los archivos JS estén cargados correctamente<br>
                3. Comprueba que los datos de localStorage sean correctos<br>
                4. Asegúrate de que el backend esté funcionando<br><br>
                <strong> COMANDOS DE CONSOLA:</strong><br>
                • <code>window.debugInfo.verErrores()</code> - Ver todos los errores<br>
                • <code>window.debugInfo.ultimoErrorDetalle()</code> - Último error detallado<br>
                • <code>window.debugInfo.exportarTodo()</code> - Exportar información completa<br>
                • <code>window.debugInfo</code> - Acceso directo a toda la información
            </div>
        `;
        
        // Remover panel anterior si existe
        const panelAnterior = document.querySelector('.error-panel-debug');
        if (panelAnterior) {
            panelAnterior.remove();
        }
        
        document.body.appendChild(errorPanel);
        
        // También mostrar en consola para copiar fácilmente
        console.error(' === COPIA ESTE ERROR PARA ANÁLISIS ===');
        console.error(JSON.stringify({
            partidaId: this.partidaId,
            jugadorId: this.jugadorId,
            jugadorNombre: this.jugadorNombre,
            errorMessage: error.message,
            errorName: error.name,
            errorStack: error.stack,
            gameFlowControllerDisponible: typeof GameFlowController !== 'undefined',
            localStorage: { ...localStorage }
        }, null, 2));
    }

    // Limpiar recursos al destruir
    destroy() {
        if (this.gameFlowController) {
            this.gameFlowController.destroy();
        }

        console.log(' SalaBackend destruido');
    }

    // Método auxiliar para polling (simplificado)
    iniciarPolling() {
        // El GameFlowController ya maneja su propio polling
        console.log(' Polling delegado a GameFlowController');
    }
}

// Crear instancia de SalaBackend cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Solo crear instancia si estamos en la página de partida
    if (window.location.pathname.includes('Partida.html')) {
        window.salaBackend = new SalaBackend();
        
        // Inicializar automáticamente pero SIN REDIRECCIONES
        window.salaBackend.init().catch(error => {
            console.error(' Error en inicialización automática:', error);
            // NO REDIRIGIR - MANTENER EN PÁGINA ACTUAL PARA DEBUGGING
            console.error(' MANTENIENDO EN PÁGINA ACTUAL PARA ANÁLISIS DE ERRORES');
            console.error(' Usa window.debugInfo.verErrores() para ver los errores');
        });

        console.log(' SalaBackend inicializada automáticamente - SIN REDIRECCIONES');
    }
});

// Exportar para uso global
window.SalaBackend = SalaBackend;

