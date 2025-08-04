/**
 * Controlador principal del juego integrado con el backend
 * Card Battles At Freddy's
 */

class JuegoControllerBackend {
    constructor() {
        this.partidaBackendService = new PartidaBackendService();
        this.partidaId = this.obtenerPartidaIdStorage();
        this.jugadorId = this.obtenerJugadorIdStorage();
        this.jugadorNombre = this.obtenerJugadorNombreStorage();
        this.estadoPartida = null;
        this.cartasJugador = [];
        this.intervaloPollling = null;
        this.cartaSeleccionada = null;
        
        this.atributosDisponibles = [
            'Vida', 'Ataque', 'Defensa', 'Velocidad', 'Poder', 'Terror'
        ];
        
        this.init();
    }

    async init() {
        console.log('🎮 Inicializando JuegoControllerBackend...');
        
        if (!this.partidaId || !this.jugadorId) {
            console.warn('⚠️ No hay datos de partida/jugador, redirigiendo...');
            this.redirigirAlInicio();
            return;
        }

        try {
            await this.cargarEstadoInicial();
            this.iniciarPollingEstado();
            this.configurarEventos();
            this.actualizarInterfazCompleta();
            
            console.log('✅ JuegoControllerBackend inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar el juego:', error);
            this.mostrarError('Error al cargar el juego: ' + error.message);
        }
    }

    async cargarEstadoInicial() {
        console.log('📊 Cargando estado inicial...');
        
        // Cargar estado de la partida
        this.estadoPartida = await this.partidaBackendService.obtenerEstadoPartida(this.partidaId);
        
        // Cargar cartas del jugador
        this.cartasJugador = await this.partidaBackendService.obtenerCartasJugador(this.partidaId, this.jugadorId);
        
        console.log('✅ Estado inicial cargado');
    }

    iniciarPollingEstado() {
        console.log('🔄 Iniciando polling del estado...');
        
        // Actualizar estado cada 3 segundos
        this.intervaloPollling = setInterval(async () => {
            try {
                const nuevoEstado = await this.partidaBackendService.obtenerEstadoPartida(this.partidaId);
                
                if (JSON.stringify(nuevoEstado) !== JSON.stringify(this.estadoPartida)) {
                    console.log('🔄 Estado actualizado:', nuevoEstado);
                    this.estadoPartida = nuevoEstado;
                    this.actualizarInterfazCompleta();
                    
                    // Verificar si la ronda terminó
                    await this.verificarFinRonda();
                }
            } catch (error) {
                console.error('❌ Error en polling:', error);
            }
        }, 3000);
    }

    async verificarFinRonda() {
        if (this.estadoPartida.estado === 'EnJuego') {
            const resultadoRonda = await this.partidaBackendService.verificarFinRonda(this.partidaId);
            
            if (resultadoRonda) {
                console.log('🏁 Ronda terminada:', resultadoRonda);
                this.mostrarResultadoRonda(resultadoRonda);
                
                // Recargar cartas del jugador
                this.cartasJugador = await this.partidaBackendService.obtenerCartasJugador(this.partidaId, this.jugadorId);
                
                // Verificar si la partida terminó
                if (this.estadoPartida.rondaActual >= 8) {
                    setTimeout(() => this.mostrarRankingFinal(), 3000);
                }
            }
        }
    }

    actualizarInterfazCompleta() {
        this.actualizarInfoPartida();
        this.actualizarListaJugadores();
        this.actualizarCartasJugador();
        this.actualizarControlesJuego();
        this.actualizarContadorRonda();
    }

    actualizarInfoPartida() {
        // Actualizar información en diferentes contenedores según tu HTML
        this.actualizarContadorRonda();
        this.actualizarEstadoGeneral();
    }

    actualizarContadorRonda() {
        const contadorRonda = document.querySelector('.contenedor-ronda .numero');
        if (contadorRonda && this.estadoPartida) {
            contadorRonda.textContent = this.estadoPartida.rondaActual || 1;
        }
    }

