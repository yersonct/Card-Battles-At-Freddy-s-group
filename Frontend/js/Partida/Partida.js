// Controlador de Sala conectado al Backend
class SalaBackend {
    constructor() {
        this.partidaId = null;
        this.jugadorId = null;
        this.jugadorNombre = null;
        this.juegoController = null;
        this.cartasJugador = [];
        this.estadoPartida = null;
        this.cartaSeleccionada = null;
        this.atributoSeleccionado = null;
        
        // Estado de la interfaz
        this.interfazListaParaJugar = false;
        
        console.log('🎮 SalaBackend inicializado');
    }

    // Inicializar la sala con datos del backend
    async init() {
        try {
            // Obtener datos de la partida desde localStorage
            this.partidaId = localStorage.getItem('partidaId');
            this.jugadorId = localStorage.getItem('jugadorId');
            this.jugadorNombre = localStorage.getItem('jugadorNombre');

            if (!this.partidaId || !this.jugadorId) {
                throw new Error('No se encontraron datos de partida');
            }

            console.log('📋 Datos de partida:', {
                partidaId: this.partidaId,
                jugadorId: this.jugadorId,
                jugadorNombre: this.jugadorNombre
            });

            // Inicializar el controlador del juego
            if (typeof JuegoControllerBackend !== 'undefined') {
                this.juegoController = new JuegoControllerBackend();
                await this.juegoController.init(this.partidaId, this.jugadorId);
                
                // Suscribirse a eventos del juego
                this.suscribirseAEventos();
            } else {
                throw new Error('JuegoControllerBackend no está disponible');
            }

            // Cargar estado inicial
            await this.cargarEstadoPartida();
            
            // Configurar interfaz
            this.configurarInterfaz();
            
            // Iniciar polling de estado
            this.iniciarPolling();
            
            console.log('✅ Sala inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar sala:', error);
            this.mostrarError('Error al cargar la partida: ' + error.message);
            
            // Redirigir de vuelta a crear sala después de 3 segundos
            setTimeout(() => {
                window.location.href = './CrearSala.html';
            }, 3000);
        }
    }

    // Suscribirse a eventos del controlador del juego
    suscribirseAEventos() {
        if (this.juegoController) {
            this.juegoController.onEstadoActualizado = (estado) => {
                this.actualizarInterfaz(estado);
            };
            
            this.juegoController.onCartasActualizadas = (cartas) => {
                this.actualizarCartas(cartas);
            };
            
            this.juegoController.onFinRonda = (resultado) => {
                this.mostrarResultadoRonda(resultado);
            };
            
            this.juegoController.onFinPartida = (ranking) => {
                this.mostrarFinPartida(ranking);
            };
            
            this.juegoController.onError = (error) => {
                this.mostrarError(error);
            };
        }
    }

    // Cargar estado inicial de la partida
    async cargarEstadoPartida() {
        try {
            if (this.juegoController) {
                this.estadoPartida = await this.juegoController.obtenerEstadoPartida();
                this.cartasJugador = await this.juegoController.obtenerCartasJugador();
                
                console.log('📊 Estado de partida cargado:', this.estadoPartida);
                console.log('🃏 Cartas del jugador:', this.cartasJugador);
            }
        } catch (error) {
            console.error('❌ Error al cargar estado:', error);
            throw error;
        }
    }

    // Configurar la interfaz inicial
    configurarInterfaz() {
        // Actualizar información del jugador
        this.actualizarInfoJugador();
        
        // Configurar eventos de selección de cartas
        this.configurarSeleccionCartas();
        
        // Configurar botones de atributos
        this.configurarBotonesAtributos();
        
        // Configurar botón de jugar carta
        this.configurarBotonJugarCarta();
        
        // Crear elementos de interfaz si no existen
        this.crearElementosInterfaz();
    }

    // Actualizar información del jugador actual
    actualizarInfoJugador() {
        // Actualizar nombre del jugador en la interfaz
        const elementosNombre = document.querySelectorAll('.nombre-jugador-actual');
        elementosNombre.forEach(el => {
            el.textContent = this.jugadorNombre || 'Jugador';
        });
        
        console.log('👤 Información del jugador actualizada');
    }

    // Configurar eventos de selección de cartas
    configurarSeleccionCartas() {
        document.addEventListener('click', (event) => {
            const carta = event.target.closest('.carta');
            if (carta && carta.dataset.cartaId) {
                this.seleccionarCarta(carta);
            }
        });
    }

    // Configurar botones de atributos
    configurarBotonesAtributos() {
        const atributos = ['vida', 'ataque', 'poder', 'defensa', 'velocidad', 'terror'];
        
        atributos.forEach(atributo => {
            const boton = document.getElementById(`btn-${atributo}`) || this.crearBotonAtributo(atributo);
            if (boton) {
                boton.addEventListener('click', () => this.seleccionarAtributo(atributo));
            }
        });
    }

