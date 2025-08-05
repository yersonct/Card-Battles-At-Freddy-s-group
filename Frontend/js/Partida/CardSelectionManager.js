/**
 * Gestión de Selección de Cartas
 * Card Battles At Freddy's
 * 
 * Maneja la selección de cartas y atributos según el flujo de Figma
 */

class CardSelectionManager {
    constructor(gameFlowController) {
        this.gameFlow = gameFlowController;
        this.cartaSeleccionada = null;
        this.atributoSeleccionado = null;
        this.cartasJugador = [];
        this.atributosDisponibles = ['vida', 'defensa', 'velocidad', 'ataque', 'poder', 'terror'];
        
        // Estados de UI
        this.seleccionHabilitada = false;
        this.mostrandoSeleccionAtributo = false;
        
        console.log(' CardSelectionManager inicializado');
    }

    /**
     * Inicializa el selector de cartas
     */
    async init() {
        try {
            await this.cargarCartasJugador();
            this.configurarEventListeners();
            this.crearInterfazSeleccion();
            
            console.log(' CardSelectionManager inicializado correctamente');
            
        } catch (error) {
            console.error(' Error inicializando CardSelectionManager:', error);
            throw error;
        }
    }

    /**
     * Carga las cartas del jugador actual
     */
    async cargarCartasJugador() {
        try {
            const response = await fetch(`http://localhost:7147/api/cartajugador/jugador/${this.gameFlow.jugadorActualId}`);
            if (!response.ok) throw new Error('Error cargando cartas del jugador');
            
            this.cartasJugador = await response.json();
            
            // Filtrar solo cartas no usadas
            this.cartasJugador = this.cartasJugador.filter(carta => !carta.usada);
            
            console.log(' Cartas del jugador cargadas:', this.cartasJugador.length);
            
        } catch (error) {
            console.error(' Error cargando cartas del jugador:', error);
            throw error;
        }
    }

