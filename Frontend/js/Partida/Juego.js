/**
 * Controlador Simple del Juego - Solo Backend Local
 * Card Battles At Freddy's
 */

class JuegoSimple {
    constructor() {
        this.partidaId = null;
        this.codigoPartida = null;
        this.jugadorId = null;
        this.jugadorActual = null;
        this.estadoPartida = null;
        this.cartasJugador = [];
        this.jugadoresPartida = [];
        this.turnoActual = 0;
        this.rondaActual = null;
        this.intervalCheck = null;
        this.modoOffline = false;
        
        this.init();
    }

    async init() {
        console.log('🎮 Inicializando JuegoSimple con backend integration...');
        
        // Obtener datos de la partida creada
        this.partidaId = localStorage.getItem('partidaId');
        this.codigoPartida = localStorage.getItem('codigoPartida');
        this.modoOffline = localStorage.getItem('modoOffline') === 'true';
        
        const jugadoresData = localStorage.getItem('jugadoresPartida');
        if (jugadoresData) {
            this.jugadoresPartida = JSON.parse(jugadoresData);
            // Usar el primer jugador como jugador actual por defecto
            this.jugadorActual = this.jugadoresPartida[0];
            this.jugadorId = 1; // ID temporal para el primer jugador
        }
        
        console.log('📊 Datos iniciales:', {
            partidaId: this.partidaId,
            codigoPartida: this.codigoPartida,
            modoOffline: this.modoOffline,
            totalJugadores: this.jugadoresPartida.length
        });
        
        if (!this.partidaId) {
            this.mostrarError('No hay partida activa');
            setTimeout(() => window.location.href = './CrearSala.html', 2000);
            return;
        }

        try {
            if (!this.modoOffline) {
                await this.cargarEstadoPartida();
                await this.cargarCartasJugador();
            } else {
                console.log('⚠️ Modo offline - Generando datos de ejemplo');
                this.generarDatosOffline();
            }
            
            this.actualizarInterfaz();
            this.iniciarCheckeoEstado();
            
            console.log('✅ Juego iniciado correctamente');
        } catch (error) {
            console.error('❌ Error al iniciar juego:', error);
            console.log('🔄 Fallback a modo offline');
            this.modoOffline = true;
            this.generarDatosOffline();
            this.actualizarInterfaz();
        }
    }

    // ===== COMUNICACIÓN CON BACKEND =====
    async cargarEstadoPartida() {
        try {
            console.log('📡 Cargando estado de la partida...');
            const response = await fetch(`http://localhost:7147/api/partida/${this.partidaId}/estado`);
            if (!response.ok) throw new Error('Error al obtener estado');
            this.estadoPartida = await response.json();
            
            // Actualizar jugadores con datos del backend
            if (this.estadoPartida.jugadores) {
                this.jugadoresPartida = this.estadoPartida.jugadores;
            }
            
            console.log('✅ Estado de partida cargado:', this.estadoPartida);
        } catch (error) {
            console.error('❌ Error cargando estado:', error);
            throw error;
        }
    }

    async cargarCartasJugador() {
        try {
            console.log('🃏 Cargando cartas del jugador...');
            const response = await fetch(`http://localhost:7147/api/cartajugador/jugador/${this.jugadorId}`);
            if (!response.ok) throw new Error('Error al obtener cartas');
            this.cartasJugador = await response.json();
            console.log('✅ Cartas cargadas:', this.cartasJugador.length);
        } catch (error) {
            console.error('❌ Error cargando cartas:', error);
            throw error;
        }
    }

    // ===== MODO OFFLINE =====
    generarDatosOffline() {
        console.log('🔧 Generando datos para modo offline...');
        
        // Generar estado de partida simulado
        this.estadoPartida = {
            id: this.partidaId,
            estado: 'EnJuego',
            rondaActual: 1,
            turnoActual: 1,
            jugadores: this.jugadoresPartida.map((jugador, index) => ({
                id: index + 1,
                nombre: jugador.Nombre || jugador.nombre,
                avatar: jugador.Avatar || jugador.avatar,
                posicionTurno: index + 1,
                puntosAcumulados: 0
            }))
        };
        
        // Generar cartas de ejemplo
        this.generarCartasEjemplo();
        
        console.log('✅ Datos offline generados');
    }