    // Crear botón de atributo si no existe
    crearBotonAtributo(atributo) {
        const boton = document.createElement('button');
        boton.id = `btn-${atributo}`;
        boton.className = 'btn-atributo';
        boton.textContent = atributo.toUpperCase();
        boton.setAttribute('data-atributo', atributo);
        
        // Agregar al contenedor de botones
        const contenedor = document.querySelector('.botones-atributos') || this.crearContenedorBotones();
        contenedor.appendChild(boton);
        
        return boton;
    }

    // Crear contenedor de botones si no existe
    crearContenedorBotones() {
        const contenedor = document.createElement('div');
        contenedor.className = 'botones-atributos';
        contenedor.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 1000;
        `;
        
        document.body.appendChild(contenedor);
        return contenedor;
    }

    // Configurar botón de jugar carta
    configurarBotonJugarCarta() {
        let botonJugar = document.getElementById('btn-jugar-carta');
        if (!botonJugar) {
            botonJugar = document.createElement('button');
            botonJugar.id = 'btn-jugar-carta';
            botonJugar.className = 'btn-jugar-carta';
            botonJugar.textContent = 'JUGAR CARTA';
            botonJugar.disabled = true;
            
            botonJugar.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                padding: 15px 30px;
                background: #8B4513;
                color: white;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                z-index: 1000;
            `;
            
            document.body.appendChild(botonJugar);
        }
        
