/**
 * Controlador Principal del Flujo del Juego
 * Card Battles At Freddy's
 * 
 * Maneja todo el flujo del juego: turnos, fases, estados y coordinación
 */

class GameFlowController {
    constructor() {
        this.partidaId = null;
        this.jugadorActualId = null;
        this.jugadores = [];
        this.estadoPartida = null;
        this.rondaActual = null;
        this.faseActual = 'ESPERANDO'; // ESPERANDO, SELECCIONANDO_CARTA, SELECCIONANDO_ATRIBUTO, ESPERANDO_JUGADORES, COMPARANDO, MOSTRANDO_RESULTADO
        
        // Índices de control
        this.turnoActualIndex = 0;
        this.rondaActualNumero = 1;
        this.cartasJugadasRonda = [];
        
        // Referencias a otros controladores
        this.cardSelector = null;
        this.battleComparator = null;
        this.turnIndicator = null;
        this.rankingDisplay = null;
        
        // Estado de polling
        this.pollingInterval = null;
        
        console.log('🎮 GameFlowController inicializado');
    }

    /**
     * Inicializa el controlador del juego
     */
    async init(partidaId, jugadorActualId) {
        try {
            this.partidaId = partidaId;
            this.jugadorActualId = jugadorActualId;
            
            console.log(' Inicializando GameFlowController:', {
                partidaId: this.partidaId,
                jugadorActualId: this.jugadorActualId
            });

            // Cargar estado inicial
            await this.cargarEstadoPartida();
            
            // Inicializar otros controladores
            await this.inicializarControladores();
            
            // Configurar interfaz inicial
            this.configurarInterfazInicial();
            
            // Iniciar polling para sincronización
            this.iniciarPolling();
            
            // Determinar fase inicial
            await this.determinarFaseActual();
            
            console.log(' GameFlowController inicializado correctamente');
            
        } catch (error) {
            console.error(' Error inicializando GameFlowController:', error);
            throw error;
        }
    }

    /**
     * Carga el estado actual de la partida desde el backend
     */
    async cargarEstadoPartida() {
        try {
            console.log(' Cargando estado de partida...');
            
            // Cargar información de la partida
            const partidaResponse = await fetch(`http://localhost:7147/api/partida/${this.partidaId}`);
            if (!partidaResponse.ok) throw new Error('Error cargando partida');
            this.estadoPartida = await partidaResponse.json();
            
            // Cargar jugadores
            const jugadoresResponse = await fetch(`http://localhost:7147/api/jugador/partida/${this.partidaId}`);
            if (!jugadoresResponse.ok) throw new Error('Error cargando jugadores');
            this.jugadores = await jugadoresResponse.json();
            
            // Ordenar jugadores por posición de turno
            this.jugadores.sort((a, b) => a.posicionTurno - b.posicionTurno);
            
            // Cargar ronda actual si existe
            if (this.estadoPartida.rondaActual > 0) {
                await this.cargarRondaActual();
            }
            
            console.log(' Estado de partida cargado:', {
                partida: this.estadoPartida,
                jugadores: this.jugadores.length,
                ronda: this.rondaActual
            });
            
        } catch (error) {
            console.error(' Error cargando estado de partida:', error);
            throw error;
        }
    }

    /**
     * Carga la información de la ronda actual
     */
    async cargarRondaActual() {
        try {
            const rondaResponse = await fetch(`http://localhost:7147/api/ronda/partida/${this.partidaId}/actual`);
            if (rondaResponse.ok) {
                this.rondaActual = await rondaResponse.json();
                this.rondaActualNumero = this.rondaActual.numeroRonda;
                
                // Cargar cartas jugadas en esta ronda
                await this.cargarCartasJugadasRonda();
            }
        } catch (error) {
            console.error(' Error cargando ronda actual:', error);
        }
    }

    /**
     * Carga las cartas ya jugadas en la ronda actual
     */
    async cargarCartasJugadasRonda() {
        if (!this.rondaActual) return;
        
        try {
            const jugadasResponse = await fetch(`http://localhost:7147/api/jugada/ronda/${this.rondaActual.id}`);
            if (jugadasResponse.ok) {
                this.cartasJugadasRonda = await jugadasResponse.json();
            }
        } catch (error) {
            console.error(' Error cargando cartas jugadas:', error);
        }
    }

