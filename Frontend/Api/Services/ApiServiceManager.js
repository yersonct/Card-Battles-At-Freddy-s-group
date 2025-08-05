/**
 * Inicializador de Servicios API
 * Card Battles At Freddy's
 * 
 * Este archivo inicializa todos los servicios y los hace disponibles globalmente
 */

// Verificar que la configuración esté cargada
if (typeof API_CONFIG === 'undefined' || typeof API_ENDPOINTS === 'undefined') {
    console.error(' Error: ConfigApi.js debe cargarse antes que los servicios');
    throw new Error('ConfigApi.js no está cargado');
}

// Verificar que las funciones de utilidad estén disponibles
if (typeof buildUrl === 'undefined' || typeof makeRequest === 'undefined') {
    console.error(' Error: Las funciones de utilidad no están disponibles');
    throw new Error('Funciones de utilidad no están cargadas');
}

/**
 * Inicialización de todos los servicios
 */
class ApiServiceManager {
    constructor() {
        this.servicios = {};
        this.inicializado = false;
    }

    /**
     * Inicializa todos los servicios
     */
    async inicializar() {
        try {
            console.log(' Inicializando servicios API...');

            // Crear instancias de servicios individuales
            this.servicios.carta = new CartaService();
            this.servicios.cartaJugador = new CartaJugadorService();
            this.servicios.jugada = new JugadaService();
            this.servicios.jugador = new JugadorService();
            this.servicios.partida = new PartidaService();
            this.servicios.ronda = new RondaService();
            
            // Crear servicio principal del juego
            this.servicios.game = new GameService();

            // Hacer servicios disponibles globalmente
            window.cartaService = this.servicios.carta;
            window.cartaJugadorService = this.servicios.cartaJugador;
            window.jugadaService = this.servicios.jugada;
            window.jugadorService = this.servicios.jugador;
            window.partidaService = this.servicios.partida;
            window.rondaService = this.servicios.ronda;
            window.gameService = this.servicios.game;
            this.exponerServiciosGlobalmente();

            // Verificar conectividad con el backend
            await this.verificarConectividad();

            this.inicializado = true;
            console.log(' Servicios API inicializados correctamente');

        } catch (error) {
            console.error(' Error al inicializar servicios:', error);
            throw error;
        }
    }

    
    /**
     * Expone los servicios en el objeto window para acceso global
     */
    exponerServiciosGlobalmente() {
        // Servicios individuales
        window.cartaService = this.servicios.carta;
        window.cartaJugadorService = this.servicios.cartaJugador;
        window.jugadaService = this.servicios.jugada;
        window.jugadorService = this.servicios.jugador;
        window.partidaService = this.servicios.partida;
        window.rondaService = this.servicios.ronda;
        
        // Servicio principal del juego
        window.gameService = this.servicios.game;
        
        // Manager de servicios
        window.apiManager = this;

        console.log(' Servicios expuestos globalmente');
    }

    /**
     * Verifica la conectividad con el backend
     */
    async verificarConectividad() {
        try {
            console.log(' Verificando conectividad con el backend...');
            
            // Intentar obtener cartas para verificar conectividad
            await this.servicios.carta.getAll();
            
            console.log(' Conectividad verificada');
        } catch (error) {
            console.warn(' No se pudo verificar conectividad:', error.message);
            // No lanzar error para permitir uso offline o con backend desconectado
        }
    }

    /**
     * Obtiene un servicio específico
     * @param {string} nombre - Nombre del servicio
     * @returns {Object} Instancia del servicio
     */
    getServicio(nombre) {
        if (!this.inicializado) {
            throw new Error('Los servicios no han sido inicializados');
        }
        
        const servicio = this.servicios[nombre];
        if (!servicio) {
            throw new Error(`Servicio '${nombre}' no encontrado`);
        }
        
        return servicio;
    }

    /**
     * Recarga la configuración de servicios
     */
    async recargar() {
        console.log(' Recargando servicios...');
        this.inicializado = false;
        await this.inicializar();
    }

    /**
     * Obtiene información sobre el estado de los servicios
     */
    getEstadoServicios() {
        return {
            inicializado: this.inicializado,
            serviciosDisponibles: Object.keys(this.servicios),
            configuracion: {
                baseURL: API_CONFIG.baseURL,
                timeout: API_CONFIG.timeout
            },
            timestamp: new Date().toISOString()
        };
    }
}

// Crear instancia global del manager
const apiManager = new ApiServiceManager();

/**
 * Función de inicialización automática
 * Se ejecuta cuando se carga el documento
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await apiManager.inicializar();
        
        // Disparar evento personalizado para notificar que los servicios están listos
        const eventoServiciosListos = new CustomEvent('serviciosApiListos', {
            detail: {
                servicios: apiManager.servicios,
                manager: apiManager
            }
        });
        
        document.dispatchEvent(eventoServiciosListos);
        
    } catch (error) {
        console.error(' Error durante la inicialización automática:', error);
        
        // Disparar evento de error
        const eventoError = new CustomEvent('errorInicializacionApi', {
            detail: { error }
        });
        
        document.dispatchEvent(eventoError);
    }
});

/**
 * Función de utilidad para esperar a que los servicios estén listos
 * @returns {Promise<Object>} Promesa que se resuelve cuando los servicios están listos
 */
window.esperarServiciosApi = function() {
    return new Promise((resolve, reject) => {
        if (apiManager.inicializado) {
            resolve(apiManager.servicios);
            return;
        }

        // Escuchar el evento de servicios listos
        document.addEventListener('serviciosApiListos', (evento) => {
            resolve(evento.detail.servicios);
        }, { once: true });

        // Escuchar el evento de error
        document.addEventListener('errorInicializacionApi', (evento) => {
            reject(evento.detail.error);
        }, { once: true });

        // Timeout de seguridad
        setTimeout(() => {
            reject(new Error('Timeout: Los servicios tardaron demasiado en inicializarse'));
        }, 10000); // 10 segundos
    });
};

/**
 * Función de utilidad para usar servicios de forma segura
 * @param {Function} callback - Función que usa los servicios
 */
window.usarServiciosApi = async function(callback) {
    try {
        const servicios = await window.esperarServiciosApi();
        return await callback(servicios);
    } catch (error) {
        console.error(' Error al usar servicios API:', error);
        throw error;
    }
};

// Exportar manager para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiServiceManager, apiManager };
}
