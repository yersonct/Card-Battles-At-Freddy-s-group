/**
 * Display del Ranking Final
 * Card Battles At Freddy's
 * 
 * Muestra el ranking final al terminar todas las rondas como en Figma
 */

class RankingFinalDisplay {
    constructor(gameFlowController) {
        this.gameFlow = gameFlowController;
        this.contenedorRanking = null;
        this.rankingData = [];
        this.mostrandoRanking = false;
        
        console.log(' RankingFinalDisplay inicializado');
    }

    /**
     * Inicializa el display del ranking
     */
    async init() {
        try {
            this.crearContenedorRanking();
            console.log(' RankingFinalDisplay inicializado correctamente');
            
        } catch (error) {
            console.error(' Error inicializando RankingFinalDisplay:', error);
            throw error;
        }
    }

    /**
     * Crea el contenedor del ranking final
     */
    crearContenedorRanking() {
        // Buscar si ya existe
        this.contenedorRanking = document.querySelector('.ranking-final');
        
        if (!this.contenedorRanking) {
            this.contenedorRanking = document.createElement('div');
            this.contenedorRanking.className = 'ranking-final';
            this.contenedorRanking.style.display = 'none';
            
            this.contenedorRanking.innerHTML = `
                <div class="overlay-ranking">
                    <div class="container-ranking">
                        <div class="header-ranking">
                            <h1 class="titulo-ranking">RANKING FINAL</h1>
                            <p class="subtitulo-ranking">Card Battles At Freddy's</p>
                        </div>
                        
                        <div class="podio-container">
                            <div class="podio">
                                <!-- Segundo lugar -->
                                <div class="posicion-podio segundo-lugar">
                                    <div class="numero-posicion">2</div>
                                    <div class="jugador-podio">
                                        <img src="" alt="" class="avatar-podio">
                                        <div class="info-podio">
                                            <span class="nombre-podio"></span>
                                            <span class="puntos-podio"></span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Primer lugar -->
                                <div class="posicion-podio primer-lugar">
                                    <div class="numero-posicion">1</div>
                                    <div class="corona">1</div>
                                    <div class="jugador-podio">
                                        <img src="" alt="" class="avatar-podio">
                                        <div class="info-podio">
                                            <span class="nombre-podio"></span>
                                            <span class="puntos-podio"></span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Tercer lugar -->
                                <div class="posicion-podio tercer-lugar">
                                    <div class="numero-posicion">3</div>
                                    <div class="jugador-podio">
                                        <img src="" alt="" class="avatar-podio">
                                        <div class="info-podio">
                                            <span class="nombre-podio"></span>
                                            <span class="puntos-podio"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="ranking-completo">
                            <h3>Ranking Completo</h3>
                            <div class="lista-ranking">
                                <!-- Se llenarán dinámicamente -->
                            </div>
                        </div>
                        
                        <div class="estadisticas-partida">
                            <div class="stat-item">
                                <span class="stat-label">Duración:</span>
                                <span class="stat-value" id="duracion-partida">--:--</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Rondas:</span>
                                <span class="stat-value" id="total-rondas">8</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Jugadores:</span>
                                <span class="stat-value" id="total-jugadores">--</span>
                            </div>
                        </div>
                        
                        <div class="controles-ranking">
                            <button class="btn-nueva-partida">
                                NUEVA PARTIDA
                            </button>
                            <button class="btn-volver-lobby">
                                VOLVER AL LOBBY
                            </button>
                        </div>
                        
                        <div class="cronometro-regreso">
                            <p>Volviendo al lobby en <span class="tiempo-regreso">10</span> segundos...</p>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.contenedorRanking);
            
            // Configurar event listeners
            this.configurarEventListeners();
        }
    }

    /**
     * Configura los event listeners del ranking
     */
    configurarEventListeners() {
        const btnNuevaPartida = this.contenedorRanking.querySelector('.btn-nueva-partida');
        const btnVolverLobby = this.contenedorRanking.querySelector('.btn-volver-lobby');
        
        if (btnNuevaPartida) {
            btnNuevaPartida.addEventListener('click', () => this.nuevaPartida());
        }
        
        if (btnVolverLobby) {
            btnVolverLobby.addEventListener('click', () => this.volverLobby());
        }
    }

    /**
     * Muestra el ranking final
     */
    async mostrar() {
        try {
            if (this.mostrandoRanking) return;
            
            console.log(' Mostrando ranking final...');
            this.mostrandoRanking = true;
            
            // Cargar datos del ranking
            await this.cargarRankingData();
            
            // Mostrar el contenedor
            this.contenedorRanking.style.display = 'flex';
            
            // Llenar el podio
            this.llenarPodio();
            
            // Llenar ranking completo
            this.llenarRankingCompleto();
            
            // Mostrar estadísticas
            this.mostrarEstadisticasPartida();
            
            // Iniciar cronómetro de regreso
            this.iniciarCronometroRegreso();
            
            // Animar entrada
            setTimeout(() => {
                this.contenedorRanking.classList.add('ranking-visible');
            }, 100);
            
        } catch (error) {
            console.error(' Error mostrando ranking:', error);
        }
    }

    /**
     * Carga los datos del ranking desde el backend
     */
    async cargarRankingData() {
        try {
            // Cargar ranking de la partida
            const response = await fetch(`http://localhost:7147/api/jugador/partida/${this.gameFlow.partidaId}/ranking`);
            if (!response.ok) throw new Error('Error cargando ranking');
            
            this.rankingData = await response.json();
            
            // Ordenar por puntos descendente
            this.rankingData.sort((a, b) => (b.puntosAcumulados || 0) - (a.puntosAcumulados || 0));
            
            // Asignar posiciones
            this.rankingData.forEach((jugador, index) => {
                jugador.posicion = index + 1;
            });
            
            console.log(' Ranking cargado:', this.rankingData);
            
        } catch (error) {
            console.error(' Error cargando ranking:', error);
            // Usar datos locales como fallback
            this.rankingData = [...this.gameFlow.jugadores].sort((a, b) => 
                (b.puntosAcumulados || 0) - (a.puntosAcumulados || 0)
            );
        }
    }