    /**
     * Inicializa los controladores auxiliares
     */
    async inicializarControladores() {
        try {
            // Inicializar selector de cartas
            if (typeof CardSelectionManager !== 'undefined') {
                this.cardSelector = new CardSelectionManager(this);
                await this.cardSelector.init();
            }
            
            // Inicializar comparador de batallas
            if (typeof BattleComparator !== 'undefined') {
                this.battleComparator = new BattleComparator(this);
                await this.battleComparator.init();
            }
            
            // Inicializar indicador de turnos
            if (typeof TurnIndicator !== 'undefined') {
                this.turnIndicator = new TurnIndicator(this);
                await this.turnIndicator.init();
            }
            
            // Inicializar ranking final
            if (typeof RankingFinalDisplay !== 'undefined') {
                this.rankingDisplay = new RankingFinalDisplay(this);
                await this.rankingDisplay.init();
            }
            
            console.log(' Controladores auxiliares inicializados');
            
        } catch (error) {
            console.error(' Error inicializando controladores:', error);
        }
    }

    /**
     * Configura la interfaz inicial del juego
     */
    configurarInterfazInicial() {
        // Actualizar información de ronda
        this.actualizarInfoRonda();
        
        // Mostrar indicadores de turno
        if (this.turnIndicator) {
            this.turnIndicator.actualizarIndicadores();
        }
        
        // Ocultar elementos de comparación inicialmente
        this.ocultarElementosComparacion();
    }

    /**
     * Determina la fase actual del juego basada en el estado
     */
    async determinarFaseActual() {
        if (!this.estadoPartida) return;
        
        if (this.estadoPartida.estado === 'Finalizada') {
            this.faseActual = 'FINALIZADA';
            await this.mostrarRankingFinal();
            return;
        }
        
        if (!this.rondaActual) {
            // No hay ronda activa, crear nueva
            this.faseActual = 'SELECCIONANDO_CARTA';
            await this.iniciarNuevaRonda();
            return;
        }
        
        // Verificar si todos han jugado
        const todosHanJugado = this.cartasJugadasRonda.length === this.jugadores.length;
        
        if (todosHanJugado && this.rondaActual.estado === 'EnProgreso') {
            this.faseActual = 'COMPARANDO';
            await this.compararCartas();
        } else if (this.rondaActual.estado === 'Finalizada') {
            this.faseActual = 'MOSTRANDO_RESULTADO';
            await this.mostrarResultadoRonda();
        } else {
            // Determinar si el jugador actual puede seleccionar
            const yaJugo = this.cartasJugadasRonda.some(jugada => jugada.idJugador === parseInt(this.jugadorActualId));
            
            if (yaJugo) {
                this.faseActual = 'ESPERANDO_JUGADORES';
            } else {
                this.faseActual = 'SELECCIONANDO_CARTA';
            }
        }
        
        console.log(' Fase actual determinada:', this.faseActual);
        await this.actualizarInterfazSegunFase();
    }