    actualizarEstadoGeneral() {
        // Mostrar información del estado en un contenedor
        const infoContainer = document.getElementById('infoPartida') || this.crearContenedorInfo();
        
        if (!infoContainer) return;

        const esMiTurno = this.esMiTurno();
        const fase = this.obtenerFaseActual();

        infoContainer.innerHTML = `
            <div class="info-partida-actual">
                <div class="estado-partida">
                    <span class="estado">${this.estadoPartida.estado}</span>
                    <span class="ronda">Ronda ${this.estadoPartida.rondaActual}/8</span>
                </div>
                <div class="turno-info">
                    <span class="fase">${fase}</span>
                    ${esMiTurno ? '<span class="mi-turno">¡ES TU TURNO!</span>' : ''}
                </div>
                ${this.estadoPartida.atributoElegido ? 
                    `<div class="atributo-elegido">Atributo: <strong>${this.estadoPartida.atributoElegido}</strong></div>` 
                    : ''
                }
            </div>
        `;
    }

    crearContenedorInfo() {
        const container = document.createElement('div');
        container.id = 'infoPartida';
        container.className = 'info-partida-container';
        
        // Insertarlo al inicio del body o en un contenedor específico
        const targetContainer = document.querySelector('.container-completo') || document.body;
        targetContainer.insertBefore(container, targetContainer.firstChild);
        
        return container;
    }

    actualizarListaJugadores() {
        // Actualizar íconos de jugadores existentes
        const iconosJugador = document.querySelector('.iconos-jugador');
        const contenedorIconos = document.querySelector('.completo-iconos-usuario .container-icono');
        
        if (!this.estadoPartida || !this.estadoPartida.jugadores) return;

        // Crear información de jugadores si no existe
        let jugadoresContainer = document.getElementById('jugadoresInfo');
        if (!jugadoresContainer) {
            jugadoresContainer = document.createElement('div');
            jugadoresContainer.id = 'jugadoresInfo';
            jugadoresContainer.className = 'jugadores-info';
            
            const targetContainer = document.querySelector('.container-completo') || document.body;
            targetContainer.appendChild(jugadoresContainer);
        }

        const html = this.estadoPartida.jugadores.map(jugador => {
            const esTurnoActual = jugador.posicionTurno === this.estadoPartida.turnoActual;
            const esJugadorActual = jugador.id === parseInt(this.jugadorId);
            
            return `
                <div class="jugador-item ${esTurnoActual ? 'turno-activo' : ''} ${esJugadorActual ? 'jugador-actual' : ''}">
                    <div class="avatar">
                        <img src="${jugador.avatar}" alt="${jugador.nombre}" style="width: 40px; height: 40px; border-radius: 50%;">
                    </div>
                    <div class="info">
                        <span class="nombre">${jugador.nombre}</span>
                        <span class="puntos">${jugador.puntosAcumulados} puntos</span>
                    </div>
                    ${esTurnoActual ? '<div class="indicador-turno">🎯</div>' : ''}
                </div>
            `;
        }).join('');

        jugadoresContainer.innerHTML = html;
    }

    actualizarCartasJugador() {
        // Integrar con el sistema de cartas existente
        const contenedorCartas = document.querySelector('.contenedor-cartas-completo');
        
        if (!contenedorCartas || !this.cartasJugador || this.cartasJugador.length === 0) {
            return;
        }

        // Actualizar las cartas existentes con datos del backend
        const cartasExistentes = contenedorCartas.querySelectorAll('.carta');
        
        cartasExistentes.forEach((cartaElement, index) => {
            if (index < this.cartasJugador.length) {
                const cartaData = this.cartasJugador[index];
                this.actualizarCartaConDatos(cartaElement, cartaData);
            }
        });
    }

    actualizarCartaConDatos(cartaElement, cartaData) {
        // Marcar carta como usada si corresponde
        if (cartaData.usada) {
            cartaElement.classList.add('carta-usada');
            cartaElement.style.opacity = '0.5';
            cartaElement.style.pointerEvents = 'none';
        } else {
            cartaElement.classList.remove('carta-usada');
            cartaElement.style.opacity = '1';
            cartaElement.style.pointerEvents = 'auto';
        }

        // Agregar ID de carta del backend
        cartaElement.setAttribute('data-carta-jugador-id', cartaData.id);
        
        // Si hay datos de la carta, actualizar la información
        if (cartaData.carta) {
            this.actualizarEstadisticasCarta(cartaElement, cartaData.carta);
        }
    }

