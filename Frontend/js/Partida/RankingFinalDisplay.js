

class RankingFinalDisplay {
    constructor(gameFlowController) {
        this.gameFlow = gameFlowController;
        this.contenedorRanking = null;
        this.rankingData = [];
        this.mostrandoRanking = false;
        
        console.log(' RankingFinalDisplay inicializado');
    }
    resolveAvatar(avatar) {
            if (!avatar) return '../img/foto/default-avatar.png';
            if (String(avatar).startsWith('http') || String(avatar).startsWith('data:')) return avatar;

            const API_BASE = (window.API_CONFIG?.baseURL || '').replace(/\/+$/, '');
            const PUBLIC_BASE = API_BASE.replace(/\/api$/i, '');
            const baseName = String(avatar).split(/[\\/]/).pop();
            return `${PUBLIC_BASE}/img/foto/${encodeURIComponent(baseName)}`;
    }



    llenarPosicionPodio(posicionElement, jugador) {
        const avatar = posicionElement.querySelector('.avatar-podio');
        const nombre = posicionElement.querySelector('.nombre-podio');
        const puntos = posicionElement.querySelector('.puntos-podio');

        if (avatar) {
            avatar.src = this.resolveAvatar(jugador.avatar);
            avatar.alt = jugador.nombre || '';
        }
        if (nombre) nombre.textContent = jugador.nombre || 'Jugador';
        if (puntos) puntos.textContent = `${jugador.puntosAcumulados || 0} puntos`;

        if (Number(jugador.id) === Number(this.gameFlow.jugadorActualId)) {
            posicionElement.classList.add('jugador-actual');
        }
    }
    async init() {
        try {
            this.crearContenedorRanking();
            console.log(' RankingFinalDisplay inicializado correctamente');
            
        } catch (error) {
            console.error(' Error inicializando RankingFinalDisplay:', error);
            throw error;
        }
    }