    /**
     * Inicia una nueva ronda
     */
    async iniciarNuevaRonda() {
        try {
            console.log(' Iniciando nueva ronda:', this.rondaActualNumero);
            
            // Determinar quién elige el atributo (jugador del turno actual)
            const jugadorQueElige = this.jugadores[this.turnoActualIndex];
            
            // Crear nueva ronda en el backend
            const rondaData = {
                idPartida: parseInt(this.partidaId),
                numeroRonda: this.rondaActualNumero,
                atributoCompetido: '', // Se llenará cuando se elija
                idJugadorQueElige: jugadorQueElige.id,
                estado: 'Esperando'
            };
            
            const response = await fetch('http://localhost:7147/api/ronda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rondaData)
            });
            
            if (!response.ok) throw new Error('Error creando ronda');
            
            this.rondaActual = await response.json();
            this.cartasJugadasRonda = [];
            
            // Actualizar información visual
            this.actualizarInfoRonda();
            
            console.log(' Nueva ronda creada:', this.rondaActual);
            
        } catch (error) {
            console.error(' Error iniciando nueva ronda:', error);
            throw error;
        }
    }

    /**
     * Verifica si es el turno del jugador actual para elegir atributo
     */
    esJugadorQueEligeAtributo() {
        if (!this.rondaActual) return false;
        return this.rondaActual.idJugadorQueElige === parseInt(this.jugadorActualId);
    }

    /**
     * Verifica si el jugador actual ya jugó en esta ronda
     */
    jugadorActualYaJugo() {
        return this.cartasJugadasRonda.some(jugada => jugada.idJugador === parseInt(this.jugadorActualId));
    }

    /**
     * Procesa la selección de carta por un jugador
     */
    async onCartaSeleccionada(cartaJugadorId, valorAtributo) {
        try {
            console.log(' Carta seleccionada:', cartaJugadorId, 'Valor:', valorAtributo);
            
            // Crear jugada en el backend
            const jugadaData = {
                idRonda: this.rondaActual.id,
                idJugador: parseInt(this.jugadorActualId),
                idCartaJugador: cartaJugadorId,
                valorAtributo: valorAtributo
            };
            
            const response = await fetch('http://localhost:7147/api/jugada', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jugadaData)
            });
            
            if (!response.ok) throw new Error('Error creando jugada');
            
            // Actualizar estado local
            await this.cargarCartasJugadasRonda();
            
            // Cambiar fase
            this.faseActual = 'ESPERANDO_JUGADORES';
            await this.actualizarInterfazSegunFase();
            
            console.log(' Jugada registrada correctamente');
            
        } catch (error) {
            console.error(' Error procesando carta seleccionada:', error);
            throw error;
        }
    }

    /**
     * Procesa la selección de atributo
     */
    async onAtributoSeleccionado(atributo) {
        try {
            console.log(' Atributo seleccionado:', atributo);
            
            // Actualizar ronda con el atributo elegido
            const updateData = {
                ...this.rondaActual,
                atributoCompetido: atributo,
                estado: 'EnProgreso'
            };
            
            const response = await fetch('http://localhost:7147/api/ronda', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            if (!response.ok) throw new Error('Error actualizando ronda');
            
            this.rondaActual = await response.json();
            
            console.log(' Atributo registrado en la ronda');
            
        } catch (error) {
            console.error(' Error procesando atributo seleccionado:', error);
            throw error;
        }
    }

    /**
     * Compara las cartas jugadas y determina el ganador
     */
    async compararCartas() {
        try {
            console.log(' Comparando cartas de la ronda...');
            
            if (this.battleComparator) {
                await this.battleComparator.mostrarComparacion(this.cartasJugadasRonda, this.rondaActual.atributoCompetido);
            }
            
        } catch (error) {
            console.error(' Error comparando cartas:', error);
        }
    }

    /**
     * Procesa el resultado de la ronda
     */
    async onRondaTerminada(ganadorId) {
        try {
            console.log(' Ronda terminada. Ganador:', ganadorId);
            
            // Actualizar puntos del ganador
            const ganador = this.jugadores.find(j => j.id === ganadorId);
            if (ganador) {
                const response = await fetch(`http://localhost:7147/api/jugador/${ganadorId}/sumarPuntos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ puntos: 1 })
                });
            }
            
            // Marcar ronda como finalizada
            const updateData = {
                ...this.rondaActual,
                idGanador: ganadorId,
                estado: 'Finalizada',
                fechaFin: new Date().toISOString()
            };
            
            await fetch('http://localhost:7147/api/ronda', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            // Verificar si el juego ha terminado
            if (this.rondaActualNumero >= 8) {
                await this.finalizarPartida();
            } else {
                // Preparar siguiente ronda
                await this.prepararSiguienteRonda();
            }
            
        } catch (error) {
            console.error(' Error procesando resultado de ronda:', error);
        }
    }

    /**
     * Prepara la siguiente ronda
     */
    async prepararSiguienteRonda() {
        // Avanzar al siguiente turno
        this.turnoActualIndex = (this.turnoActualIndex + 1) % this.jugadores.length;
        this.rondaActualNumero++;
        
        // Esperar un momento antes de continuar
        setTimeout(async () => {
            await this.iniciarNuevaRonda();
            this.faseActual = 'SELECCIONANDO_CARTA';
            await this.actualizarInterfazSegunFase();
        }, 3000);
    }

    /**
     * Finaliza la partida
     */
    async finalizarPartida() {
        try {
            console.log(' Finalizando partida...');
            
            // Actualizar estado de partida
            const updateData = {
                ...this.estadoPartida,
                estado: 'Finalizada',
                fechaFin: new Date().toISOString()
            };
            
            await fetch('http://localhost:7147/api/partida', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            this.faseActual = 'FINALIZADA';
            await this.mostrarRankingFinal();
            
        } catch (error) {
            console.error(' Error finalizando partida:', error);
        }
    }

    /**
     * Muestra el ranking final
     */
    async mostrarRankingFinal() {
        if (this.rankingDisplay) {
            await this.rankingDisplay.mostrar();
        }
    }

    /**
     * Actualiza la interfaz según la fase actual
     */
    async actualizarInterfazSegunFase() {
        console.log(' Actualizando interfaz para fase:', this.faseActual);
        
        switch (this.faseActual) {
            case 'SELECCIONANDO_CARTA':
                if (this.cardSelector) {
                    this.cardSelector.habilitarSeleccion();
                }
                break;
                
            case 'ESPERANDO_JUGADORES':
                if (this.cardSelector) {
                    this.cardSelector.deshabilitarSeleccion();
                }
                this.mostrarMensajeEspera();
                break;
                
            case 'COMPARANDO':
                await this.compararCartas();
                break;
                
            case 'FINALIZADA':
                await this.mostrarRankingFinal();
                break;
        }
        
        // Actualizar indicadores de turno
        if (this.turnIndicator) {
            this.turnIndicator.actualizarIndicadores();
        }
    }

    /**
     * Actualiza la información de la ronda en la interfaz
     */
    actualizarInfoRonda() {
        const rondaElement = document.querySelector('.numero');
        if (rondaElement) {
            rondaElement.textContent = this.rondaActualNumero;
        }
    }

    /**
     * Oculta elementos de comparación
     */
    ocultarElementosComparacion() {
        const elementos = [
            '.batalla-comparacion',
            '.resultado-ronda',
            '.ranking-final'
        ];
        
        elementos.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'none';
            }
        });
    }

    /**
     * Muestra mensaje de espera
     */
    mostrarMensajeEspera() {
        const message = `Esperando a que los demás jugadores jueguen... (${this.cartasJugadasRonda.length}/${this.jugadores.length})`;
        
        // Aquí puedes mostrar el mensaje en la interfaz
        console.log('esperando', message);
    }

    /**
     * Muestra el resultado de la ronda
     */
    async mostrarResultadoRonda() {
        // Implementar lógica para mostrar resultado
        console.log(' Mostrando resultado de ronda');
    }

    /**
     * Inicia el polling para sincronización
     */
    iniciarPolling() {
        this.pollingInterval = setInterval(async () => {
            try {
                await this.cargarEstadoPartida();
                await this.determinarFaseActual();
            } catch (error) {
                console.error(' Error en polling:', error);
            }
        }, 3000); // Cada 3 segundos
    }

    /**
     * Obtiene información del estado actual
     */
    getEstadoActual() {
        return {
            partidaId: this.partidaId,
            jugadorActualId: this.jugadorActualId,
            faseActual: this.faseActual,
            rondaActual: this.rondaActualNumero,
            turnoActual: this.turnoActualIndex,
            jugadores: this.jugadores,
            cartasJugadas: this.cartasJugadasRonda.length,
            esElQueElige: this.esJugadorQueEligeAtributo(),
            yaJugo: this.jugadorActualYaJugo()
        };
    }

    /**
     * Limpia recursos
     */
    destroy() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        // Limpiar controladores auxiliares
        if (this.cardSelector) this.cardSelector.destroy();
        if (this.battleComparator) this.battleComparator.destroy();
        if (this.turnIndicator) this.turnIndicator.destroy();
        if (this.rankingDisplay) this.rankingDisplay.destroy();
        
        console.log(' GameFlowController destruido');
    }
}

// Exportar para uso global
window.GameFlowController = GameFlowController;

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameFlowController;
}