    actualizarEstadisticasCarta(cartaElement, carta) {
        // Actualizar las estadísticas de la carta con datos reales
        const estadisticas = {
            'VIDA': carta.vida,
            'ATAQUE': carta.ataque,
            'DEFENSA': carta.defensa,
            'VELOCIDAD': carta.velocidad,
            'PODER': carta.poder,
            'TERROR': carta.terror
        };

        Object.entries(estadisticas).forEach(([stat, value]) => {
            const elemento = cartaElement.querySelector(`.etiqueta-estadistica:contains("${stat}") + .valor-estadistica`);
            if (elemento) {
                elemento.textContent = value;
            }
        });

        // Actualizar nombre de carta
        const nombreCarta = cartaElement.querySelector('.nombre-carta');
        if (nombreCarta && carta.nombre) {
            nombreCarta.textContent = carta.nombre;
        }
    }

    actualizarControlesJuego() {
        // Crear o actualizar controles del juego
        let controlesContainer = document.getElementById('controlesJuego');
        if (!controlesContainer) {
            controlesContainer = document.createElement('div');
            controlesContainer.id = 'controlesJuego';
            controlesContainer.className = 'controles-juego';
            
            const containerBotones = document.querySelector('.container-bottones');
            if (containerBotones) {
                containerBotones.parentNode.insertBefore(controlesContainer, containerBotones);
            } else {
                document.body.appendChild(controlesContainer);
            }
        }

        const esMiTurno = this.esMiTurno();
        const fase = this.obtenerFaseActual();

        let html = '';

        if (this.estadoPartida.estado === 'Esperando') {
            html = '<div class="mensaje-estado">Esperando a que inicie la partida...</div>';
        } else if (this.estadoPartida.estado === 'Finalizada') {
            html = '<div class="mensaje-estado">La partida ha terminado</div>';
        } else if (fase === 'ElegirAtributo' && esMiTurno) {
            html = `
                <div class="elegir-atributo">
                    <h4>Elige el atributo para esta ronda:</h4>
                    <div class="atributos-botones">
                        ${this.atributosDisponibles.map(attr => 
                            `<button class="btn-atributo" onclick="juegoControllerBackend.elegirAtributo('${attr}')">${attr}</button>`
                        ).join('')}
                    </div>
                </div>
            `;
        } else if (fase === 'JugarCarta' && this.puedeJugarCarta()) {
            html = `
                <div class="jugar-carta">
                    <h4>Selecciona una carta para jugar</h4>
                    <div class="atributo-actual">Atributo: <strong>${this.estadoPartida.atributoElegido}</strong></div>
                    <div id="cartaSeleccionadaInfo"></div>
                    <button id="btnJugarCarta" class="btn-confirmar-carta" disabled onclick="juegoControllerBackend.confirmarJugarCarta()">
                        Jugar Carta
                    </button>
                </div>
            `;
        } else {
            html = '<div class="mensaje-estado">Esperando a otros jugadores...</div>';
        }

        controlesContainer.innerHTML = html;
    }

    esMiTurno() {
        if (!this.estadoPartida || !this.estadoPartida.jugadores) return false;
        
        const miJugador = this.estadoPartida.jugadores.find(j => j.id === parseInt(this.jugadorId));
        return miJugador && miJugador.posicionTurno === this.estadoPartida.turnoActual;
    }

    obtenerFaseActual() {
        if (!this.estadoPartida.atributoElegido) {
            return 'ElegirAtributo';
        } else {
            return 'JugarCarta';
        }
    }

    puedeJugarCarta() {
        // Verificar si ya jugó en esta ronda
        if (this.estadoPartida.rondaEnCurso) {
            const yaJugo = this.estadoPartida.rondaEnCurso.jugadas.some(j => j.idJugador === parseInt(this.jugadorId));
            return !yaJugo;
        }
        return true;
    }

    async elegirAtributo(atributo) {
        try {
            console.log(`🎯 Eligiendo atributo: ${atributo}`);
            await this.partidaBackendService.elegirAtributo(this.partidaId, this.jugadorId, atributo);
            this.mostrarExito(`Atributo "${atributo}" elegido correctamente`);
        } catch (error) {
            this.mostrarError('Error al elegir atributo: ' + error.message);
        }
    }