    crearContenedorRanking() {
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
            
            this.configurarEventListeners();
        }
    }

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


    async mostrar() {
        try {
            if (this.mostrandoRanking) return;
            
            console.log(' Mostrando ranking final...');
            this.mostrandoRanking = true;
            
            await this.cargarRankingData();
            
            this.contenedorRanking.style.display = 'flex';
            
            this.llenarPodio();
            
            this.llenarRankingCompleto();
            
            this.mostrarEstadisticasPartida();
            
            this.iniciarCronometroRegreso();
            
            setTimeout(() => {
                this.contenedorRanking.classList.add('ranking-visible');
            }, 100);
            
        } catch (error) {
            console.error(' Error mostrando ranking:', error);
        }
    }

   
    async cargarRankingData() {
    try {
        const url = buildUrl(API_ENDPOINTS.GF_PARTIDA_RANKING, { partidaId: this.gameFlow.partidaId });
        const arr = await apiGet(url);

        // Normaliza y ordena
        this.rankingData = (Array.isArray(arr) ? arr : []).map(j => ({
        id: Number(j.Id ?? j.id),
        nombre: j.Nombre ?? j.nombre ?? 'Jugador',
        avatar: j.Avatar ?? j.avatar ?? null,
        puntosAcumulados: Number(j.PuntosAcumulados ?? j.puntosAcumulados ?? j.PuntosObtenidos ?? j.puntosObtenidos ?? 0),
        })).sort((a, b) => (b.puntosAcumulados || 0) - (a.puntosAcumulados || 0))
        .map((j, i) => ({ ...j, posicion: i + 1 }));

        if (!this.rankingData.length) throw new Error('Ranking vacío');

        console.log(' Ranking cargado:', this.rankingData);
    } catch (error) {
        console.error(' Error cargando ranking:', error);
        // Fallback: usa jugadores del estado local
        this.rankingData = (this.gameFlow.jugadores || [])
        .map(j => ({
            id: Number(j.Id ?? j.id),
            nombre: j.Nombre ?? j.nombre ?? 'Jugador',
            avatar: j.Avatar ?? j.avatar ?? null,
            puntosAcumulados: Number(j.PuntosAcumulados ?? j.puntosAcumulados ?? 0),
        }))
        .sort((a, b) => (b.puntosAcumulados || 0) - (a.puntosAcumulados || 0))
        .map((j, i) => ({ ...j, posicion: i + 1 }));
    }
    }

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
     * Llena el ranking completo
     */
    llenarRankingCompleto() {
    const listaRanking = this.contenedorRanking.querySelector('.lista-ranking');
    if (!listaRanking) return;
    listaRanking.innerHTML = '';

    this.rankingData.forEach((jugador, index) => {
        const isMe = Number(jugador.id) === Number(this.gameFlow.jugadorActualId);
        const itemRanking = document.createElement('div');
        itemRanking.className = `item-ranking ${isMe ? 'jugador-actual' : ''}`;

        itemRanking.innerHTML = `
        <div class="posicion-numero">${index + 1}</div>
        <div class="avatar-mini">
            <img src="${this.resolveAvatar(jugador.avatar)}" alt="${jugador.nombre || ''}">
        </div>
        <div class="info-jugador-ranking">
            <span class="nombre-jugador">${jugador.nombre || 'Jugador'}</span>
            ${isMe ? '<span class="etiqueta-tu">(Tú)</span>' : ''}
        </div>
        <div class="puntos-ranking">
            <span class="puntos-numero">${jugador.puntosAcumulados || 0}</span>
            <span class="puntos-texto">pts</span>
        </div>
        `;
        listaRanking.appendChild(itemRanking);
    });
    }


     
    mostrarEstadisticasPartida() {
    const duracionElement = this.contenedorRanking.querySelector('#duracion-partida');
    if (duracionElement && this.gameFlow.estadoPartida) {
        duracionElement.textContent = this.calcularDuracionPartida();
    }
    const totalJugadoresElement = this.contenedorRanking.querySelector('#total-jugadores');
    if (totalJugadoresElement) totalJugadoresElement.textContent = String(this.gameFlow.jugadores?.length || 0);
    const totalRondasElement = this.contenedorRanking.querySelector('#total-rondas');
    if (totalRondasElement) totalRondasElement.textContent = '8';
    }

    calcularDuracionPartida() {
    const p = this.gameFlow.estadoPartida || {};
    const start = p.FechaInicio ?? p.fechaInicio;
    const end = p.FechaFin ?? p.fechaFin ?? new Date().toISOString();
    if (!start) return '--:--';
    const inicio = new Date(start);
    const fin = new Date(end);
    const ms = Math.max(0, fin - inicio);
    const mm = Math.floor(ms / 60000);
    const ss = Math.floor((ms % 60000) / 1000);
    return `${mm}:${String(ss).padStart(2, '0')}`;
    }


 
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


    iniciarCronometroRegreso() {
        const tiempoElement = this.contenedorRanking.querySelector('.tiempo-regreso');
        if (!tiempoElement) return;
        
        let tiempoRestante = 15; 
        
        const intervalo = setInterval(() => {
            tiempoRestante--;
            tiempoElement.textContent = tiempoRestante.toString();
            
            if (tiempoRestante <= 0) {
                clearInterval(intervalo);
                this.volverLobby();
            }
        }, 1000);
        
        this.intervaloRegreso = intervalo;
    }

  
    cancelarCronometroRegreso() {
        if (this.intervaloRegreso) {
            clearInterval(this.intervaloRegreso);
            this.intervaloRegreso = null;
        }
    }


    nuevaPartida() {
        this.cancelarCronometroRegreso();
        
        localStorage.removeItem('partidaId');
        localStorage.removeItem('jugadorId');
        localStorage.removeItem('jugadorNombre');
        
        this.irATransicion('./CrearSala.html');
    }


    volverLobby() {
        this.cancelarCronometroRegreso();
        
        localStorage.removeItem('partidaId');
        localStorage.removeItem('jugadorId');
        localStorage.removeItem('jugadorNombre');
        
        this.irATransicion('./Lobby.html');
    }

    irATransicion(destino) {
        localStorage.setItem("urlDestino", destino);
        window.location.href = '../html/Pantalla.html';
    }


   async guardarRankingEnSistema() {
        try {
            if (!this.rankingData?.length) return;
            if (!API_ENDPOINTS.RANKING_ROOT) return; 

            for (const jugador of this.rankingData) {
            const body = {
                IdPartida: Number(this.gameFlow.partidaId),
                IdJugador: Number(jugador.id),
                NombreJugador: jugador.nombre,
                PuntosObtenidos: Number(jugador.puntosAcumulados || 0),
                Posicion: Number(jugador.posicion),
                FechaPartida: new Date().toISOString(),
            };
            await apiPost(buildUrl(API_ENDPOINTS.RANKING_ROOT), body);
            }
        } catch (e) {
            console.error(' Error guardando ranking:', e);
        }
    }


  
    ocultar() {
        this.cancelarCronometroRegreso();
        
        if (this.contenedorRanking) {
            this.contenedorRanking.style.display = 'none';
            this.contenedorRanking.classList.remove('ranking-visible');
        }
        
        this.mostrandoRanking = false;
    }


    getEstadoRanking() {
        return {
            mostrandoRanking: this.mostrandoRanking,
            rankingData: this.rankingData,
            ganador: this.rankingData.length > 0 ? this.rankingData[0] : null,
            posicionJugadorActual: this.rankingData.findIndex(j => j.id === parseInt(this.gameFlow.jugadorActualId)) + 1
        };
    }


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

window.RankingFinalDisplay = RankingFinalDisplay;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RankingFinalDisplay;
}