    /**
     * Llena el podio con los primeros 3 lugares
     */
    llenarPodio() {
        const posiciones = ['primer-lugar', 'segundo-lugar', 'tercer-lugar'];
        
        posiciones.forEach((posicionClass, index) => {
            const posicionElement = this.contenedorRanking.querySelector(`.${posicionClass}`);
            if (!posicionElement) return;
            
            const jugador = this.rankingData[index];
            
            if (jugador) {
                this.llenarPosicionPodio(posicionElement, jugador);
                posicionElement.style.display = 'block';
            } else {
                posicionElement.style.display = 'none';
            }
        });
    }

    /**
     * Llena una posición específica del podio
     */
    llenarPosicionPodio(posicionElement, jugador) {
        const avatar = posicionElement.querySelector('.avatar-podio');
        const nombre = posicionElement.querySelector('.nombre-podio');
        const puntos = posicionElement.querySelector('.puntos-podio');
        
        if (avatar) {
            avatar.src = jugador.avatar || '../img/foto/default-avatar.png';
            avatar.alt = jugador.nombre;
        }
        
        if (nombre) {
            nombre.textContent = jugador.nombre;
        }
        
        if (puntos) {
            const puntosTexto = `${jugador.puntosAcumulados || 0} puntos`;
            puntos.textContent = puntosTexto;
        }
        
        // Agregar clase especial si es el jugador actual
        if (jugador.id === parseInt(this.gameFlow.jugadorActualId)) {
            posicionElement.classList.add('jugador-actual');
        }
    }

    /**
     * Llena el ranking completo
     */
    llenarRankingCompleto() {
        const listaRanking = this.contenedorRanking.querySelector('.lista-ranking');
        if (!listaRanking) return;
        
        listaRanking.innerHTML = '';
        
        this.rankingData.forEach((jugador, index) => {
            const itemRanking = document.createElement('div');
            itemRanking.className = `item-ranking ${jugador.id === parseInt(this.gameFlow.jugadorActualId) ? 'jugador-actual' : ''}`;
            
            itemRanking.innerHTML = `
                <div class="posicion-numero">${index + 1}</div>
                <div class="avatar-mini">
                    <img src="${jugador.avatar || '../img/foto/default-avatar.png'}" alt="${jugador.nombre}">
                </div>
                <div class="info-jugador-ranking">
                    <span class="nombre-jugador">${jugador.nombre}</span>
                    ${jugador.id === parseInt(this.gameFlow.jugadorActualId) ? '<span class="etiqueta-tu">(Tú)</span>' : ''}
                </div>
                <div class="puntos-ranking">
                    <span class="puntos-numero">${jugador.puntosAcumulados || 0}</span>
                    <span class="puntos-texto">pts</span>
                </div>
            `;
            
            listaRanking.appendChild(itemRanking);
        });
    }

    /**
     * Muestra las estadísticas de la partida
     */
    mostrarEstadisticasPartida() {
        // Duración de la partida
        const duracionElement = this.contenedorRanking.querySelector('#duracion-partida');
        if (duracionElement && this.gameFlow.estadoPartida) {
            const duracion = this.calcularDuracionPartida();
            duracionElement.textContent = duracion;
        }
        
        // Total de jugadores
        const totalJugadoresElement = this.contenedorRanking.querySelector('#total-jugadores');
        if (totalJugadoresElement) {
            totalJugadoresElement.textContent = this.gameFlow.jugadores.length.toString();
        }
        
        // Total de rondas (siempre 8 en este juego)
        const totalRondasElement = this.contenedorRanking.querySelector('#total-rondas');
        if (totalRondasElement) {
            totalRondasElement.textContent = '8';
        }
    }