    // Integrar con el sistema de selección de cartas existente
    seleccionarCarta(cartaElement) {
        console.log('🃏 Seleccionando carta:', cartaElement);
        
        // Deseleccionar carta anterior
        document.querySelectorAll('.carta').forEach(c => c.classList.remove('seleccionada'));
        
        // Seleccionar nueva carta
        cartaElement.classList.add('seleccionada');
        
        // Obtener ID de la carta del backend
        const cartaJugadorId = cartaElement.getAttribute('data-carta-jugador-id');
        if (cartaJugadorId) {
            this.cartaSeleccionada = parseInt(cartaJugadorId);
            
            // Buscar datos de la carta
            const cartaData = this.cartasJugador.find(c => c.id === this.cartaSeleccionada);
            if (cartaData) {
                this.mostrarInfoCartaSeleccionada(cartaData);
                
                // Habilitar botón de jugar
                const btnJugar = document.getElementById('btnJugarCarta');
                if (btnJugar) {
                    btnJugar.disabled = false;
                }
            }
        }
    }

    mostrarInfoCartaSeleccionada(cartaData) {
        const container = document.getElementById('cartaSeleccionadaInfo');
        if (!container) return;

        const carta = cartaData.carta;
        if (!carta) return;

        const atributoElegido = this.estadoPartida.atributoElegido;
        let valorAtributo = 0;

        // Obtener el valor del atributo elegido
        switch(atributoElegido.toLowerCase()) {
            case 'vida': valorAtributo = carta.vida; break;
            case 'ataque': valorAtributo = carta.ataque; break;
            case 'defensa': valorAtributo = carta.defensa; break;
            case 'velocidad': valorAtributo = carta.velocidad; break;
            case 'poder': valorAtributo = carta.poder; break;
            case 'terror': valorAtributo = carta.terror; break;
        }

        container.innerHTML = `
            <div class="carta-seleccionada-info">
                <strong>${carta.nombre}</strong>
                <div class="valor-atributo-destacado">
                    ${atributoElegido}: <span class="valor">${valorAtributo}</span>
                </div>
            </div>
        `;
    }

    async confirmarJugarCarta() {
        if (!this.cartaSeleccionada) {
            this.mostrarError('Selecciona una carta primero');
            return;
        }

        try {
            console.log('🃏 Confirmando jugar carta:', this.cartaSeleccionada);
            
            const resultado = await this.partidaBackendService.jugarCarta(
                this.partidaId, 
                this.jugadorId, 
                this.cartaSeleccionada
            );
            
            this.mostrarExito('Carta jugada correctamente');
            this.cartaSeleccionada = null;
            
            // Recargar cartas del jugador
            this.cartasJugador = await this.partidaBackendService.obtenerCartasJugador(this.partidaId, this.jugadorId);
            
            // Actualizar interfaz
            this.actualizarCartasJugador();
            
        } catch (error) {
            this.mostrarError('Error al jugar carta: ' + error.message);
        }
    }

