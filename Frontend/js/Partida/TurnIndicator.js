/**
 * Indicador de Turnos
 * Card Battles At Freddy's
 * 
 * Muestra visualmente de quién es el turno y el estado de cada jugador
 */

class TurnIndicator {
    constructor(gameFlowController) {
        this.gameFlow = gameFlowController;
        this.jugadoresIndicadores = [];
        this.contenedorIndicadores = null;
        
        console.log(' TurnIndicator inicializado');
    }

    /**
     * Inicializa el indicador de turnos
     */
    async init() {
        try {
            this.crearContenedorIndicadores();
            this.crearIndicadoresJugadores();
            this.actualizarIndicadores();
            
            console.log(' TurnIndicator inicializado correctamente');
            
        } catch (error) {
            console.error(' Error inicializando TurnIndicator:', error);
            throw error;
        }
    }

    /**
     * Crea el contenedor principal de indicadores
     */
    crearContenedorIndicadores() {
        // Buscar si ya existe
        this.contenedorIndicadores = document.querySelector('.indicadores-turnos');
        
        if (!this.contenedorIndicadores) {
            this.contenedorIndicadores = document.createElement('div');
            this.contenedorIndicadores.className = 'indicadores-turnos';
            
            // Insertar en la interfaz
            const contenedorPrincipal = document.querySelector('.completo-iconos-usuario');
            if (contenedorPrincipal) {
                contenedorPrincipal.appendChild(this.contenedorIndicadores);
            } else {
                document.body.appendChild(this.contenedorIndicadores);
            }
        }
    }

    /**
     * Crea los indicadores individuales para cada jugador
     */
    crearIndicadoresJugadores() {
        if (!this.gameFlow.jugadores || this.gameFlow.jugadores.length === 0) {
            console.warn(' No hay jugadores para crear indicadores');
            return;
        }
        
        // Limpiar indicadores existentes
        this.contenedorIndicadores.innerHTML = '';
        this.jugadoresIndicadores = [];
        
        // Crear indicador para cada jugador
        this.gameFlow.jugadores.forEach((jugador, index) => {
            const indicador = this.crearIndicadorJugador(jugador, index);
            this.jugadoresIndicadores.push({
                elemento: indicador,
                jugador: jugador,
                index: index
            });
            
            this.contenedorIndicadores.appendChild(indicador);
        });
        
        console.log(' Indicadores de jugadores creados:', this.jugadoresIndicadores.length);
    }

    /**
     * Crea un indicador individual para un jugador
     */
    crearIndicadorJugador(jugador, index) {
        const indicador = document.createElement('div');
        indicador.className = 'indicador-jugador';
        indicador.dataset.jugadorId = jugador.id;
        indicador.dataset.posicion = jugador.posicionTurno;
        
        // Determinar si es el jugador actual
        const esJugadorActual = jugador.id === parseInt(this.gameFlow.jugadorActualId);
        
        indicador.innerHTML = `
            <div class="avatar-contenedor">
                <img src="${jugador.avatar}" alt="${jugador.nombre}" class="avatar-jugador">
                <div class="indicador-turno"></div>
                <div class="indicador-estado"></div>
            </div>
            <div class="info-jugador">
                <div class="nombre-jugador">${jugador.nombre}${esJugadorActual ? ' (Tú)' : ''}</div>
                <div class="puntos-jugador">${jugador.puntosAcumulados || 0} pts</div>
                <div class="posicion-turno">T${jugador.posicionTurno}</div>
            </div>
            <div class="estado-ronda">
                <span class="texto-estado">Esperando...</span>
            </div>
        `;
        
        return indicador;
    }

    /**
     * Actualiza todos los indicadores según el estado actual del juego
     */
    actualizarIndicadores() {
        if (!this.jugadoresIndicadores.length) {
            console.warn(' No hay indicadores para actualizar');
            return;
        }
        
        const estadoJuego = this.gameFlow.getEstadoActual();
        
        this.jugadoresIndicadores.forEach((indicadorData, index) => {
            this.actualizarIndicadorJugador(indicadorData, estadoJuego);
        });
        
        console.log(' Indicadores actualizados');
    }

