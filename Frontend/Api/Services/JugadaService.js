/**
 * Servicio para manejo de Jugadas
 * Card Battles At Freddy's
 */

class JugadaService extends BaseApiService {
    constructor() {
        super(API_ENDPOINTS.JUGADAS);
    }

    /**
     * Obtiene jugadas por ronda
     * @param {number} rondaId - ID de la ronda
     * @returns {Promise<Array>} Lista de jugadas de la ronda
     */
    async getByRonda(rondaId) {
        try {
            const url = buildUrl(API_ENDPOINTS.JUGADAS_BY_RONDA, { rondaId });
            return await makeRequest(url);
        } catch (error) {
            console.error(`Error al obtener jugadas de la ronda ${rondaId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene jugadas por jugador
     * @param {number} jugadorId - ID del jugador
     * @returns {Promise<Array>} Lista de jugadas del jugador
     */
    async getByJugador(jugadorId) {
        try {
            const url = buildUrl(API_ENDPOINTS.JUGADAS_BY_JUGADOR, { jugadorId });
            return await makeRequest(url);
        } catch (error) {
            console.error(`Error al obtener jugadas del jugador ${jugadorId}:`, error);
            throw error;
        }
    }

    /**
     * Crea una nueva jugada
     * @param {number} rondaId - ID de la ronda
     * @param {number} jugadorId - ID del jugador
     * @param {number} cartaJugadorId - ID de la carta jugada
     * @returns {Promise<Object>} Jugada creada
     */
    async crearJugada(rondaId, jugadorId, cartaJugadorId) {
        try {
            const jugadaData = {
                idRonda: rondaId,
                idJugador: jugadorId,
                idCartaJugador: cartaJugadorId,
                fechaJugada: new Date().toISOString(),
                estado: true
            };

            const jugada = await this.create(jugadaData);
            console.log(`🎯 Jugada creada: Jugador ${jugadorId} jugó carta ${cartaJugadorId} en ronda ${rondaId}`);
            return jugada;
        } catch (error) {
            console.error(`❌ Error al crear jugada:`, error);
            throw error;
        }
    }

    /**
     * Procesa todas las jugadas de una ronda y determina el ganador
     * @param {number} rondaId - ID de la ronda
     * @param {string} atributoComparar - Atributo a comparar (poder, velocidad, etc.)
     * @returns {Promise<Object>} Resultado con ganador y detalles
     */
    async procesarRonda(rondaId, atributoComparar = 'poder') {
        try {
            console.log(`🎲 Procesando ronda ${rondaId} comparando por ${atributoComparar}`);
            
            // Obtener todas las jugadas de la ronda
            const jugadas = await this.getByRonda(rondaId);
            
            if (jugadas.length === 0) {
                throw new Error('No hay jugadas en esta ronda');
            }

            // Obtener información completa de cada jugada (con carta y jugador)
            const jugadasCompletas = await Promise.all(
                jugadas.map(async (jugada) => {
                    try {
                        // Obtener información de la carta jugada
                        const cartaJugador = await window.cartaJugadorService.getById(jugada.idCartaJugador);
                        const carta = await window.cartaService.getById(cartaJugador.idCarta);
                        const jugador = await window.jugadorService.getById(jugada.idJugador);

                        return {
                            ...jugada,
                            carta: carta,
                            jugador: jugador,
                            valorComparacion: carta[atributoComparar] || 0
                        };
                    } catch (detailError) {
                        console.error(`Error al obtener detalles de jugada ${jugada.id}:`, detailError);
                        return {
                            ...jugada,
                            carta: { nombre: 'Carta desconocida', [atributoComparar]: 0 },
                            jugador: { nombre: 'Jugador desconocido' },
                            valorComparacion: 0
                        };
                    }
                })
            );

            // Determinar ganador (mayor valor en el atributo)
            const jugadaGanadora = jugadasCompletas.reduce((max, current) => 
                current.valorComparacion > max.valorComparacion ? current : max
            );

            // Verificar si hay empate
            const jugadasConMayorValor = jugadasCompletas.filter(
                j => j.valorComparacion === jugadaGanadora.valorComparacion
            );

            const hayEmpate = jugadasConMayorValor.length > 1;

            const resultado = {
                rondaId: rondaId,
                atributoComparado: atributoComparar,
                jugadas: jugadasCompletas,
                ganador: hayEmpate ? null : jugadaGanadora,
                empate: hayEmpate,
                jugadoresEmpatados: hayEmpate ? jugadasConMayorValor : [],
                valorGanador: jugadaGanadora.valorComparacion,
                fechaProcesamiento: new Date().toISOString()
            };

            if (hayEmpate) {
                console.log(`⚖️ Empate en ronda ${rondaId} con valor ${jugadaGanadora.valorComparacion}`);
                console.log('Jugadores empatados:', jugadasConMayorValor.map(j => j.jugador.nombre));
            } else {
                console.log(`🏆 Ganador de ronda ${rondaId}: ${jugadaGanadora.jugador.nombre} con ${jugadaGanadora.carta.nombre} (${atributoComparar}: ${jugadaGanadora.valorComparacion})`);
            }

            return resultado;

        } catch (error) {
            console.error(`❌ Error al procesar ronda ${rondaId}:`, error);
            throw error;
        }
    }

    /**
     * Verifica si todos los jugadores han jugado en una ronda
     * @param {number} rondaId - ID de la ronda
     * @param {Array} jugadoresEsperados - IDs de jugadores que deben jugar
     * @returns {Promise<boolean>} true si todos han jugado
     */
    async todosHanJugado(rondaId, jugadoresEsperados) {
        try {
            const jugadas = await this.getByRonda(rondaId);
            const jugadoresQueJugaron = jugadas.map(j => j.idJugador);
            
            return jugadoresEsperados.every(jugadorId => 
                jugadoresQueJugaron.includes(jugadorId)
            );
        } catch (error) {
            console.error(`Error al verificar si todos han jugado en ronda ${rondaId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de jugadas de un jugador
     * @param {number} jugadorId - ID del jugador
     * @returns {Promise<Object>} Estadísticas del jugador
     */
    async getEstadisticasJugador(jugadorId) {
        try {
            const jugadas = await this.getByJugador(jugadorId);
            
            const estadisticas = {
                totalJugadas: jugadas.length,
                rondasJugadas: new Set(jugadas.map(j => j.idRonda)).size,
                ultimaJugada: jugadas.length > 0 ? 
                    jugadas.sort((a, b) => new Date(b.fechaJugada) - new Date(a.fechaJugada))[0] : null
            };

            return estadisticas;
        } catch (error) {
            console.error(`Error al obtener estadísticas del jugador ${jugadorId}:`, error);
            throw error;
        }
    }

    /**
     * Cancela una jugada (marca como inactiva)
     * @param {number} jugadaId - ID de la jugada a cancelar
     * @returns {Promise<Object>} Jugada cancelada
     */
    async cancelarJugada(jugadaId) {
        try {
            const resultado = await this.mergePatch(jugadaId, { 
                estado: false,
                fechaCancelacion: new Date().toISOString()
            });
            
            console.log(`❌ Jugada ${jugadaId} cancelada`);
            return resultado;
        } catch (error) {
            console.error(`Error al cancelar jugada ${jugadaId}:`, error);
            throw error;
        }
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JugadaService;
} else {
    window.JugadaService = JugadaService;
}
