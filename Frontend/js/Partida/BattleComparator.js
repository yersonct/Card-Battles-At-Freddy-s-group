/**
 * Comparador de Batallas
 * Card Battles At Freddy's
 * 
 * Maneja la comparación visual de cartas como se ve en Figma
 */

class BattleComparator {
    constructor(gameFlowController) {
        this.gameFlow = gameFlowController;
        this.contenedorComparacion = null;
        this.cartasEnComparacion = [];
        this.atributoComparar = null;
        this.ganadorId = null;
        this.animacionEnProgreso = false;
        
        console.log(' BattleComparator inicializado');
    }

    /**
     * Inicializa el comparador de batallas
     */
    async init() {
        try {
            this.crearContenedorComparacion();
            console.log(' BattleComparator inicializado correctamente');
            
        } catch (error) {
            console.error(' Error inicializando BattleComparator:', error);
            throw error;
        }
    }

    /**
     * Crea el contenedor para mostrar la comparación
     */
    crearContenedorComparacion() {
        // Buscar si ya existe
        this.contenedorComparacion = document.querySelector('.batalla-comparacion');
        
        if (!this.contenedorComparacion) {
            this.contenedorComparacion = document.createElement('div');
            this.contenedorComparacion.className = 'batalla-comparacion';
            this.contenedorComparacion.style.display = 'none';
            
            this.contenedorComparacion.innerHTML = `
                <div class="overlay-batalla">
                    <div class="container-batalla">
                        <div class="header-batalla">
                            <h2 class="titulo-batalla">BATALLA DE CARTAS</h2>
                            <div class="atributo-batalla">
                                <span class="texto-atributo">Atributo: </span>
                                <span class="nombre-atributo"></span>
                            </div>
                        </div>
                        
                        <div class="arena-cartas">
                            <div class="cartas-jugadas"></div>
                        </div>
                        
                        <div class="resultado-batalla" style="display: none;">
                            <div class="carta-ganadora-container">
                                <h3>¡CARTA GANADORA!</h3>
                                <div class="carta-ganadora"></div>
                                <div class="info-ganador"></div>
                            </div>
                        </div>
                        
                        <div class="cronometro-batalla">
                            <span class="tiempo-restante">05</span>
                        </div>
                        
                        <div class="controles-batalla">
                            <button class="btn-continuar" style="display: none;">
                                CONTINUAR
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.contenedorComparacion);
        }
    }

    /**
     * Muestra la comparación de cartas
     */
    async mostrarComparacion(cartasJugadas, atributoComparar) {
        try {
            console.log(' Iniciando comparación de cartas...');
            
            this.cartasEnComparacion = cartasJugadas;
            this.atributoComparar = atributoComparar;
            this.animacionEnProgreso = true;
            
            // Cargar información completa de las cartas
            await this.cargarInfoCompletaCartas();
            
            // Mostrar el contenedor
            this.contenedorComparacion.style.display = 'flex';
            
            // Configurar header
            this.configurarHeader();
            
            // Mostrar cartas en la arena
            await this.mostrarCartasEnArena();
            
            // Iniciar cronómetro
            this.iniciarCronometro();
            
            // Después del cronómetro, mostrar resultado
            setTimeout(async () => {
                await this.mostrarResultado();
            }, 5000);
            
        } catch (error) {
            console.error(' Error mostrando comparación:', error);
            this.ocultarComparacion();
        }
    }

    /**
     * Carga información completa de las cartas (con datos de la carta original)
     */
async cargarInfoCompletaCartas() {
  for (const j of this.cartasEnComparacion) {
    // Normalizar ids y valor
    j.id = j.Id ?? j.id;
    j.idJugador = Number(j.IdJugador ?? j.idJugador);
    j.idCartaJugador = Number(j.IdCartaJugador ?? j.idCartaJugador);
    j.valorAtributo = Number(j.ValorAtributo ?? j.valorAtributo ?? 0);

    // CartaJugador completa
    if (!j.cartaJugador || !j.cartaJugador.Carta) {
      const urlCJ = buildUrl(API_ENDPOINTS.CARTA_JUGADOR_BY_ID, { id: j.idCartaJugador });
      const cj = await apiGet(urlCJ);
      // normaliza carta interna
      const carta = cj.Carta ?? cj.carta ?? {};
      j.cartaJugador = {
        ...cj,
        Carta: {
          Id: carta.Id ?? carta.id,
          Nombre: carta.Nombre ?? carta.nombre,
          Imagen: carta.Imagen ?? carta.imagen, // puede ser nombre archivo o bytes
          Rareza: carta.Rareza ?? carta.rareza,
          Vida: carta.Vida ?? carta.vida ?? 0,
          Defensa: (carta.Defensa ?? carta.defensa ?? carta.Defenza ?? carta.defenza ?? 0),
          Defenza: (carta.Defenza ?? carta.defenza ?? carta.Defensa ?? carta.defensa ?? 0),
          Velocidad: carta.Velocidad ?? carta.velocidad ?? 0,
          Ataque: carta.Ataque ?? carta.ataque ?? 0,
          Poder: carta.Poder ?? carta.poder ?? 0,
          Terror: carta.Terror ?? carta.terror ?? 0
        }
      };
    }

    // Jugador
    if (!j.jugador) {
      const urlJ = buildUrl(API_ENDPOINTS.JUGADOR_BY_ID, { id: j.idJugador });
      const ju = await apiGet(urlJ);
      j.jugador = {
        id: ju.Id ?? ju.id,
        nombre: ju.Nombre ?? ju.nombre,
        avatar: ju.Avatar ?? ju.avatar
      };
    }
  }
}


    /**
     * Configura el header de la batalla
     */
    configurarHeader() {
        const nombreAtributo = this.contenedorComparacion.querySelector('.nombre-atributo');
        if (nombreAtributo) {
            nombreAtributo.textContent = this.atributoComparar.toUpperCase();
        }
    }

    /**
     * Muestra las cartas en la arena de batalla
     */
    async mostrarCartasEnArena() {
        const arenaCartas = this.contenedorComparacion.querySelector('.cartas-jugadas');
        if (!arenaCartas) return;
        
        arenaCartas.innerHTML = '';
        
        // Ordenar cartas por valor del atributo (descendente)
        const cartasOrdenadas = [...this.cartasEnComparacion].sort((a, b) => 
            b.valorAtributo - a.valorAtributo
        );
        
        // Crear elementos de carta para cada jugada
        cartasOrdenadas.forEach((jugada, index) => {
            const cartaElement = this.crearElementoCartaBatalla(jugada, index === 0);
            arenaCartas.appendChild(cartaElement);
            
            // Animar entrada de carta
            setTimeout(() => {
                cartaElement.classList.add('carta-entrada');
            }, index * 500);
        });
    }

    /**
     * Crea el elemento visual de una carta en la batalla
     */
    crearElementoCartaBatalla(jugada, esGanadora = false) {
  const carta = jugada.cartaJugador.Carta || jugada.cartaJugador.carta || {};
  const jugador = jugada.jugador || {};
  const cartaElement = document.createElement('div');
  cartaElement.className = `carta-batalla ${esGanadora ? 'carta-ganadora-preview' : ''}`;
  cartaElement.dataset.jugadaId = jugada.id;
  cartaElement.dataset.valor = jugada.valorAtributo;

  const imgSrc = this.resolveCartaImg(carta);

  const attr = (k) => {
    const a = String(this.atributoComparar || '').toLowerCase();
    if (a === 'defenza') return (k === 'defensa' || k === 'defenza');
    return a === k;
  };

  cartaElement.innerHTML = `
    <div class="carta-container">
      <div class="info-jugador-carta">
        <img src="${this.resolveAvatar(jugador.avatar)}" alt="${jugador.nombre || ''}" class="avatar-mini">
        <span class="nombre-jugador-carta">${jugador.nombre || ''}</span>
      </div>
      <div class="carta-visual">
        <div class="carta-header">
          <span class="carta-nombre">${carta.Nombre || 'Carta'}</span>
          <span class="carta-rareza ${this.obtenerClaseRareza(carta.Rareza || '')}">${carta.Rareza || ''}</span>
        </div>
        <div class="carta-imagen">
          <img src="${imgSrc}" alt="${carta.Nombre || ''}">
        </div>
        <div class="carta-stats">
          <div class="stat-item ${attr('vida') ? 'stat-competido' : ''}"><span class="stat-label">VIDA</span><span class="stat-value">${carta.Vida ?? 0}</span></div>
          <div class="stat-item ${attr('defensa') ? 'stat-competido' : ''}"><span class="stat-label">DEF</span><span class="stat-value">${(carta.Defensa ?? carta.Defenza ?? 0)}</span></div>
          <div class="stat-item ${attr('velocidad') ? 'stat-competido' : ''}"><span class="stat-label">VEL</span><span class="stat-value">${carta.Velocidad ?? 0}</span></div>
          <div class="stat-item ${attr('ataque') ? 'stat-competido' : ''}"><span class="stat-label">ATQ</span><span class="stat-value">${carta.Ataque ?? 0}</span></div>
          <div class="stat-item ${attr('poder') ? 'stat-competido' : ''}"><span class="stat-label">POD</span><span class="stat-value">${carta.Poder ?? 0}</span></div>
          <div class="stat-item ${attr('terror') ? 'stat-competido' : ''}"><span class="stat-label">TER</span><span class="stat-value">${carta.Terror ?? 0}</span></div>
        </div>
        <div class="valor-atributo-destacado">
          <span class="atributo-nombre">${String(this.atributoComparar || '').toUpperCase()}</span>
          <span class="atributo-valor">${jugada.valorAtributo}</span>
        </div>
      </div>
    </div>
  `;
  return cartaElement;
}
resolveCartaImg(carta) {
  // Si Imagen es string → construye URL pública; si es byte[] → base64
  const img = carta.Imagen ?? carta.imagen;
  if (!img) return '../img/foto/default-card.jpg';

  if (typeof img === 'string') {
    const API_BASE = (window.API_CONFIG?.baseURL || '').replace(/\/+$/, '');
    const PUBLIC_BASE = API_BASE.replace(/\/api$/i, '');
    const baseName = img.split(/[\\/]/).pop();
    return `${PUBLIC_BASE}/img/foto/${encodeURIComponent(baseName)}`;
  }

  // bytes
  try {
    const u8 = Array.isArray(img) ? new Uint8Array(img) : new Uint8Array(Object.values(img));
    return `data:image/jpeg;base64,${this.arrayBufferToBase64(u8.buffer)}`;
  } catch { return '../img/foto/default-card.jpg'; }
}

resolveAvatar(avatar) {
  if (!avatar) return '../img/foto/icono.png';
  if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
  const API_BASE = (window.API_CONFIG?.baseURL || '').replace(/\/+$/, '');
  const PUBLIC_BASE = API_BASE.replace(/\/api$/i, '');
  const baseName = String(avatar).split(/[\\/]/).pop();
  return `${PUBLIC_BASE}/img/foto/${encodeURIComponent(baseName)}`;
}
    /**
     * Convierte array buffer a base64
     */
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Obtiene la clase CSS para la rareza
     */
    obtenerClaseRareza(rareza) {
        if (!rareza) return 'comun';
        
        const rarezaLower = rareza.toLowerCase();
        if (rarezaLower.includes('especial')) return 'especial';
        if (rarezaLower.includes('rara')) return 'rara';
        if (rarezaLower.includes('epica')) return 'epica';
        if (rarezaLower.includes('legendaria')) return 'legendaria';
        return 'comun';
    }

    /**
     * Inicia el cronómetro de la batalla
     */
    iniciarCronometro() {
        const cronometroElement = this.contenedorComparacion.querySelector('.tiempo-restante');
        if (!cronometroElement) return;
        
        let tiempoRestante = 5;
        cronometroElement.textContent = String(tiempoRestante).padStart(2, '0');
        
        const intervalo = setInterval(() => {
            tiempoRestante--;
            cronometroElement.textContent = String(tiempoRestante).padStart(2, '0');
            
            if (tiempoRestante <= 0) {
                clearInterval(intervalo);
            }
        }, 1000);
    }

    /**
     * Muestra el resultado de la batalla
     */
    async mostrarResultado() {
        try {
            // Determinar ganador
            const ganadora = this.determinarGanador();
            
            if (!ganadora) {
                console.error(' No se pudo determinar ganador');
                return;
            }
            
            this.ganadorId = ganadora.idJugador;
            
            // Resaltar carta ganadora en la arena
            this.resaltarCartaGanadora(ganadora);
            
            // Mostrar resultado grande
            await this.mostrarCartaGanadoraGrande(ganadora);
            
            // Actualizar ronda en el backend
            await this.gameFlow.onRondaTerminada(this.ganadorId);
            
            // Mostrar botón continuar
            this.mostrarBotonContinuar();
            
        } catch (error) {
            console.error(' Error mostrando resultado:', error);
        }
    }

    /**
     * Determina el ganador de la batalla
     */
    determinarGanador() {
        if (!this.cartasEnComparacion.length) return null;
        
        // Encontrar el valor más alto del atributo
        const valorMaximo = Math.max(...this.cartasEnComparacion.map(j => j.valorAtributo));
        
        // Encontrar la carta con ese valor
        const ganadora = this.cartasEnComparacion.find(j => j.valorAtributo === valorMaximo);
        
        console.log(' Ganador determinado:', ganadora?.jugador?.nombre, 'con valor:', valorMaximo);
        
        return ganadora;
    }

    /**
     * Resalta la carta ganadora en la arena
     */
    resaltarCartaGanadora(jugadaGanadora) {
        const cartasEnArena = this.contenedorComparacion.querySelectorAll('.carta-batalla');
        
        cartasEnArena.forEach(carta => {
            const jugadaId = carta.dataset.jugadaId;
            if (jugadaId == jugadaGanadora.id) {
                carta.classList.add('carta-ganadora-resaltada');
            } else {
                carta.classList.add('carta-perdedora');
            }
        });
    }

    /**
     * Muestra la carta ganadora en grande
     */
    async mostrarCartaGanadoraGrande(jugadaGanadora) {
        const resultadoContainer = this.contenedorComparacion.querySelector('.resultado-batalla');
        const cartaGanadoraContainer = this.contenedorComparacion.querySelector('.carta-ganadora');
        const infoGanadorContainer = this.contenedorComparacion.querySelector('.info-ganador');
        
        if (!resultadoContainer || !cartaGanadoraContainer || !infoGanadorContainer) return;
        
        const carta = jugadaGanadora.cartaJugador.carta;
        const jugador = jugadaGanadora.jugador;
        
        // Convertir imagen
        let imagenSrc = '../img/foto/default-card.jpg';
        if (carta.imagen && carta.imagen.length > 0) {
            const uint8Array = new Uint8Array(carta.imagen);
            const base64String = this.arrayBufferToBase64(uint8Array.buffer);
            imagenSrc = `data:image/jpeg;base64,${base64String}`;
        }
        
        cartaGanadoraContainer.innerHTML = `
            <div class="carta-ganadora-grande">
                <div class="carta-imagen-grande">
                    <img src="${imagenSrc}" alt="${carta.nombre}">
                </div>
                <div class="carta-info-grande">
                    <h4 class="carta-nombre-grande">${carta.nombre}</h4>
                    <div class="atributo-ganador">
                        <span>${this.atributoComparar.toUpperCase()}: </span>
                        <span class="valor-ganador">${jugadaGanadora.valorAtributo}</span>
                    </div>
                </div>
            </div>
        `;
        
        infoGanadorContainer.innerHTML = `
            <div class="info-jugador-ganador">
                <img src="${jugador.avatar}" alt="${jugador.nombre}" class="avatar-ganador">
                <div class="texto-ganador">
                    <h3>${jugador.nombre}</h3>
                    <p>¡Gana esta ronda!</p>
                    <p class="puntos-info">+1 punto</p>
                </div>
            </div>
        `;
        
        // Mostrar con animación
        resultadoContainer.style.display = 'block';
        setTimeout(() => {
            resultadoContainer.classList.add('resultado-visible');
        }, 100);
    }

    /**
     * Muestra el botón para continuar
     */
    mostrarBotonContinuar() {
        const botonContinuar = this.contenedorComparacion.querySelector('.btn-continuar');
        if (botonContinuar) {
            botonContinuar.style.display = 'block';
            botonContinuar.onclick = () => this.continuarJuego();
        }
    }

    /**
     * Continúa el juego después de la batalla
     */
    continuarJuego() {
        this.ocultarComparacion();
        this.animacionEnProgreso = false;
        
        // El GameFlowController manejará la transición a la siguiente ronda
        console.log(' Continuando juego...');
    }

    /**
     * Oculta la comparación
     */
    ocultarComparacion() {
        if (this.contenedorComparacion) {
            this.contenedorComparacion.style.display = 'none';
            
            // Limpiar contenido
            const arenaCartas = this.contenedorComparacion.querySelector('.cartas-jugadas');
            if (arenaCartas) arenaCartas.innerHTML = '';
            
            const resultadoBatalla = this.contenedorComparacion.querySelector('.resultado-batalla');
            if (resultadoBatalla) {
                resultadoBatalla.style.display = 'none';
                resultadoBatalla.classList.remove('resultado-visible');
            }
            
            const botonContinuar = this.contenedorComparacion.querySelector('.btn-continuar');
            if (botonContinuar) botonContinuar.style.display = 'none';
        }
    }

    /**
     * Obtiene información del estado actual de la batalla
     */
    getEstadoBatalla() {
        return {
            enProgreso: this.animacionEnProgreso,
            cartasEnComparacion: this.cartasEnComparacion.length,
            atributoComparar: this.atributoComparar,
            ganadorId: this.ganadorId
        };
    }

    /**
     * Limpia recursos
     */
    destroy() {
        this.ocultarComparacion();
        
        if (this.contenedorComparacion && this.contenedorComparacion.parentNode) {
            this.contenedorComparacion.remove();
        }
        
        this.contenedorComparacion = null;
        this.cartasEnComparacion = [];
        this.atributoComparar = null;
        this.ganadorId = null;
        this.animacionEnProgreso = false;
        
        console.log(' BattleComparator destruido');
    }
}

// Exportar para uso global
window.BattleComparator = BattleComparator;

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleComparator;
}
