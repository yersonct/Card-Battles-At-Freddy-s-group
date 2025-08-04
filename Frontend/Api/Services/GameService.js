/**
 * Servicio principal del juego para coordinar toda la lógica
 * Card Battles At Freddy's
 */

class GameService {
    constructor() {
        this.partidaActual = null;
        this.jugadoresActuales = [];
        this.rondaActual = null;
    }

    /**
     * Inicializa una nueva partida completa
     * @param {Array} jugadores - Datos de los jugadores
     * @returns {Promise<Object>} Información completa de la partida iniciada
     */
    async iniciarPartidaCompleta(jugadores) {
        try {
            console.log('🎮 Iniciando partida completa para', jugadores.length, 'jugadores');

            // 1. Crear la partida
            const nombrePartida = `FNAF Battle ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
            this.partidaActual = await window.partidaService.crearPartida(nombrePartida, jugadores.length);

            // 2. Registrar jugadores
            this.jugadoresActuales = await window.jugadorService.añadirJugadoresASala(jugadores, this.partidaActual.id);

            // 3. Asignar cartas a cada jugador
            const cartasAsignadas = [];
            for (const jugador of this.jugadoresActuales) {
                const cartas = await window.cartaJugadorService.asignarCartasIniciales(jugador.id, 5);
                cartasAsignadas.push({
                    jugadorId: jugador.id,
                    nombre: jugador.nombre,
                    cartas: cartas
                });
            }

            // 4. Crear primera ronda
            this.rondaActual = await window.rondaService.crearRonda(this.partidaActual.id, 1, 'poder');

            const resultadoCompleto = {
                partida: this.partidaActual,
                jugadores: this.jugadoresActuales,
                cartasAsignadas: cartasAsignadas,
                rondaActual: this.rondaActual,
                estado: 'iniciada'
            };

            console.log('✅ Partida completa iniciada:', resultadoCompleto);
            return resultadoCompleto;

        } catch (error) {
            console.error('❌ Error al iniciar partida completa:', error);
            throw error;
        }
    }

    /**
     * Obtiene el estado actual del juego
     * @returns {Object} Estado actual completo
     */
    getEstadoActual() {
        return {
            partida: this.partidaActual,
            jugadores: this.jugadoresActuales,
            rondaActual: this.rondaActual,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Carga una partida desde sessionStorage
     * @returns {Promise<Object>} Datos de la partida cargada
     */
    async cargarPartidaDesdeStorage() {
        try {
            const datosGuardados = sessionStorage.getItem('partidaActual');
            if (!datosGuardados) {
                throw new Error('No hay partida guardada en sessionStorage');
            }

            const datos = JSON.parse(datosGuardados);
            this.partidaActual = datos.partida;
            this.jugadoresActuales = datos.jugadores;

            console.log('✅ Partida cargada desde storage:', datos);
            return datos;

        } catch (error) {
            console.error('❌ Error al cargar partida desde storage:', error);
            throw error;
        }
    }

    /**
     * Guarda el estado actual en sessionStorage
     */
    guardarEstadoEnStorage() {
        try {
            const estado = this.getEstadoActual();
            sessionStorage.setItem('estadoJuego', JSON.stringify(estado));
            console.log('💾 Estado del juego guardado');
        } catch (error) {
            console.error('❌ Error al guardar estado:', error);
        }
    }

    /**
     * Finaliza la partida actual
     * @param {number} ganadorId - ID del jugador ganador
     * @returns {Promise<Object>} Resultado de la finalización
     */
    async finalizarPartida(ganadorId = null) {
        try {
            if (!this.partidaActual) {
                throw new Error('No hay partida activa para finalizar');
            }

            const resultado = await window.partidaService.finalizarPartida(this.partidaActual.id, ganadorId);
            
            // Limpiar estado local
            this.partidaActual = null;
            this.jugadoresActuales = [];
            this.rondaActual = null;

            // Limpiar storage
            sessionStorage.removeItem('partidaActual');
            sessionStorage.removeItem('estadoJuego');

            console.log('🏁 Partida finalizada:', resultado);
            return resultado;

        } catch (error) {
            console.error('❌ Error al finalizar partida:', error);
            throw error;
        }
    }

    /**
     * Valida que todos los servicios necesarios estén disponibles
     * @returns {boolean} true si todos los servicios están disponibles
     */
    validarServicios() {
        const serviciosRequeridos = [
            'partidaService',
            'jugadorService', 
            'cartaJugadorService',
            'cartaService'
        ];

        for (const servicio of serviciosRequeridos) {
            if (!window[servicio]) {
                console.error(`❌ Servicio ${servicio} no está disponible`);
                return false;
            }
        }

        console.log('✅ Todos los servicios requeridos están disponibles');
        return true;
    }

    /**
     * Reinicia el juego (nueva partida)
     */
    async reiniciarJuego() {
        try {
            // Finalizar partida actual si existe
            if (this.partidaActual) {
                await this.finalizarPartida();
            }

            // Limpiar todo el estado
            this.partidaActual = null;
            this.jugadoresActuales = [];
            this.rondaActual = null;

            // Limpiar storage
            sessionStorage.clear();

            console.log('🔄 Juego reiniciado');
            
        } catch (error) {
            console.error('❌ Error al reiniciar juego:', error);
            throw error;
        }
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameService;
} else {
    window.GameService = GameService;
}
