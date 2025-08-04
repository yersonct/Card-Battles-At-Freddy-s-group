/**
 * Controlador Simple del Juego - Solo Backend Local
 * Card Battles At Freddy's
 */

class JuegoSimple {
    constructor() {
        this.partidaId = null;
        this.jugadorId = null;
        this.estadoPartida = null;
        this.cartasJugador = [];
        this.intervalCheck = null;
        
        this.init();
    }

    async init() {
        // Obtener datos de la partida creada
        this.partidaId = localStorage.getItem('partidaId');
        this.jugadorId = localStorage.getItem('jugadorId');
        
        if (!this.partidaId) {
            this.mostrarError('No hay partida activa');
            setTimeout(() => window.location.href = './CrearSala.html', 2000);
            return;
        }

        try {
            await this.cargarEstadoPartida();
            await this.cargarCartasJugador();
            this.actualizarInterfaz();
            this.iniciarCheckeoEstado();
            
            console.log('✅ Juego iniciado correctamente');
        } catch (error) {
            console.error('Error al iniciar juego:', error);
            this.mostrarError('Error al cargar el juego');
        }
    }

    // ===== COMUNICACIÓN CON BACKEND =====
    async cargarEstadoPartida() {
        const response = await fetch(`http://localhost:7147/api/partida/${this.partidaId}/estado`);
        if (!response.ok) throw new Error('Error al obtener estado');
        this.estadoPartida = await response.json();
    }

    async cargarCartasJugador() {
        const response = await fetch(`http://localhost:7147/api/partida/${this.partidaId}/jugador/${this.jugadorId}/cartas`);
        if (!response.ok) throw new Error('Error al obtener cartas');
        this.cartasJugador = await response.json();
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
        const response = await fetch('http://localhost:7147/api/partida/jugar-carta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                partidaId: this.partidaId,
                jugadorId: this.jugadorId,
                cartaJugadorId: cartaJugadorId
            })
        });
        
        if (!response.ok) throw new Error('Error al jugar carta');
        await this.cargarCartasJugador();
        await this.verificarRonda();
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
        this.mostrarInfoPartida();
        this.mostrarJugadores();
        this.mostrarCartas();
        this.mostrarControles();
    }

    mostrarInfoPartida() {
        const container = document.getElementById('infoPartida');
        if (!container) return;

        const esMiTurno = this.esMiTurno();
        
        container.innerHTML = `
            <div class="info-partida">
                <h2>Ronda ${this.estadoPartida.rondaActual}/8</h2>
                <div class="estado">${this.estadoPartida.estado}</div>
                ${esMiTurno ? '<div class="mi-turno">¡TU TURNO!</div>' : '<div class="esperando">Esperando...</div>'}
                ${this.estadoPartida.atributoElegido ? 
                    `<div class="atributo">Atributo: <strong>${this.estadoPartida.atributoElegido}</strong></div>` 
                    : ''
                }
            </div>
        `;
    }

    mostrarJugadores() {
        const container = document.getElementById('jugadores');
        if (!container) return;

        const html = this.estadoPartida.jugadores.map(jugador => `
            <div class="jugador ${jugador.posicionTurno === this.estadoPartida.turnoActual ? 'activo' : ''}">
                <img src="../img/avatars/${jugador.avatar}" alt="${jugador.nombre}">
                <div class="nombre">${jugador.nombre}</div>
                <div class="puntos">${jugador.puntosAcumulados} pts</div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    mostrarCartas() {
        const container = document.getElementById('misCartas');
        if (!container) return;

        const cartasDisponibles = this.cartasJugador.filter(c => !c.usada);
        
        const html = cartasDisponibles.map(cartaJugador => {
            const carta = cartaJugador.carta;
            return `
                <div class="carta" onclick="juegoSimple.seleccionarCarta(${cartaJugador.id})">
                    <div class="nombre">${carta.nombre}</div>
                    <div class="stats">
                        <div>❤️ ${carta.vida}</div>
                        <div>⚔️ ${carta.ataque}</div>
                        <div>🛡️ ${carta.defensa}</div>
                        <div>⚡ ${carta.velocidad}</div>
                        <div>💪 ${carta.poder}</div>
                        <div>😱 ${carta.terror}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
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