    /**
     * Actualiza un indicador específico de jugador
     */
    actualizarIndicadorJugador(indicadorData, estadoJuego) {
        const { elemento, jugador } = indicadorData;
        const esJugadorDelTurno = this.esJugadorDelTurno(jugador, estadoJuego);
        const esJugadorQueElige = jugador.id === estadoJuego.esElQueElige;
        const yaJugo = this.jugadorYaJugo(jugador.id);
        
        // Actualizar clases CSS
        elemento.className = 'indicador-jugador';
        
        if (esJugadorDelTurno) {
            elemento.classList.add('turno-activo');
        }
        
        if (esJugadorQueElige) {
            elemento.classList.add('elige-atributo');
        }
        
        if (yaJugo) {
            elemento.classList.add('ya-jugo');
        }
        
        // Actualizar indicador de turno
        const indicadorTurno = elemento.querySelector('.indicador-turno');
        if (indicadorTurno) {
            indicadorTurno.style.display = esJugadorDelTurno ? 'block' : 'none';
        }
        
        // Actualizar estado visual
        this.actualizarEstadoVisual(elemento, jugador, estadoJuego, yaJugo);
        
        // Actualizar puntos
        const puntosElement = elemento.querySelector('.puntos-jugador');
        if (puntosElement) {
            puntosElement.textContent = `${jugador.puntosAcumulados || 0} pts`;
        }
    }

    /**
     * Actualiza el estado visual de un jugador
     */
    actualizarEstadoVisual(elemento, jugador, estadoJuego, yaJugo) {
        const estadoElement = elemento.querySelector('.texto-estado');
        const indicadorEstado = elemento.querySelector('.indicador-estado');
        
        if (!estadoElement || !indicadorEstado) return;
        
        let textoEstado = '';
        let claseEstado = '';
        
        if (estadoJuego.faseActual === 'FINALIZADA') {
            textoEstado = 'Partida terminada';
            claseEstado = 'finalizada';
        } else if (yaJugo) {
            textoEstado = 'Carta jugada ✓';
            claseEstado = 'completado';
        } else if (this.esJugadorDelTurno(jugador, estadoJuego)) {
            if (estadoJuego.esElQueElige && !estadoJuego.rondaActual?.atributoCompetido) {
                textoEstado = 'Eligiendo atributo...';
                claseEstado = 'eligiendo';
            } else {
                textoEstado = 'Seleccionando carta...';
                claseEstado = 'seleccionando';
            }
        } else {
            textoEstado = 'Esperando turno...';
            claseEstado = 'esperando';
        }
        
        estadoElement.textContent = textoEstado;
        indicadorEstado.className = `indicador-estado ${claseEstado}`;
    }

    /**
     * Verifica si un jugador es el del turno actual
     */
    esJugadorDelTurno(jugador, estadoJuego) {
        // En la fase de selección, cualquier jugador que no haya jugado puede ser "del turno"
        if (estadoJuego.faseActual === 'SELECCIONANDO_CARTA') {
            return !this.jugadorYaJugo(jugador.id);
        }
        
        // En otras fases, solo el jugador que elige el atributo está "en turno"
        return jugador.id === estadoJuego.esElQueElige;
    }

    /**
     * Verifica si un jugador ya jugó en la ronda actual
     */
    jugadorYaJugo(jugadorId) {
        return this.gameFlow.cartasJugadasRonda.some(jugada => 
            jugada.idJugador === parseInt(jugadorId)
        );
    }

    /**
     * Resalta el jugador que debe elegir el atributo
     */
    resaltarJugadorQueElige() {
        // Quitar resaltado anterior
        this.jugadoresIndicadores.forEach(({ elemento }) => {
            elemento.classList.remove('elige-atributo-destacado');
        });
        
        // Resaltar jugador actual que elige
        if (this.gameFlow.esJugadorQueEligeAtributo()) {
            const indicadorActual = this.jugadoresIndicadores.find(
                ({ jugador }) => jugador.id === parseInt(this.gameFlow.jugadorActualId)
            );
            
            if (indicadorActual) {
                indicadorActual.elemento.classList.add('elige-atributo-destacado');
            }
        }
    }