    generarCartasEjemplo() {
        this.cartasJugador = [];
        const personajes = ['Freddy', 'Bonnie', 'Chica', 'Foxy', 'Golden Freddy', 'Springtrap', 'Ennard', 'Circus Baby'];
        
        for (let i = 0; i < 8; i++) {
            this.cartasJugador.push({
                id: i + 1,
                nombre: personajes[i],
                vida: Math.floor(Math.random() * 50) + 50,
                ataque: Math.floor(Math.random() * 40) + 30,
                defensa: Math.floor(Math.random() * 35) + 25,
                velocidad: Math.floor(Math.random() * 30) + 20,
                poder: Math.floor(Math.random() * 45) + 35,
                terror: Math.floor(Math.random() * 50) + 40,
                usada: false
            });
        }
        
        console.log('🎴 Cartas de ejemplo generadas:', this.cartasJugador.length);
    }

    async elegirAtributo(atributo) {
        const response = await fetch('http://localhost:7147/api/partida/elegir-atributo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                partidaId: this.partidaId,
                jugadorId: this.jugadorId,
                atributo: atributo
            })
        });
        
        if (!response.ok) throw new Error('Error al elegir atributo');
        await this.cargarEstadoPartida();
        this.actualizarInterfaz();
    }

    async jugarCarta(cartaJugadorId) {
        console.log(`🎯 Jugando carta ${cartaJugadorId}...`);
        
        try {
            if (this.modoOffline) {
                await this.jugarCartaOffline(cartaJugadorId);
            } else {
                await this.jugarCartaOnline(cartaJugadorId);
            }
            
            // Actualizar interfaz y cambiar turno
            this.actualizarInterfaz();
            this.cambiarTurno();
            
        } catch (error) {
            console.error('❌ Error al jugar carta:', error);
            this.mostrarError(`Error al jugar carta: ${error.message}`);
        }
    }

    async jugarCartaOnline(cartaJugadorId) {
        console.log('📡 Enviando jugada al backend...');
        
        const response = await fetch('http://localhost:7147/api/jugada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                IdRonda: this.rondaActual?.id || 1,
                IdJugador: this.jugadorId,
                IdCartaJugador: cartaJugadorId
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Backend error: ${response.status} - ${errorText}`);
        }
        
        const resultado = await response.json();
        console.log('✅ Carta jugada en backend:', resultado);
        
        // Marcar carta como usada localmente
        const carta = this.cartasJugador.find(c => (c.id || c.Id) === cartaJugadorId);
        if (carta) {
            carta.usada = true;
        }
        
        // Actualizar estado desde backend
        await this.cargarEstadoPartida();
    }

    async jugarCartaOffline(cartaJugadorId) {
        console.log('🔧 Simulando jugada offline...');
        
        // Marcar carta como usada
        const carta = this.cartasJugador.find(c => c.id === cartaJugadorId);
        if (carta) {
            carta.usada = true;
            console.log(`✅ Carta ${carta.nombre} marcada como usada`);
        }
        
        // Simular respuesta
        this.mostrarMensaje(`🎴 ${carta?.nombre || 'Carta'} jugada por ${this.getJugadorActualNombre()}`);
    }

    // ===== SISTEMA DE TURNOS =====
    cambiarTurno() {
        if (!this.jugadoresPartida || this.jugadoresPartida.length === 0) {
            console.warn('⚠️ No hay jugadores para cambiar turno');
            return;
        }
        
        // Cambiar al siguiente jugador
        this.turnoActual = (this.turnoActual + 1) % this.jugadoresPartida.length;
        
        const jugadorActual = this.jugadoresPartida[this.turnoActual];
        const nombreJugador = jugadorActual?.Nombre || jugadorActual?.nombre || `Jugador ${this.turnoActual + 1}`;
        
        console.log(`🔄 Turno cambiado a: ${nombreJugador} (${this.turnoActual + 1}/${this.jugadoresPartida.length})`);
        
        // Actualizar interfaz visual del turno
        this.actualizarIndicadorTurno();
        
        // Mostrar mensaje del turno
        this.mostrarMensaje(`🎮 Turno de ${nombreJugador}`);
    }

    actualizarIndicadorTurno() {
        // Actualizar indicadores visuales de turno
        const indicadores = document.querySelectorAll('.iconos-1, .iconos-2');
        
        indicadores.forEach((indicador, index) => {
            if (index === this.turnoActual) {
                indicador.style.backgroundColor = 'rgba(255, 140, 0, 0.3)';
                indicador.style.border = '2px solid #ff8c00';
            } else {
                indicador.style.backgroundColor = 'transparent';
                indicador.style.border = 'none';
            }
        });
    }

    getJugadorActualNombre() {
        const jugador = this.jugadoresPartida[this.turnoActual];
        return jugador?.Nombre || jugador?.nombre || `Jugador ${this.turnoActual + 1}`;
    }

    esElTurnoDelJugador(jugadorIndex) {
        return jugadorIndex === this.turnoActual;
    }

    async verificarRonda() {
        const response = await fetch(`http://localhost:7147/api/partida/${this.partidaId}/verificar-ronda`);
        if (!response.ok) return;
        
        const resultado = await response.json();
        if (resultado && resultado.rondaCompleta) {
            this.mostrarResultadoRonda(resultado);
            
            // Verificar si la partida terminó
            if (resultado.partidaTerminada) {
                setTimeout(() => this.mostrarRankingFinal(), 3000);
            }
        }
    }

    async obtenerRankingFinal() {
        const response = await fetch(`http://localhost:7147/api/partida/${this.partidaId}/ranking`);
        if (!response.ok) throw new Error('Error al obtener ranking');
        return await response.json();
    }

    async finalizarPartida() {
        await fetch(`http://localhost:7147/api/partida/${this.partidaId}/finalizar`, {
            method: 'POST'
        });
        
        // Limpiar datos locales
        localStorage.removeItem('partidaId');
        localStorage.removeItem('jugadorId');
        localStorage.removeItem('jugadorNombre');
    }

    // ===== INTERFAZ DE USUARIO =====
    actualizarInterfaz() {
        console.log('🎨 Actualizando interfaz del juego...');
        this.mostrarInfoPartida();
        this.mostrarJugadoresReales();
        this.mostrarCartas();
        this.actualizarIndicadorTurno();
    }

    mostrarInfoPartida() {
        // Actualizar ronda en el display principal
        const numeroRonda = document.querySelector('.texto-terror .numero');
        if (numeroRonda) {
            const ronda = this.estadoPartida?.rondaActual || 1;
            numeroRonda.textContent = ronda;
        }

        // Mostrar información de la partida en consola
        console.log('📊 Info partida:', {
            partida: this.partidaId,
            codigo: this.codigoPartida,
            ronda: this.estadoPartida?.rondaActual || 1,
            turno: this.turnoActual + 1,
            jugadorActual: this.getJugadorActualNombre()
        });
    }

    mostrarJugadoresReales() {
        console.log('👥 Actualizando interfaz de jugadores...');
        
        // Obtener contenedores de jugadores en la interfaz
        const contenedoresJugadores = document.querySelectorAll('.iconos-1, .iconos-2');
        
        // Actualizar solo los jugadores reales
        this.jugadoresPartida.forEach((jugador, index) => {
            if (index < contenedoresJugadores.length) {
                const contenedor = contenedoresJugadores[index];
                const input = contenedor.querySelector('input');
                const h4 = contenedor.querySelector('h4');
                
                // Mostrar el contenedor
                contenedor.style.display = 'block';
                
                // Actualizar nombre del jugador
                if (input) {
                    input.value = jugador.Nombre || jugador.nombre || `Jugador ${index + 1}`;
                }
                
                // Actualizar etiqueta del turno
                if (h4) {
                    h4.textContent = `J${index + 1}`;
                }
                
                // Resaltar jugador activo
                if (index === this.turnoActual) {
                    contenedor.style.backgroundColor = 'rgba(255, 140, 0, 0.3)';
                    contenedor.style.border = '2px solid #ff8c00';
                    contenedor.style.borderRadius = '10px';
                } else {
                    contenedor.style.backgroundColor = 'transparent';
                    contenedor.style.border = 'none';
                }
            }
        });
        
        // Ocultar contenedores de jugadores extra
        for (let i = this.jugadoresPartida.length; i < contenedoresJugadores.length; i++) {
            if (contenedoresJugadores[i]) {
                contenedoresJugadores[i].style.display = 'none';
            }
        }
        
        console.log(`✅ Interfaz actualizada para ${this.jugadoresPartida.length} jugadores`);
    }

    mostrarCartas() {
        const container = document.getElementById('misCartas');
        if (!container) return;

        // Limpiar contenedor
        container.innerHTML = '';

        // Obtener cartas disponibles del jugador actual
        const cartasDisponibles = this.cartasJugador.filter(c => !c.usada);
        
        if (cartasDisponibles.length === 0) {
            container.innerHTML = '<div class="mensaje">No tienes cartas disponibles</div>';
            return;
        }

        // Crear elementos de cartas usando la función mejorada
        cartasDisponibles.forEach(cartaJugador => {
            const elementoCarta = this.crearElementoCarta(cartaJugador);
            container.appendChild(elementoCarta);
        });

        console.log(`✅ Mostradas ${cartasDisponibles.length} cartas del jugador`);
    }

    mostrarControles() {
        const container = document.getElementById('controles');
        if (!container) return;

        const esMiTurno = this.esMiTurno();
        
        if (!esMiTurno) {
            container.innerHTML = '<div class="mensaje">Esperando turno...</div>';
            return;
        }

        if (!this.estadoPartida.atributoElegido) {
            // Mostrar botones para elegir atributo
            container.innerHTML = `
                <div class="elegir-atributo">
                    <h3>Elige el atributo para esta ronda:</h3>
                    <div class="atributos">
                        <button onclick="juegoSimple.elegirAtributo('Vida')">❤️ Vida</button>
                        <button onclick="juegoSimple.elegirAtributo('Ataque')">⚔️ Ataque</button>
                        <button onclick="juegoSimple.elegirAtributo('Defensa')">🛡️ Defensa</button>
                        <button onclick="juegoSimple.elegirAtributo('Velocidad')">⚡ Velocidad</button>
                        <button onclick="juegoSimple.elegirAtributo('Poder')">💪 Poder</button>
                        <button onclick="juegoSimple.elegirAtributo('Terror')">😱 Terror</button>
                    </div>
                </div>
            `;
        } else if (this.puedeJugarCarta()) {
            container.innerHTML = `
                <div class="jugar-carta">
                    <h3>Selecciona una carta para jugar</h3>
                    <div class="atributo-actual">Atributo: <strong>${this.estadoPartida.atributoElegido}</strong></div>
                    ${this.cartaSeleccionada ? 
                        `<button onclick="juegoSimple.confirmarJugarCarta()">Jugar Carta Seleccionada</button>` 
                        : '<div>Haz clic en una carta para seleccionarla</div>'
                    }
                </div>
            `;
        } else {
            container.innerHTML = '<div class="mensaje">Ya jugaste tu carta esta ronda</div>';
        }
    }

    // ===== LÓGICA DEL JUEGO =====
    esMiTurno() {
        const miJugador = this.estadoPartida.jugadores.find(j => j.id == this.jugadorId);
        return miJugador && miJugador.posicionTurno === this.estadoPartida.turnoActual;
    }

    puedeJugarCarta() {
        if (!this.estadoPartida.rondaEnCurso) return true;
        return !this.estadoPartida.rondaEnCurso.jugadas.some(j => j.idJugador == this.jugadorId);
    }

    seleccionarCarta(cartaJugadorId) {
        // Deseleccionar cartas anteriores
        document.querySelectorAll('.carta').forEach(c => c.classList.remove('seleccionada'));
        
        // Seleccionar nueva carta
        event.target.closest('.carta').classList.add('seleccionada');
        this.cartaSeleccionada = cartaJugadorId;
        
        this.mostrarControles();
    }

    async confirmarJugarCarta() {
        if (!this.cartaSeleccionada) return;
        
        try {
            await this.jugarCarta(this.cartaSeleccionada);
            this.cartaSeleccionada = null;
            this.actualizarInterfaz();
            this.mostrarExito('Carta jugada correctamente');
        } catch (error) {
            this.mostrarError('Error al jugar carta: ' + error.message);
        }
    }

    // ===== CHECKEO AUTOMÁTICO =====
    iniciarCheckeoEstado() {
        this.intervalCheck = setInterval(async () => {
            try {
                await this.cargarEstadoPartida();
                this.actualizarInterfaz();
                await this.verificarRonda();
            } catch (error) {
                console.error('Error en checkeo:', error);
            }
        }, 3000);
    }

    // ===== RESULTADOS =====
    mostrarResultadoRonda(resultado) {
        const modal = document.createElement('div');
        modal.className = 'modal-resultado';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>¡Ronda ${resultado.numeroRonda} Completada!</h2>
                <div class="atributo">Atributo: <strong>${resultado.atributoCompetido}</strong></div>
                <div class="ganador">🏆 Ganador: <strong>${resultado.nombreGanador}</strong></div>
                <div class="jugadas">
                    ${resultado.jugadas.map(j => `
                        <div class="jugada ${j.jugadorId === resultado.ganadorId ? 'ganadora' : ''}">
                            <span>${j.nombreJugador}</span>
                            <span>${j.nombreCarta}</span>
                            <span>${j.valorAtributo}</span>
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Continuar</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.remove(), 5000);
    }

    async mostrarRankingFinal() {
        try {
            const ranking = await this.obtenerRankingFinal();
            
            const modal = document.createElement('div');
            modal.className = 'modal-ranking';
            modal.innerHTML = `
                <div class="modal-content">
                    <h1>🏆 RANKING FINAL 🏆</h1>
                    <div class="ranking">
                        ${ranking.map((jugador, index) => `
                            <div class="posicion posicion-${index + 1}">
                                <span class="numero">${jugador.posicion}°</span>
                                <span class="nombre">${jugador.nombreJugador}</span>
                                <span class="puntos">${jugador.puntosObtenidos} puntos</span>
                                ${index === 0 ? '<span class="corona">👑</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="juegoSimple.nuevaPartida()">Nueva Partida</button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Finalizar partida en el backend
            await this.finalizarPartida();
            
        } catch (error) {
            this.mostrarError('Error al obtener ranking: ' + error.message);
        }
    }

    async nuevaPartida() {
        if (this.intervalCheck) {
            clearInterval(this.intervalCheck);
        }
        
        window.location.href = './CrearSala.html';
    }

    // ===== UTILIDADES =====
    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, 'error');
    }

    mostrarExito(mensaje) {
        this.mostrarMensaje(mensaje, 'success');
    }

    mostrarMensaje(mensaje, tipo) {
        const div = document.createElement('div');
        div.className = `mensaje ${tipo}`;
        div.textContent = mensaje;
        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            border-radius: 5px;
            color: white;
            z-index: 10000;
            ${tipo === 'error' ? 'background: #dc3545;' : 'background: #28a745;'}
        `;
        
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    destruir() {
        if (this.intervalCheck) {
            clearInterval(this.intervalCheck);
        }
    }
}

// Inicializar automáticamente
let juegoSimple = null;

document.addEventListener('DOMContentLoaded', function() {
    juegoSimple = new JuegoSimple();
});

window.addEventListener('beforeunload', () => {
    if (juegoSimple) {
        juegoSimple.destruir();
    }
});