/**
 * Servicio para manejo de Rondas
 * Card Battles At Freddy's
 */

class RondaService extends BaseApiService {
    constructor() {
        super(API_ENDPOINTS.RONDAS);
    }

    /**
     * Obtiene rondas por partida
     * @param {number} partidaId - ID de la partida
     * @returns {Promise<Array>} Lista de rondas de la partida
     */
    async getByPartida(partidaId) {
        try {
            const url = buildUrl(`${API_ENDPOINTS.RONDAS_BY_PARTIDA}/${partidaId}`);
            return await makeRequest(url);
        } catch (error) {
            console.error(`Error al obtener rondas de la partida ${partidaId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene la ronda actual de una partida
     * @param {number} partidaId - ID de la partida
     * @returns {Promise<Object|null>} Ronda actual o null si no existe
     */
    async getRondaActual(partidaId) {
        try {
            const url = buildUrl(API_ENDPOINTS.RONDA_ACTUAL, { partidaId });
            return await makeRequest(url);
        } catch (error) {
            console.error(`Error al obtener ronda actual de la partida ${partidaId}:`, error);
            throw error;
        }
    }

    /**
     * Crea una nueva ronda
     * @param {number} partidaId - ID de la partida
     * @param {number} numero - Número de la ronda
     * @param {string} atributoComparar - Atributo para comparar en esta ronda
     * @returns {Promise<Object>} Ronda creada
     */
    async crearRonda(partidaId, numero, atributoComparar) {
        try {
            const rondaData = {
                partidaId: partidaId,
                numero: numero,
                atributoComparar: atributoComparar,
                estado: 'EnProgreso',
                fechaInicio: new Date().toISOString(),
                ganadorId: null,
                fechaFin: null
            };

            const rondaCreada = await this.create(rondaData);
            console.log(` Ronda ${numero} creada para partida ${partidaId} (Atributo: ${atributoComparar})`);
            return rondaCreada;
        } catch (error) {
            console.error(` Error al crear ronda ${numero} para partida ${partidaId}:`, error);
            throw error;
        }
    }

    /**
     * Finaliza una ronda estableciendo el ganador
     * @param {number} rondaId - ID de la ronda
     * @param {number} ganadorId - ID del jugador ganador
     * @returns {Promise<Object>} Ronda finalizada
     */
    async finalizarRonda(rondaId, ganadorId) {
        try {
            const rondaFinalizada = await this.mergePatch(rondaId, {
                estado: 'Finalizada',
                ganadorId: ganadorId,
                fechaFin: new Date().toISOString()
            });
            
            console.log(` Ronda ${rondaId} finalizada, ganador: ${ganadorId}`);
            return rondaFinalizada;
        } catch (error) {
            console.error(`Error al finalizar ronda ${rondaId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene el ganador de una ronda específica
     * @param {number} rondaId - ID de la ronda
     * @returns {Promise<Object|null>} Ganador de la ronda o null
     */
    async getGanadorRonda(rondaId) {
        try {
            const ronda = await this.getById(rondaId);
            
            if (!ronda.ganadorId) {
                return null;
            }
            
            // Obtener información del jugador ganador
            if (window.jugadorService) {
                return await window.jugadorService.getById(ronda.ganadorId);
            }
            
            return { id: ronda.ganadorId };
        } catch (error) {
            console.error(`Error al obtener ganador de la ronda ${rondaId}:`, error);
            throw error;
        }
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RondaService;
} else {
    window.RondaService = RondaService;
}