    mostrarResultadoRonda(resultado) {
        const modal = this.crearModal(`
            <div class="resultado-ronda">
                <h3>¡Ronda ${resultado.numeroRonda} Completada!</h3>
                <div class="atributo-competido">Atributo: <strong>${resultado.atributoCompetido}</strong></div>
                <div class="ganador">🏆 Ganador: <strong>${resultado.nombreGanador}</strong></div>
                <div class="jugadas">
                    ${resultado.jugadas.map(j => `
                        <div class="jugada ${j.jugadorId === resultado.ganadorId ? 'ganadora' : ''}">
                            <span class="jugador">${j.nombreJugador}</span>
                            <span class="carta">${j.nombreCarta}</span>
                            <span class="valor">${j.valorAtributo}</span>
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.closest('.modal').remove()">Continuar</button>
            </div>
        `);

        setTimeout(() => modal.remove(), 8000);
    }

    async mostrarRankingFinal() {
        try {
            const ranking = await this.partidaBackendService.obtenerRankingFinal(this.partidaId);
            
            const modal = this.crearModal(`
                <div class="ranking-final">
                    <h2>🏆 Ranking Final 🏆</h2>
                    <div class="ranking-lista">
                        ${ranking.map((jugador, index) => `
                            <div class="ranking-item posicion-${index + 1}">
                                <span class="posicion">${jugador.posicion}°</span>
                                <span class="nombre">${jugador.nombreJugador}</span>
                                <span class="puntos">${jugador.puntosObtenidos} puntos</span>
                                ${index === 0 ? '<span class="corona">👑</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="juegoControllerBackend.volverAlInicio()">Volver al Inicio</button>
                </div>
            `);

            // Finalizar partida
            await this.partidaBackendService.finalizarPartida(this.partidaId);
            
        } catch (error) {
            this.mostrarError('Error al obtener ranking: ' + error.message);
        }
    }

    crearModal(contenido) {
        const modal = document.createElement('div');
        modal.className = 'modal-resultado';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const contenedor = document.createElement('div');
        contenedor.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 500px;
            max-height: 80vh;
            overflow: auto;
            color: black;
        `;
        
        contenedor.innerHTML = contenido;
        modal.appendChild(contenedor);
        document.body.appendChild(modal);
        
        return modal;
    }

    volverAlInicio() {
        this.limpiarStorage();
        this.partidaBackendService.limpiarSesion();
        window.location.href = './InicioDelJuego.html';
    }

    redirigirAlInicio() {
        setTimeout(() => {
            this.mostrarError('No hay una partida activa. Redirigiendo...');
            this.volverAlInicio();
        }, 2000);
    }

    configurarEventos() {
        // Integrar con el sistema de selección de cartas existente
        document.addEventListener('click', (event) => {
            const carta = event.target.closest('.carta');
            if (carta && !carta.classList.contains('carta-usada')) {
                this.seleccionarCarta(carta);
            }
        });

        // Manejar cierre de ventana
        window.addEventListener('beforeunload', () => {
            if (this.intervaloPollling) {
                clearInterval(this.intervaloPollling);
            }
        });
    }

    // Funciones de Storage
    obtenerPartidaIdStorage() {
        return localStorage.getItem('partidaId');
    }

    obtenerJugadorIdStorage() {
        return localStorage.getItem('jugadorId');
    }

    obtenerJugadorNombreStorage() {
        return localStorage.getItem('jugadorNombre');
    }

    guardarEnStorage(partidaId, jugadorId, jugadorNombre) {
        localStorage.setItem('partidaId', partidaId);
        localStorage.setItem('jugadorId', jugadorId);
        localStorage.setItem('jugadorNombre', jugadorNombre);
    }

    limpiarStorage() {
        localStorage.removeItem('partidaId');
        localStorage.removeItem('jugadorId');
        localStorage.removeItem('jugadorNombre');
    }

    // Funciones de utilidad para mostrar mensajes
    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, 'error');
    }

    mostrarExito(mensaje) {
        this.mostrarMensaje(mensaje, 'success');
    }

    mostrarMensaje(mensaje, tipo) {
        console.log(`${tipo.toUpperCase()}: ${mensaje}`);
        
        const messageEl = document.createElement('div');
        messageEl.className = `mensaje mensaje-${tipo}`;
        messageEl.textContent = mensaje;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            ${tipo === 'error' ? 'background-color: #dc3545;' : ''}
            ${tipo === 'success' ? 'background-color: #28a745;' : ''}
        `;
        
        document.body.appendChild(messageEl);
        setTimeout(() => messageEl.style.opacity = '1', 100);
        setTimeout(() => {
            messageEl.style.opacity = '0';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }

    destruir() {
        if (this.intervaloPollling) {
            clearInterval(this.intervaloPollling);
        }
    }
}

// Variable global para el controlador
let juegoControllerBackend = null;

// Funciones globales para compatibilidad
window.seleccionarCartaBackend = function(cartaElement) {
    if (juegoControllerBackend) {
        juegoControllerBackend.seleccionarCarta(cartaElement);
    }
};

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar en la página de la sala
    if (window.location.pathname.includes('Sala.html')) {
        juegoControllerBackend = new JuegoControllerBackend();
    }
});

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JuegoControllerBackend;
}