    /**
     * Calcula la duración de la partida
     */
    calcularDuracionPartida() {
        if (!this.gameFlow.estadoPartida || !this.gameFlow.estadoPartida.fechaInicio) {
            return '--:--';
        }
        
        const inicio = new Date(this.gameFlow.estadoPartida.fechaInicio);
        const fin = this.gameFlow.estadoPartida.fechaFin ? 
                   new Date(this.gameFlow.estadoPartida.fechaFin) : 
                   new Date();
        
        const diferencia = fin - inicio;
        const minutos = Math.floor(diferencia / 60000);
        const segundos = Math.floor((diferencia % 60000) / 1000);
        
        return `${minutos}:${segundos.toString().padStart(2, '0')}`;
    }

    /**
     * Inicia el cronómetro de regreso automático
     */
    iniciarCronometroRegreso() {
        const tiempoElement = this.contenedorRanking.querySelector('.tiempo-regreso');
        if (!tiempoElement) return;
        
        let tiempoRestante = 15; // 15 segundos
        
        const intervalo = setInterval(() => {
            tiempoRestante--;
            tiempoElement.textContent = tiempoRestante.toString();
            
            if (tiempoRestante <= 0) {
                clearInterval(intervalo);
                this.volverLobby();
            }
        }, 1000);
        
        // Guardar el intervalo para poder cancelarlo
        this.intervaloRegreso = intervalo;
    }

    /**
     * Cancela el cronómetro de regreso
     */
    cancelarCronometroRegreso() {
        if (this.intervaloRegreso) {
            clearInterval(this.intervaloRegreso);
            this.intervaloRegreso = null;
        }
    }

    /**
     * Inicia una nueva partida
     */
    nuevaPartida() {
        this.cancelarCronometroRegreso();
        
        // Limpiar datos de la partida actual
        localStorage.removeItem('partidaId');
        localStorage.removeItem('jugadorId');
        localStorage.removeItem('jugadorNombre');
        
        // Redirigir a crear sala
        this.irATransicion('./CrearSala.html');
    }

    /**
     * Vuelve al lobby
     */
    volverLobby() {
        this.cancelarCronometroRegreso();
        
        // Limpiar datos de la partida actual
        localStorage.removeItem('partidaId');
        localStorage.removeItem('jugadorId');
        localStorage.removeItem('jugadorNombre');
        
        // Redirigir al lobby
        this.irATransicion('./Lobby.html');
    }

    /**
     * Navega a través de la pantalla de transición
     */
    irATransicion(destino) {
        localStorage.setItem("urlDestino", destino);
        window.location.href = '../html/Pantalla.html';
    }

    /**
     * Guarda el ranking en el sistema (para historial)
     */
    async guardarRankingEnSistema() {
        try {
            for (const jugador of this.rankingData) {
                const rankingData = {
                    idPartida: parseInt(this.gameFlow.partidaId),
                    idJugador: jugador.id,
                    nombreJugador: jugador.nombre,
                    puntosObtenidos: jugador.puntosAcumulados || 0,
                    posicion: jugador.posicion,
                    fechaPartida: new Date().toISOString()
                };
                
                await fetch('http://localhost:7147/api/ranking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rankingData)
                });
            }
            
            console.log(' Ranking guardado en el sistema');
            
        } catch (error) {
            console.error(' Error guardando ranking:', error);
        }
    }

    /**
     * Oculta el ranking
     */
    ocultar() {
        this.cancelarCronometroRegreso();
        
        if (this.contenedorRanking) {
            this.contenedorRanking.style.display = 'none';
            this.contenedorRanking.classList.remove('ranking-visible');
        }
        
        this.mostrandoRanking = false;
    }

    /**
     * Obtiene información del estado del ranking
     */
    getEstadoRanking() {
        return {
            mostrandoRanking: this.mostrandoRanking,
            rankingData: this.rankingData,
            ganador: this.rankingData.length > 0 ? this.rankingData[0] : null,
            posicionJugadorActual: this.rankingData.findIndex(j => j.id === parseInt(this.gameFlow.jugadorActualId)) + 1
        };
    }

    /**
     * Limpia recursos
     */
    destroy() {
        this.cancelarCronometroRegreso();
        this.ocultar();
        
        if (this.contenedorRanking && this.contenedorRanking.parentNode) {
            this.contenedorRanking.remove();
        }
        
        this.contenedorRanking = null;
        this.rankingData = [];
        this.mostrandoRanking = false;
        
        console.log('🧹 RankingFinalDisplay destruido');
    }
}

// Exportar para uso global
window.RankingFinalDisplay = RankingFinalDisplay;

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RankingFinalDisplay;
}
