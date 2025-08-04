/**
 * Servicio para manejo de Jugadores
 * Card Battles At Freddy's
 */

class JugadorService extends BaseApiService {
    constructor() {
        super(API_ENDPOINTS.JUGADORES);
    }

    /**
     * Obtiene jugadores por partida
     * @param {number} partidaId - ID de la partida
     * @returns {Promise<Array>} Lista de jugadores en la partida
     */
    async getByPartida(partidaId) {
        try {
            const url = buildUrl(API_ENDPOINTS.JUGADORES_BY_PARTIDA, { partidaId });
            return await makeRequest(url);
        } catch (error) {
            console.error(`Error al obtener jugadores de la partida ${partidaId}:`, error);
            throw error;
        }
    }

    /**
     * Crea un nuevo jugador en la sala/partida
     * @param {string} nombre - Nombre del jugador
     * @param {string} avatar - Avatar seleccionado por el jugador
     * @param {number} partidaId - ID de la partida
     * @param {number} posicionTurno - Posición en el turno (orden de registro)
     * @returns {Promise<Object>} Jugador creado
     */
    async crearJugador(nombre, avatar, partidaId, posicionTurno) {
        try {
            const jugadorData = {
                nombre: nombre,
                avatar: avatar,
                idPartida: partidaId,
                posicionTurno: posicionTurno,
                puntosAcumulados: 0,
                estado: true,
                fechaCreacion: new Date().toISOString()
            };

            const jugadorCreado = await this.create(jugadorData);
            console.log(`✅ Jugador creado: ${nombre} (Avatar: ${avatar}) en posición ${posicionTurno}`);
            return jugadorCreado;
        } catch (error) {
            console.error(`❌ Error al crear jugador ${nombre}:`, error);
            throw error;
        }
    }

    /**
     * Añade múltiples jugadores a una sala en orden
     * @param {Array} jugadores - Array de objetos {nombre, avatar}
     * @param {number} partidaId - ID de la partida
     * @returns {Promise<Array>} Lista de jugadores creados
     */
    async añadirJugadoresASala(jugadores, partidaId) {
        try {
            console.log(`🎮 Añadiendo ${jugadores.length} jugadores a la sala ${partidaId}`);
            
            const jugadoresCreados = [];
            
            for (let i = 0; i < jugadores.length; i++) {
                const { nombre, avatar } = jugadores[i];
                const posicionTurno = i + 1; // Posición basada en orden de registro
                
                const jugador = await this.crearJugador(nombre, avatar, partidaId, posicionTurno);
                jugadoresCreados.push(jugador);
            }
            
            console.log(`✅ ${jugadoresCreados.length} jugadores añadidos exitosamente`);
            return jugadoresCreados;
        } catch (error) {
            console.error('❌ Error al añadir jugadores a la sala:', error);
            throw error;
        }
    }

    /**
     * Suma puntos a un jugador (para cuando gana una ronda)
     * @param {number} jugadorId - ID del jugador
     * @param {number} puntos - Puntos a sumar (normalmente 1 por ronda ganada)
     * @returns {Promise<Object>} Jugador actualizado
     */
    async sumarPuntos(jugadorId, puntos = 1) {
        try {
            const jugador = await this.getById(jugadorId);
            const nuevaPuntuacion = (jugador.puntosAcumulados || 0) + puntos;
            
            console.log(`🏆 Sumando ${puntos} punto(s) al jugador ${jugador.nombre} (Total: ${nuevaPuntuacion})`);
            
            return await this.mergePatch(jugadorId, {
                puntosAcumulados: nuevaPuntuacion
            });
        } catch (error) {
            console.error(`Error al sumar ${puntos} puntos al jugador ${jugadorId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene el ranking final de jugadores de una partida (ordenado por puntos)
     * @param {number} partidaId - ID de la partida
     * @returns {Promise<Array>} Jugadores ordenados por puntuación descendente
     */
    async getRankingFinal(partidaId) {
        try {
            const jugadores = await this.getByPartida(partidaId);
            
            return jugadores
                .sort((a, b) => (b.puntosAcumulados || 0) - (a.puntosAcumulados || 0))
                .map((jugador, index) => ({
                    ...jugador,
                    posicion: index + 1,
                    esGanador: index === 0
                }));
        } catch (error) {
            console.error(`Error al obtener ranking final de la partida ${partidaId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene el ganador de una partida
     * @param {number} partidaId - ID de la partida
     * @returns {Promise<Object|null>} Jugador ganador o null si no hay ganador
     */
    async getGanador(partidaId) {
        try {
            const ranking = await this.getRankingFinal(partidaId);
            
            if (ranking.length === 0) return null;
            
            const ganador = ranking[0];
            return ganador.posicion === 1 ? ganador : null;
        } catch (error) {
            console.error(`Error al obtener ganador de la partida ${partidaId}:`, error);
            throw error;
        }
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JugadorService;
} else {
    window.JugadorService = JugadorService;
}