    /**
     * Configura los event listeners para la selección de cartas
     */
    configurarEventListeners() {
        // Delegación de eventos para las cartas
        document.addEventListener('click', (event) => {
            const carta = event.target.closest('.carta');
            if (carta && this.seleccionHabilitada) {
                this.onCartaClick(carta);
            }
        });
        
        // Event listeners para botones de atributos
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-atributo')) {
                const atributo = event.target.dataset.atributo;
                this.onAtributoClick(atributo);
            }
        });
        
        // Event listeners para confirmar selección
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-confirmar-carta')) {
                this.confirmarSeleccionCarta();
            }
        });
    }

    /**
     * Crea la interfaz de selección de atributos
     */
    crearInterfazSeleccion() {
        // Crear contenedor de selección de atributos si no existe
        let contenedorAtributos = document.querySelector('.seleccion-atributos');
        if (!contenedorAtributos) {
            contenedorAtributos = document.createElement('div');
            contenedorAtributos.className = 'seleccion-atributos';
            contenedorAtributos.style.display = 'none';
            
            contenedorAtributos.innerHTML = `
                <div class="modal-atributos">
                    <div class="modal-content">
                        <h3>Elige el atributo para competir:</h3>
                        <div class="botones-atributos">
                            ${this.atributosDisponibles.map(attr => `
                                <button class="btn-atributo" data-atributo="${attr}">
                                    ${attr.toUpperCase()}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(contenedorAtributos);
        }
        
        // Crear indicador de carta seleccionada
        let indicadorCarta = document.querySelector('.carta-seleccionada-info');
        if (!indicadorCarta) {
            indicadorCarta = document.createElement('div');
            indicadorCarta.className = 'carta-seleccionada-info';
            indicadorCarta.style.display = 'none';
            
            const contenedorJuego = document.querySelector('.container-completo');
            if (contenedorJuego) {
                contenedorJuego.appendChild(indicadorCarta);
            }
        }
    }

    /**
     * Habilita la selección de cartas
     */
    habilitarSeleccion() {
        this.seleccionHabilitada = true;
        this.resaltarCartasDisponibles();
        this.mostrarMensajeInstruccion();
        
        console.log(' Selección de cartas habilitada');
    }

    /**
     * Deshabilita la selección de cartas
     */
    deshabilitarSeleccion() {
        this.seleccionHabilitada = false;
        this.quitarResaltadoCartas();
        this.ocultarMensajeInstruccion();
        
        console.log(' Selección de cartas deshabilitada');
    }

    /**
     * Maneja el click en una carta
     */
    async onCartaClick(cartaElement) {
        try {
            if (!this.seleccionHabilitada) return;
            
            const cartaId = cartaElement.dataset.cartaIndex;
            const cartaJugador = this.cartasJugador.find(c => c.id == cartaId);
            
            if (!cartaJugador || cartaJugador.usada) {
                this.mostrarError('Esta carta ya fue utilizada');
                return;
            }
            
            // Remover selección anterior
            this.limpiarSeleccionAnterior();
            
            // Marcar como seleccionada
            cartaElement.classList.add('carta-seleccionada');
            this.cartaSeleccionada = cartaJugador;
            
            // Mostrar información de la carta seleccionada
            this.mostrarInfoCartaSeleccionada(cartaJugador);
            
            // Si es el jugador que elige atributo, mostrar opciones
            if (this.gameFlow.esJugadorQueEligeAtributo() && !this.gameFlow.rondaActual.atributoCompetido) {
                this.mostrarSeleccionAtributo();
            } else {
                // Si el atributo ya está elegido, mostrar botón de confirmar
                this.mostrarBotonConfirmar();
            }
            
            console.log(' Carta seleccionada:', cartaJugador);
            
        } catch (error) {
            console.error(' Error seleccionando carta:', error);
            this.mostrarError('Error seleccionando carta');
        }
    }

    /**
     * Maneja el click en un atributo
     */
    async onAtributoClick(atributo) {
        try {
            if (!this.cartaSeleccionada) {
                this.mostrarError('Primero selecciona una carta');
                return;
            }
            
            this.atributoSeleccionado = atributo;
            
            // Notificar al gameFlow sobre la selección de atributo
            await this.gameFlow.onAtributoSeleccionado(atributo);
            
            // Ocultar modal de atributos
            this.ocultarSeleccionAtributo();
            
            // Mostrar botón de confirmar
            this.mostrarBotonConfirmar();
            
            console.log(' Atributo seleccionado:', atributo);
            
        } catch (error) {
            console.error(' Error seleccionando atributo:', error);
            this.mostrarError('Error seleccionando atributo');
        }
    }

    /**
     * Confirma la selección de carta
     */
    async confirmarSeleccionCarta() {
        try {
            if (!this.cartaSeleccionada) {
                this.mostrarError('No hay carta seleccionada');
                return;
            }
            
            // Obtener el atributo a competir
            const atributoCompetir = this.gameFlow.rondaActual.atributoCompetido || this.atributoSeleccionado;
            
            if (!atributoCompetir) {
                this.mostrarError('No se ha elegido atributo para competir');
                return;
            }
            
            // Obtener el valor del atributo de la carta seleccionada
            const valorAtributo = this.obtenerValorAtributo(this.cartaSeleccionada, atributoCompetir);
            
            // Marcar carta como usada visualmente
            this.marcarCartaComoUsada();
            
            // Notificar al gameFlow
            await this.gameFlow.onCartaSeleccionada(this.cartaSeleccionada.id, valorAtributo);
            
            // Limpiar selección
            this.limpiarSeleccion();
            
            console.log(' Carta confirmada y enviada');
            
        } catch (error) {
            console.error(' Error confirmando carta:', error);
            this.mostrarError('Error confirmando carta');
        }
    }

    /**
     * Obtiene el valor de un atributo específico de una carta
     */
    obtenerValorAtributo(cartaJugador, atributo) {
        const carta = cartaJugador.carta || cartaJugador;
        
        switch (atributo.toLowerCase()) {
            case 'vida': return carta.vida;
            case 'defensa': return carta.defensa;
            case 'velocidad': return carta.velocidad;
            case 'ataque': return carta.ataque;
            case 'poder': return carta.poder;
            case 'terror': return carta.terror;
            default: return 0;
        }
    }

    /**
     * Muestra la información de la carta seleccionada
     */
    mostrarInfoCartaSeleccionada(cartaJugador) {
        const infoElement = document.querySelector('.carta-seleccionada-info');
        if (!infoElement) return;
        
        const carta = cartaJugador.carta || cartaJugador;
        
        infoElement.innerHTML = `
            <div class="info-carta-container">
                <h4>Carta Seleccionada: ${carta.nombre}</h4>
                <div class="atributos-carta">
                    <div class="atributo"><span>Vida:</span> ${carta.vida}</div>
                    <div class="atributo"><span>Defensa:</span> ${carta.defensa}</div>
                    <div class="atributo"><span>Velocidad:</span> ${carta.velocidad}</div>
                    <div class="atributo"><span>Ataque:</span> ${carta.ataque}</div>
                    <div class="atributo"><span>Poder:</span> ${carta.poder}</div>
                    <div class="atributo"><span>Terror:</span> ${carta.terror}</div>
                </div>
                ${this.gameFlow.rondaActual.atributoCompetido ? 
                    `<p class="atributo-competir">Se competirá en: <strong>${this.gameFlow.rondaActual.atributoCompetido.toUpperCase()}</strong></p>` 
                    : ''
                }
            </div>
        `;
        
        infoElement.style.display = 'block';
    }

    /**
     * Muestra el modal de selección de atributo
     */
    mostrarSeleccionAtributo() {
        const modal = document.querySelector('.seleccion-atributos');
        if (modal) {
            modal.style.display = 'flex';
            this.mostrandoSeleccionAtributo = true;
        }
    }

    /**
     * Oculta el modal de selección de atributo
     */
    ocultarSeleccionAtributo() {
        const modal = document.querySelector('.seleccion-atributos');
        if (modal) {
            modal.style.display = 'none';
            this.mostrandoSeleccionAtributo = false;
        }
    }

    /**
     * Muestra el botón de confirmar selección
     */
    mostrarBotonConfirmar() {
        // Remover botón anterior si existe
        const botonAnterior = document.querySelector('.btn-confirmar-carta');
        if (botonAnterior) botonAnterior.remove();
        
        const boton = document.createElement('button');
        boton.className = 'btn-confirmar-carta';
        boton.textContent = 'CONFIRMAR CARTA';
        
        const infoElement = document.querySelector('.carta-seleccionada-info');
        if (infoElement) {
            infoElement.appendChild(boton);
        }
    }

    /**
     * Marca una carta como usada visualmente
     */
    marcarCartaComoUsada() {
        const cartaElement = document.querySelector('.carta-seleccionada');
        if (cartaElement) {
            cartaElement.classList.add('carta-usada');
            cartaElement.classList.remove('carta-seleccionada');
            
            // Agregar efecto visual de "tirada"
            cartaElement.style.opacity = '0.5';
            cartaElement.style.transform = 'rotateY(180deg)';
            cartaElement.style.pointerEvents = 'none';
        }
    }

    /**
     * Resalta las cartas disponibles para seleccionar
     */
    resaltarCartasDisponibles() {
        const cartas = document.querySelectorAll('.carta:not(.carta-usada)');
        cartas.forEach(carta => {
            carta.classList.add('carta-disponible');
        });
    }

    /**
     * Quita el resaltado de las cartas
     */
    quitarResaltadoCartas() {
        const cartas = document.querySelectorAll('.carta');
        cartas.forEach(carta => {
            carta.classList.remove('carta-disponible');
        });
    }

    /**
     * Limpia la selección anterior
     */
    limpiarSeleccionAnterior() {
        const cartasSeleccionadas = document.querySelectorAll('.carta-seleccionada');
        cartasSeleccionadas.forEach(carta => {
            carta.classList.remove('carta-seleccionada');
        });
    }

    /**
     * Limpia toda la selección
     */
    limpiarSeleccion() {
        this.cartaSeleccionada = null;
        this.atributoSeleccionado = null;
        this.limpiarSeleccionAnterior();
        this.ocultarSeleccionAtributo();
        
        const infoElement = document.querySelector('.carta-seleccionada-info');
        if (infoElement) {
            infoElement.style.display = 'none';
        }
    }

    /**
     * Muestra mensaje de instrucción
     */
    mostrarMensajeInstruccion() {
        let mensaje = '';
        
        if (this.gameFlow.esJugadorQueEligeAtributo()) {
            mensaje = 'Es tu turno: Selecciona tu carta y elige el atributo para competir';
        } else {
            mensaje = 'Selecciona tu carta para esta ronda';
        }
        
        this.mostrarMensaje(mensaje, 'info');
    }

    /**
     * Oculta mensaje de instrucción
     */
    ocultarMensajeInstruccion() {
        const mensajes = document.querySelectorAll('.mensaje-instruccion');
        mensajes.forEach(msg => msg.remove());
    }

    /**
     * Muestra un mensaje en la interfaz
     */
    mostrarMensaje(texto, tipo = 'info') {
        // Remover mensajes anteriores
        const mensajesAnteriores = document.querySelectorAll('.mensaje-instruccion');
        mensajesAnteriores.forEach(msg => msg.remove());
        
        const mensaje = document.createElement('div');
        mensaje.className = `mensaje-instruccion mensaje-${tipo}`;
        mensaje.textContent = texto;
        
        const contenedor = document.querySelector('.container-completo');
        if (contenedor) {
            contenedor.insertBefore(mensaje, contenedor.firstChild);
        }
        
        // Auto-remover después de un tiempo
        setTimeout(() => {
            if (mensaje.parentNode) {
                mensaje.remove();
            }
        }, 5000);
    }

    /**
     * Muestra un mensaje de error
     */
    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, 'error');
        console.error('', mensaje);
    }

    /**
     * Actualiza el estado de las cartas según el estado del juego
     */
    actualizarEstadoCartas() {
        // Recargar cartas del jugador
        this.cargarCartasJugador();
    }

    /**
     * Obtiene información del estado actual de selección
     */
    getEstadoSeleccion() {
        return {
            cartaSeleccionada: this.cartaSeleccionada,
            atributoSeleccionado: this.atributoSeleccionado,
            seleccionHabilitada: this.seleccionHabilitada,
            mostrandoSeleccionAtributo: this.mostrandoSeleccionAtributo,
            cartasDisponibles: this.cartasJugador.filter(c => !c.usada).length
        };
    }

    /**
     * Limpia recursos
     */
    destroy() {
        this.limpiarSeleccion();
        this.deshabilitarSeleccion();
        
        // Remover elementos de UI creados
        const elementos = [
            '.seleccion-atributos',
            '.carta-seleccionada-info',
            '.mensaje-instruccion'
        ];
        
        elementos.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.remove();
        });
        
        console.log(' CardSelectionManager destruido');
    }
}

// Exportar para uso global
window.CardSelectionManager = CardSelectionManager;

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardSelectionManager;
}