        botonJugar.addEventListener('click', () => this.jugarCarta());
    }

    // Seleccionar carta
    seleccionarCarta(cartaElement) {
        const cartaId = cartaElement.dataset.cartaId;
        const carta = this.cartasJugador.find(c => c.id == cartaId);
        
        if (!carta) {
            this.mostrarError('Carta no encontrada');
            return;
        }

        // Deseleccionar cartas anteriores
        document.querySelectorAll('.carta.seleccionada').forEach(c => {
            c.classList.remove('seleccionada');
        });
        
        // Seleccionar nueva carta
        cartaElement.classList.add('seleccionada');
        this.cartaSeleccionada = carta;
        
        console.log('🃏 Carta seleccionada:', carta);
        this.actualizarEstadoBotones();
    }

    // Seleccionar atributo
    async seleccionarAtributo(atributo) {
        if (!this.validarTurnoJugador()) {
            this.mostrarError('No es tu turno');
            return;
        }

        try {
            this.atributoSeleccionado = atributo;
            
            // Actualizar interfaz
            document.querySelectorAll('.btn-atributo').forEach(btn => {
                btn.classList.remove('seleccionado');
            });
            
            const botonSeleccionado = document.querySelector(`[data-atributo="${atributo}"]`);
            if (botonSeleccionado) {
                botonSeleccionado.classList.add('seleccionado');
            }

            console.log('⚡ Atributo seleccionado:', atributo);

            // Notificar al backend si es necesario
            if (this.juegoController) {
                await this.juegoController.elegirAtributo(atributo);
            }
            
            this.actualizarEstadoBotones();
            
        } catch (error) {
            console.error('❌ Error al seleccionar atributo:', error);
            this.mostrarError('Error al seleccionar atributo: ' + error.message);
        }
    }

    // Jugar carta
    async jugarCarta() {
        if (!this.cartaSeleccionada) {
            this.mostrarError('Selecciona una carta primero');
            return;
        }

        if (!this.validarTurnoJugador()) {
            this.mostrarError('No es tu turno');
            return;
        }

        try {
            const botonJugar = document.getElementById('btn-jugar-carta');
            if (botonJugar) {
                botonJugar.disabled = true;
                botonJugar.textContent = 'JUGANDO...';
            }

            console.log('🎯 Jugando carta:', this.cartaSeleccionada);

            if (this.juegoController) {
                await this.juegoController.jugarCarta(this.cartaSeleccionada.id);
            }

            // Limpiar selección
            this.cartaSeleccionada = null;
            document.querySelectorAll('.carta.seleccionada').forEach(c => {
                c.classList.remove('seleccionada');
            });

            this.actualizarEstadoBotones();
            
        } catch (error) {
            console.error('❌ Error al jugar carta:', error);
            this.mostrarError('Error al jugar carta: ' + error.message);
            
            const botonJugar = document.getElementById('btn-jugar-carta');
            if (botonJugar) {
                botonJugar.disabled = false;
                botonJugar.textContent = 'JUGAR CARTA';
            }
        }
    }

    // Validar si es el turno del jugador
    validarTurnoJugador() {
        return this.estadoPartida && 
               this.estadoPartida.turnoActual && 
               this.estadoPartida.turnoActual.toString() === this.jugadorId.toString();
    }

    // Actualizar estado de botones
    actualizarEstadoBotones() {
        const botonJugar = document.getElementById('btn-jugar-carta');
        if (botonJugar) {
            const puedeJugar = this.cartaSeleccionada && this.validarTurnoJugador();
            botonJugar.disabled = !puedeJugar;
            botonJugar.textContent = puedeJugar ? 'JUGAR CARTA' : 'ESPERA TU TURNO';
        }
    }

    // Actualizar cartas en la interfaz
    actualizarCartas(cartas) {
        this.cartasJugador = cartas;
        this.renderizarCartas();
    }

    // Renderizar cartas en la interfaz
    renderizarCartas() {
        const contenedor = document.querySelector('.contenedor-cartas-completo');
        if (!contenedor) {
            console.warn('Contenedor de cartas no encontrado');
            return;
        }

        contenedor.innerHTML = '';

        this.cartasJugador.forEach((carta, index) => {
            const cartaElement = this.crearElementoCarta(carta, index);
            contenedor.appendChild(cartaElement);
        });

        console.log('🃏 Cartas renderizadas:', this.cartasJugador.length);
    }

    // Crear elemento de carta
    crearElementoCarta(carta, index) {
        const cartaElement = document.createElement('div');
        cartaElement.className = 'carta';
        cartaElement.dataset.cartaId = carta.id;
        cartaElement.innerHTML = `
            <div class="numero-carta">${index + 1}</div>
            <div class="nombre-carta">${carta.nombre}</div>
            <div class="imagen-contenedor">
                <img src="${carta.imagen || '../img/foto/1.jpg'}" 
                     alt="${carta.nombre}" 
                     class="imagen-personaje">
            </div>
            <div class="estadisticas">
                <div class="stat">
                    <span class="stat-label">VIDA:</span>
                    <span class="stat-value">${carta.vida}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">ATAQUE:</span>
                    <span class="stat-value">${carta.ataque}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">PODER:</span>
                    <span class="stat-value">${carta.poder}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">DEFENSA:</span>
                    <span class="stat-value">${carta.defensa}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">VELOCIDAD:</span>
                    <span class="stat-value">${carta.velocidad}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">TERROR:</span>
                    <span class="stat-value">${carta.terror}</span>
                </div>
            </div>
        `;

        return cartaElement;
    }

    // Actualizar interfaz con nuevo estado
    actualizarInterfaz(estado) {
        this.estadoPartida = estado;
        
        // Actualizar información de turno
        this.actualizarInfoTurno();
        
        // Actualizar estado de botones
        this.actualizarEstadoBotones();
        
        // Actualizar información de ronda
        this.actualizarInfoRonda();
        
        console.log('🔄 Interfaz actualizada con estado:', estado);
    }

    // Actualizar información de turno
    actualizarInfoTurno() {
        const infoTurno = document.querySelector('.info-turno') || this.crearInfoTurno();
        
        if (this.estadoPartida && this.estadoPartida.turnoActual) {
            const esMiTurno = this.estadoPartida.turnoActual.toString() === this.jugadorId.toString();
            
            infoTurno.innerHTML = `
                <h3>${esMiTurno ? '🎯 TU TURNO' : '⏳ TURNO DEL OPONENTE'}</h3>
                <p>Ronda: ${this.estadoPartida.rondaActual || 1}</p>
            `;
            
            infoTurno.className = `info-turno ${esMiTurno ? 'mi-turno' : 'turno-oponente'}`;
        }
    }

    // Crear elemento de información de turno
    crearInfoTurno() {
        const info = document.createElement('div');
        info.className = 'info-turno';
        info.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            z-index: 1000;
        `;
        
        document.body.appendChild(info);
        return info;
    }

    // Actualizar información de ronda
    actualizarInfoRonda() {
        // Implementar según diseño específico
    }

    // Iniciar polling de estado
    iniciarPolling() {
        if (this.juegoController) {
            this.juegoController.iniciarPolling();
        }
    }

    // Mostrar resultado de ronda
    mostrarResultadoRonda(resultado) {
        console.log('🏆 Resultado de ronda:', resultado);
        // Implementar modal o notificación de resultado
    }

    // Mostrar fin de partida
    mostrarFinPartida(ranking) {
        console.log('🏁 Fin de partida:', ranking);
        // Redirigir a página de resultados o mostrar modal
        setTimeout(() => {
            // window.location.href = './Resultados.html';
        }, 3000);
    }

    // Crear elementos de interfaz necesarios
    crearElementosInterfaz() {
        if (!document.querySelector('.contenedor-cartas-completo')) {
            const contenedor = document.createElement('div');
            contenedor.className = 'contenedor-cartas-completo';
            contenedor.style.cssText = `
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                padding: 20px;
                justify-content: center;
            `;
            
            document.body.appendChild(contenedor);
        }
    }

    // Mostrar mensajes de error
    mostrarError(mensaje) {
        console.error('❌', mensaje);
        
        // Crear elemento de mensaje
        const messageEl = document.createElement('div');
        messageEl.className = 'mensaje-error';
        messageEl.textContent = mensaje;
        messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: bold;
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }

    // Limpiar recursos
    destroy() {
        if (this.juegoController) {
            this.juegoController.destroy();
        }
    }
}

// Variables globales
let salaBackend = null;

// Inicializar cuando se cargue la página
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando SalaBackend...');
    
    try {
        salaBackend = new SalaBackend();
        await salaBackend.init();
    } catch (error) {
        console.error('❌ Error al inicializar SalaBackend:', error);
    }
});

// Limpiar al salir
window.addEventListener('beforeunload', () => {
    if (salaBackend) {
        salaBackend.destroy();
    }
});

// Export para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SalaBackend;
}
