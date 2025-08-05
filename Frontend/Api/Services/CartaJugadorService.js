/**
 * Servicio para manejo de CartaJugador
 * Card Battles At Freddy's
 */

class CartaJugadorService extends BaseApiService {
    constructor() {
        super(API_ENDPOINTS.CARTA_JUGADOR);
    }

    /**
     * Obtiene las cartas de un jugador específico
     * @param {number} jugadorId - ID del jugador
     * @returns {Promise<Array>} Lista de cartas del jugador
     */
    async getByJugador(jugadorId) {
        try {
            const url = buildUrl(API_ENDPOINTS.CARTA_JUGADOR_BY_JUGADOR, { jugadorId });
            return await makeRequest(url);
        } catch (error) {
            console.error(`Error al obtener cartas del jugador ${jugadorId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene el mazo de cartas de un jugador (cartas disponibles para jugar)
     * @param {number} jugadorId - ID del jugador
     * @returns {Promise<Array>} Mazo de cartas del jugador
     */
    async getMazoJugador(jugadorId) {
        try {
            const url = buildUrl(API_ENDPOINTS.CARTA_JUGADOR_MAZO, { jugadorId });
            return await makeRequest(url);
        } catch (error) {
            console.error(`Error al obtener mazo del jugador ${jugadorId}:`, error);
            throw error;
        }
    }

    /**
     * Asigna cartas iniciales a un jugador cuando se une a una partida
     * @param {number} jugadorId - ID del jugador
     * @param {number} cantidadCartas - Cantidad de cartas a asignar (por defecto 5)
     * @returns {Promise<Array>} Cartas asignadas al jugador
     */
    async asignarCartasIniciales(jugadorId, cantidadCartas = 5) {
        try {
            console.log(` Asignando ${cantidadCartas} cartas iniciales al jugador ${jugadorId}`);
            
            // Obtener todas las cartas disponibles
            const cartasDisponibles = await this.obtenerCartasParaAsignar();
            
            if (cartasDisponibles.length < cantidadCartas) {
                throw new Error(`No hay suficientes cartas disponibles. Se requieren ${cantidadCartas}, pero solo hay ${cartasDisponibles.length}`);
            }
            
            // Seleccionar cartas aleatorias
            const cartasSeleccionadas = this.seleccionarCartasAleatorias(cartasDisponibles, cantidadCartas);
            
            // Asignar cada carta al jugador
            const cartasAsignadas = [];
            for (const carta of cartasSeleccionadas) {
                const cartaJugador = await this.asignarCartaAJugador(jugadorId, carta.id);
                cartasAsignadas.push(cartaJugador);
            }
            
            console.log(` ${cartasAsignadas.length} cartas asignadas al jugador ${jugadorId}`);
            return cartasAsignadas;
            
        } catch (error) {
            console.error(` Error al asignar cartas iniciales al jugador ${jugadorId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene cartas disponibles para asignar (activas en el sistema)
     * @returns {Promise<Array>} Lista de cartas disponibles
     */
    async obtenerCartasParaAsignar() {
        try {
            // Usar el servicio de cartas para obtener cartas activas
            if (window.cartaService) {
                return await window.cartaService.getActive();
            } else {
                // Fallback: hacer petición directa
                const url = buildUrl(API_ENDPOINTS.CARTAS);
                const todasLasCartas = await makeRequest(url);
                return todasLasCartas.filter(carta => carta.estado === true);
            }
        } catch (error) {
            console.error('Error al obtener cartas para asignar:', error);
            throw error;
        }
    }

    /**
     * Selecciona cartas aleatorias de una lista
     * @param {Array} cartas - Lista de cartas disponibles
     * @param {number} cantidad - Cantidad de cartas a seleccionar
     * @returns {Array} Cartas seleccionadas aleatoriamente
     */
    seleccionarCartasAleatorias(cartas, cantidad) {
        const cartasCopia = [...cartas];
        const cartasSeleccionadas = [];
        
        for (let i = 0; i < cantidad && cartasCopia.length > 0; i++) {
            const indiceAleatorio = Math.floor(Math.random() * cartasCopia.length);
            const cartaSeleccionada = cartasCopia.splice(indiceAleatorio, 1)[0];
            cartasSeleccionadas.push(cartaSeleccionada);
        }
        
        return cartasSeleccionadas;
    }

    /**
     * Asigna una carta específica a un jugador
     * @param {number} jugadorId - ID del jugador
     * @param {number} cartaId - ID de la carta
     * @returns {Promise<Object>} CartaJugador creada
     */
    async asignarCartaAJugador(jugadorId, cartaId) {
        try {
            const cartaJugadorData = {
                idJugador: jugadorId,
                idCarta: cartaId,
                idJugada: 0, // 0 significa que no está asignada a ninguna jugada todavía
                usada: false // Inicialmente no está usada
                // Removemos active por ahora para evitar problemas de mapeo
            };

            const cartaJugador = await this.create(cartaJugadorData);
            console.log(` Carta ${cartaId} asignada al jugador ${jugadorId}`);
            return cartaJugador;
            
        } catch (error) {
            console.error(`Error al asignar carta ${cartaId} al jugador ${jugadorId}:`, error);
            throw error;
        }
    }

    /**
     * Juega una carta del jugador en una jugada específica
     * @param {number} cartaJugadorId - ID de la carta del jugador
     * @param {number} jugadaId - ID de la jugada
     * @returns {Promise<Object>} CartaJugador actualizada
     */
    async jugarCarta(cartaJugadorId, jugadaId) {
        try {
            const url = buildUrl(API_ENDPOINTS.CARTA_JUGADOR_JUGAR, { 
                cartaJugadorId, 
                jugadaId 
            });
            
            const resultado = await makeRequest(url, { method: 'PUT' });
            console.log(` Carta ${cartaJugadorId} jugada en jugada ${jugadaId}`);
            return resultado;
            
        } catch (error) {
            console.error(`Error al jugar carta ${cartaJugadorId} en jugada ${jugadaId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene cartas jugadas en una jugada específica
     * @param {number} jugadaId - ID de la jugada
     * @returns {Promise<Array>} Cartas jugadas en la jugada
     */
    async getByJugada(jugadaId) {
        try {
            const url = buildUrl(API_ENDPOINTS.CARTA_JUGADOR_BY_JUGADA, { jugadaId });
            return await makeRequest(url);
        } catch (error) {
            console.error(`Error al obtener cartas de la jugada ${jugadaId}:`, error);
            throw error;
        }
    }

    /**
     * Reasigna cartas a un jugador (para rondas posteriores)
     * @param {number} jugadorId - ID del jugador
     * @param {number} cantidadCartas - Cantidad de cartas nuevas a asignar
     * @returns {Promise<Array>} Nuevas cartas asignadas
     */
    async reasignarCartas(jugadorId, cantidadCartas = 3) {
        try {
            console.log(` Reasignando ${cantidadCartas} cartas al jugador ${jugadorId}`);
            
            // Obtener cartas restantes en la mano del jugador
            const cartasEnMano = await this.getMazoJugador(jugadorId);
            
            // Calcular cuántas cartas nuevas necesita
            const cartasNecesarias = Math.max(0, cantidadCartas - cartasEnMano.length);
            
            if (cartasNecesarias === 0) {
                console.log(` El jugador ${jugadorId} ya tiene suficientes cartas`);
                return cartasEnMano;
            }
            
            // Asignar cartas adicionales
            const nuevasCartas = await this.asignarCartasIniciales(jugadorId, cartasNecesarias);
            
            console.log(` ${nuevasCartas.length} cartas adicionales asignadas al jugador ${jugadorId}`);
            return [...cartasEnMano, ...nuevasCartas];
            
        } catch (error) {
            console.error(`Error al reasignar cartas al jugador ${jugadorId}:`, error);
            throw error;
        }
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartaJugadorService;
} else {
    window.CartaJugadorService = CartaJugadorService;
}
