// Controlador de Sala conectado al Backend - INTEGRADO CON GAME FLOW

// ===== CONFIGURACIÓN DEL BACKEND =====
const API_BASE = 'http://localhost:7147/api';
let partidaBackendId = null;
let codigoPartidaBackend = null;
let jugadoresBackend = [];
let modoOfflineActivo = false;

// ===== HELPERS =====
function backendBaseUrl() {
  return API_BASE.replace(/\/api\/?$/, '');
}

function resolveAvatarSrc(avatar) {
  const fallback = '../img/foto/icono.png';
  if (!avatar) return fallback;
  if (typeof avatar !== 'string') return fallback;
  // URL absoluta o base64
  if (/^https?:\/\//i.test(avatar) || avatar.startsWith('data:')) return avatar;
  // Nombre de archivo => normalizar
  const nombreArchivo = String(avatar).split(/[\\/]/).pop();
  return `${backendBaseUrl()}/img/foto/${encodeURIComponent(nombreArchivo)}`;
}

function normJugador(j, i) {
  return {
    id: i + 1,
    nombre: j?.Nombre ?? j?.nombre ?? `Jugador ${i + 1}`,
    avatar: j?.Avatar ?? j?.avatar ?? null,
    cartas: [],
    turno: i === 0
  };
}

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

    let jugadoresData = localStorage.getItem('jugadoresPartida');
    modoOfflineActivo = localStorage.getItem('modoOffline') === 'true';

    console.log(' Datos del backend recuperados:', {
      partidaId: partidaBackendId,
      codigo: codigoPartidaBackend,
      modoOffline: modoOfflineActivo,
      jugadores: jugadoresData ? 'Disponible' : 'No disponible'
    });

    if (jugadoresData) {
      try {
        const parsed = JSON.parse(jugadoresData);
        if (Array.isArray(parsed)) jugadoresBackend = parsed;
      } catch (e) {
        console.warn(' jugadoresPartida en localStorage está corrupto o no es JSON válido:', e);
        jugadoresBackend = [];
      }
      console.log(' Jugadores registrados (cache):', jugadoresBackend);
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
    const response = await fetch(`${API_BASE}/partida/${encodeURIComponent(partidaBackendId)}/estado`);
    if (!response.ok) throw new Error(`No se pudo conectar con el backend (HTTP ${response.status})`);

    const estadoPartida = await response.json();
    console.log(' Conectado con backend - Estado:', estadoPartida);

    if (Array.isArray(estadoPartida?.jugadores)) {
      jugadoresBackend = estadoPartida.jugadores;
      // Actualizar el sistema/ UI con datos frescos del backend
      actualizarSistemaConJugadoresReales();
    }
  } catch (error) {
    console.error(' Backend no disponible, continuando en modo offline:', error);
    modoOfflineActivo = true;
  }
}

function actualizarSistemaConJugadoresReales() {
  console.log(' Actualizando sistema con jugadores reales...');

  if (Array.isArray(jugadoresBackend) && jugadoresBackend.length > 0) {
    // Crear/actualizar la variable global que el juego espera
    window.jugadoresPartida = jugadoresBackend.map((j, i) => normJugador(j, i));

    console.log(' Jugadores actualizados en el sistema:', window.jugadoresPartida);
    // Actualizar interfaz de jugadores (usando los normalizados)
    actualizarInterfazJugadores();
  } else {
    // Si no hay jugadores, asegúrate de limpiar la UI
    window.jugadoresPartida = [];
    actualizarInterfazJugadores();
  }
}

function actualizarInterfazJugadores() {
  console.log(' Actualizando la interfaz para los jugadores...');
  const lista = Array.isArray(window.jugadoresPartida) ? window.jugadoresPartida : [];
  actualizarUIJugadorCompleto(1, lista[0] ?? null);
  actualizarUIJugadorCompleto(2, lista[1] ?? null);
  console.log(' Interfaz de jugadores actualizada.');
}