    /**
     * Muestra un mensaje temporal sobre el estado del turno
     */
    mostrarMensajeTurno(mensaje, duracion = 3000) {
        // Remover mensaje anterior si existe
        const mensajeAnterior = document.querySelector('.mensaje-turno');
        if (mensajeAnterior) mensajeAnterior.remove();
        
        const mensajeElement = document.createElement('div');
        mensajeElement.className = 'mensaje-turno';
        mensajeElement.textContent = mensaje;
        
        this.contenedorIndicadores.appendChild(mensajeElement);
        
        // Auto-remover después del tiempo especificado
        setTimeout(() => {
            if (mensajeElement.parentNode) {
                mensajeElement.remove();
            }
        }, duracion);
    }

    /**
     * Actualiza la información de puntos de todos los jugadores
     */
    async actualizarPuntos() {
        try {
            // Recargar información de jugadores desde el backend
            const response = await fetch(`http://localhost:7147/api/jugador/partida/${this.gameFlow.partidaId}`);
            if (!response.ok) return;
            
            const jugadoresActualizados = await response.json();
            
            // Actualizar puntos en la interfaz
            jugadoresActualizados.forEach(jugador => {
                const indicador = this.jugadoresIndicadores.find(
                    ({ jugador: j }) => j.id === jugador.id
                );
                
                if (indicador) {
                    const puntosElement = indicador.elemento.querySelector('.puntos-jugador');
                    if (puntosElement) {
                        puntosElement.textContent = `${jugador.puntosAcumulados || 0} pts`;
                    }
                    
                    // Actualizar en memoria
                    indicador.jugador.puntosAcumulados = jugador.puntosAcumulados;
                }
            });
            
        } catch (error) {
            console.error(' Error actualizando puntos:', error);
        }
    }

    /**
     * Marca visualmente que un jugador ha completado su jugada
     */
    marcarJugadorCompletado(jugadorId) {
        const indicador = this.jugadoresIndicadores.find(
            ({ jugador }) => jugador.id === parseInt(jugadorId)
        );
        
        if (indicador) {
            indicador.elemento.classList.add('ya-jugo');
            
            const estadoElement = indicador.elemento.querySelector('.texto-estado');
            if (estadoElement) {
                estadoElement.textContent = 'Carta jugada ✓';
            }
        }
    }

    /**
     * Resetea los indicadores para una nueva ronda
     */
    resetearParaNuevaRonda() {
        this.jugadoresIndicadores.forEach(({ elemento }) => {
            elemento.classList.remove('ya-jugo', 'completado');
            
            const estadoElement = elemento.querySelector('.texto-estado');
            if (estadoElement) {
                estadoElement.textContent = 'Esperando...';
            }
            
            const indicadorEstado = elemento.querySelector('.indicador-estado');
            if (indicadorEstado) {
                indicadorEstado.className = 'indicador-estado esperando';
            }
        });
        
        console.log(' Indicadores reseteados para nueva ronda');
    }

    /**
     * Muestra el conteo de jugadores que han jugado
     */
    mostrarProgresoRonda() {
        const totalJugadores = this.gameFlow.jugadores.length;
        const jugadoresCompletados = this.gameFlow.cartasJugadasRonda.length;
        
        this.mostrarMensajeTurno(
            `Jugadores que han jugado: ${jugadoresCompletados}/${totalJugadores}`,
            2000
        );
    }

    /**
     * Obtiene información del estado actual de los indicadores
     */
    getEstadoIndicadores() {
        return {
            totalJugadores: this.jugadoresIndicadores.length,
            jugadoresCompletados: this.gameFlow.cartasJugadasRonda.length,
            jugadorDelTurno: this.gameFlow.turnoActualIndex,
            fase: this.gameFlow.faseActual
        };
    }

    /**
     * Limpia recursos
     */
    destroy() {
        if (this.contenedorIndicadores && this.contenedorIndicadores.parentNode) {
            this.contenedorIndicadores.remove();
        }
        
        this.jugadoresIndicadores = [];
        this.contenedorIndicadores = null;
        
        console.log(' TurnIndicator destruido');
    }
}

// Exportar para uso global
window.TurnIndicator = TurnIndicator;

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TurnIndicator;
}