/**
 * Función robusta para actualizar el nombre y avatar de un jugador en la UI.
 * @param {number} numeroJugador - El número del jugador (1 o 2).
 * @param {object | null} datosJugador - Objeto del jugador ya normalizado o null.
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

  if (!datosJugador) {
    contenedor.style.display = 'none';
    return;
  }

  contenedor.style.display = 'block';
  nombreEl.value = datosJugador.nombre ?? `Jugador ${numeroJugador}`;
  avatarEl.alt = `Avatar de ${nombreEl.value}`;
  avatarEl.src = resolveAvatarSrc(datosJugador.avatar);
  avatarEl.onerror = () => { avatarEl.src = '../img/foto/icono.png'; };

  console.log(` Interfaz del jugador ${numeroJugador} actualizada`);
}

//  VARIABLE GLOBAL PARA DEBUGGING - ACCESIBLE DESDE CONSOLA Y LOCALSTORAGE
window.debugInfo = {
  errores: [],
  partidaData: {},
  dependencias: {},
  localStorage: {},
  ultimoError: null,

  cargarDesdeLocalStorage: function() {
    try {
      const erroresGuardados = localStorage.getItem('debugInfo_errores');
      const ultimoErrorGuardado = localStorage.getItem('debugInfo_ultimoError');
      const partidaDataGuardada = localStorage.getItem('debugInfo_partidaData');

      if (erroresGuardados) this.errores = JSON.parse(erroresGuardados);
      if (ultimoErrorGuardado) this.ultimoError = JSON.parse(ultimoErrorGuardado);
      if (partidaDataGuardada) this.partidaData = JSON.parse(partidaDataGuardada);

      console.log(' Errores cargados desde localStorage:', this.errores.length, 'errores encontrados');
    } catch (e) {
      console.warn(' Error cargando debug info desde localStorage:', e);
    }
  },

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

  verErrores: function() {
    console.table(this.errores);
    console.log(' También disponible en localStorage como debugInfo_errores');
    return this.errores;
  },

  ultimoErrorDetalle: function() {
    console.log(' ÚLTIMO ERROR DETALLADO:', this.ultimoError);
    console.log(' También disponible en localStorage como debugInfo_ultimoError');
    return this.ultimoError;
  },

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

  agregarError: function(error, partidaData, dependencias) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error?.message ?? String(error),
      name: error?.name ?? 'Error',
      stack: error?.stack ?? null,
      partidaData: partidaData || {},
      dependencias: dependencias || {}
    };

    this.ultimoError = errorInfo;
    this.errores.push(errorInfo);
    this.partidaData = partidaData || {};
    this.dependencias = dependencias || {};
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

// Interceptar intentos de redirección (solo en debugMode)
if (window.debugMode) {
  const originalReplace = window.location.replace.bind(window.location);
  const originalAssign  = window.location.assign.bind(window.location);

  window.location.replace = function(url) {
    if (window.preventRedirects) {
      console.warn(' REDIRECCIÓN BLOQUEADA (replace):', url);
      console.warn(' Para habilitar redirecciones: window.preventRedirects = false');
      return;
    }
    return originalReplace(url);
  };

  window.location.assign = function(url) {
    if (window.preventRedirects) {
      console.warn(' REDIRECCIÓN BLOQUEADA (assign):', url);
      console.warn(' Para habilitar redirecciones: window.preventRedirects = false');
      return;
    }
    return originalAssign(url);
  };
}

class SalaBackend {
  constructor() {
    this.partidaId = null;
    this.jugadorId = null;
    this.jugadorNombre = null;
    this.gameFlowController = null; // usar GameFlowController
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

      // Iniciar polling de estado (delegado)
      this.iniciarPolling();

      console.log(' Sala inicializada correctamente');

    } catch (error) {
      console.error(' Error al inicializar sala:', error);

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

      window.debugInfo.agregarError(error, partidaData, dependencias);
      window.debugInfo.localStorage = { ...localStorage };

      this.mostrarErrorPersistente(error);
    }
  }

  suscribirseAEventos() {
    console.log(' Eventos manejados por GameFlowController');
  }

  async cargarEstadoPartida() {
    console.log(' Estado manejado por GameFlowController');
  }

  configurarInterfaz() {
    console.log(' Configurando interfaz inicial...');
    this.actualizarInfoJugador();
    console.log(' Interfaz configurada - GameFlowController activo');
  }

  actualizarInfoJugador() {
    const elementosNombre = document.querySelectorAll('.nombre-jugador-actual');
    elementosNombre.forEach(el => {
      el.textContent = this.jugadorNombre || 'Jugador';
    });
    console.log(' Información del jugador actualizada');
  }

  configurarSeleccionCartas() {
    document.addEventListener('click', (event) => {
      const carta = event.target.closest('.carta');
      if (carta && carta.dataset.cartaId) {
        this.seleccionarCarta?.(carta);
      }
    });
  }

  getEstadoActual() {
    if (this.gameFlowController?.getEstadoActual) {
      return this.gameFlowController.getEstadoActual();
    }
    return {
      partidaId: this.partidaId,
      jugadorId: this.jugadorId,
      error: 'GameFlowController no inicializado'
    };
  }

  mostrarError(mensaje) {
    console.error('Error:', mensaje);

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

    setTimeout(() => {
      if (errorDiv.parentNode) errorDiv.remove();
    }, 5000);
  }

  mostrarErrorPersistente(error) {
    console.error(' MOSTRANDO ERROR PERSISTENTE PARA DEBUGGING');

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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
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
        • Mensaje: ${error?.message ?? String(error)}<br>
        • Tipo: ${error?.name ?? 'Error'}<br>
        • GameFlowController disponible: ${typeof GameFlowController !== 'undefined' ? ' SÍ' : ' NO'}
      </div>

      <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
        <strong> STACK TRACE:</strong><br>
        <pre style="white-space: pre-wrap; font-size: 10px;">${error?.stack || 'No stack disponible'}</pre>
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

    const panelAnterior = document.querySelector('.error-panel-debug');
    if (panelAnterior) panelAnterior.remove();
    document.body.appendChild(errorPanel);

    console.error(' === COPIA ESTE ERROR PARA ANÁLISIS ===');
    console.error(JSON.stringify({
      partidaId: this.partidaId,
      jugadorId: this.jugadorId,
      jugadorNombre: this.jugadorNombre,
      errorMessage: error?.message ?? String(error),
      errorName: error?.name ?? 'Error',
      errorStack: error?.stack ?? null,
      gameFlowControllerDisponible: typeof GameFlowController !== 'undefined',
      localStorage: { ...localStorage }
    }, null, 2));
  }

  destroy() {
    if (this.gameFlowController?.destroy) {
      this.gameFlowController.destroy();
    }
    console.log(' SalaBackend destruido');
  }

  iniciarPolling() {
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
      console.error(' MANTENIENDO EN PÁGINA ACTUAL PARA ANÁLISIS DE ERRORES');
      console.error(' Usa window.debugInfo.verErrores() para ver los errores');
    });

    console.log(' SalaBackend inicializada automáticamente - SIN REDIRECCIONES');
  }
});

// Exportar para uso global
window.SalaBackend = SalaBackend;
