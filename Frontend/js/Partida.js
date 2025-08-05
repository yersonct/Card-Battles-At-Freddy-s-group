const API_BASE = 'http://localhost:7147/api';
let partidaActual = null;
let codigoPartidaActual = null;
let jugadoresPartida = [];
let jugadorActual = null;
let cartasJugador = [];
let rondaActual = null;
let modoOffline = false;

document.addEventListener('DOMContentLoaded', function() {
    inicializarPartida();
});

async function inicializarPartida() {
    try {
        partidaActual = localStorage.getItem('partidaId');
        codigoPartidaActual = localStorage.getItem('codigoPartida');
        const jugadoresData = localStorage.getItem('jugadoresPartida');
        modoOffline = localStorage.getItem('modoOffline') === 'true';
        
        if (jugadoresData) {
            jugadoresPartida = JSON.parse(jugadoresData);
        }
        
        if (!modoOffline && partidaActual) {
            await conectarConBackend();
        } else {
            inicializarModoOffline();
        }
        
        actualizarInterfazPartida();
        
    } catch (error) {
        mostrarError('Error al cargar la partida');
    }
}

async function conectarConBackend() {
    try {
        const response = await fetch(`${API_BASE}/partida/${partidaActual}/estado`);
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        const estadoPartida = await response.json();
        
        if (estadoPartida.jugadores) {
            jugadoresPartida = estadoPartida.jugadores;
            jugadorActual = jugadoresPartida[0];
        }
        
        if (estadoPartida.rondaEnCurso) {
            rondaActual = estadoPartida.rondaEnCurso;
        }
        
        if (jugadorActual) {
            await obtenerCartasJugador(jugadorActual.id || jugadorActual.Id);
        }
        
    } catch (error) {
        modoOffline = true;
        inicializarModoOffline();
    }
}

// Obtener cartas del jugador desde el backend
async function obtenerCartasJugador(jugadorId) {
    try {
        console.log(` Obteniendo cartas del jugador ${jugadorId}...`);
        
        const response = await fetch(`${API_BASE}/cartajugador/jugador/${jugadorId}`);
        
        if (!response.ok) {
            throw new Error(`Error al obtener cartas: ${response.status}`);
        }
        
        cartasJugador = await response.json();
        console.log(' Cartas obtenidas:', cartasJugador);
        
        generarCartasEnInterfaz();
        
    } catch (error) {
        generarCartasEjemplo();
    }
}

function inicializarModoOffline() {
    if (jugadoresPartida && jugadoresPartida.length > 0) {
        jugadorActual = {
            id: 1,
            nombre: jugadoresPartida[0].Nombre || jugadoresPartida[0].nombre,
            avatar: jugadoresPartida[0].Avatar || jugadoresPartida[0].avatar
        };
    }
    
    generarCartasEjemplo();
}

// Generar cartas de ejemplo para modo offline
function generarCartasEjemplo() {
    cartasJugador = [];
    const personajes = ['Freddy', 'Bonnie', 'Chica', 'Foxy', 'Golden Freddy', 'Springtrap', 'Ennard', 'Circus Baby'];
    
    for (let i = 0; i < 8; i++) {
        cartasJugador.push({
            id: i + 1,
            nombre: personajes[i],
            vida: Math.floor(Math.random() * 50) + 50,
            ataque: Math.floor(Math.random() * 40) + 30,
            defensa: Math.floor(Math.random() * 35) + 25,
            velocidad: Math.floor(Math.random() * 30) + 20,
            poder: Math.floor(Math.random() * 45) + 35,
            terror: Math.floor(Math.random() * 50) + 40,
            imagen: `../img/foto/${i + 1}.jpg`
        });
    }
    
    generarCartasEnInterfaz();
}

function generarCartasEnInterfaz() {
    const contenedorCartas = document.querySelector('.contenedor-cartas-completo');
    const loading = document.querySelector('.loading-cartas');
    
    if (!contenedorCartas) {
        return;
    }
    
    if (loading) {
        loading.style.display = 'none';
    }
    
    contenedorCartas.innerHTML = '';
    
    cartasJugador.forEach((carta, index) => {
        const cartaElement = crearElementoCarta(carta, index);
        contenedorCartas.appendChild(cartaElement);
    });
}

// Crear elemento HTML para una carta
function crearElementoCarta(carta, index) {
    const cartaDiv = document.createElement('div');
    cartaDiv.className = 'carta-juego';
    cartaDiv.dataset.cartaId = carta.id || carta.Id;
    cartaDiv.dataset.cartaIndex = index;
    
    const nombre = carta.nombre || carta.Nombre || `Carta ${index + 1}`;
    const vida = carta.vida || carta.Vida || 0;
    const ataque = carta.ataque || carta.Ataque || 0;
    const defensa = carta.defensa || carta.Defensa || 0;
    const velocidad = carta.velocidad || carta.Velocidad || 0;
    const poder = carta.poder || carta.Poder || 0;
    const terror = carta.terror || carta.Terror || 0;
    
    cartaDiv.innerHTML = `
        <div class="carta-contenido">
            <div class="carta-header">
                <h3>${nombre}</h3>
            </div>
            <div class="carta-imagen">
                <img src="${carta.imagen || '../img/foto/default.jpg'}" alt="${nombre}" onerror="this.src='../img/foto/1.jpg'">
            </div>
            <div class="carta-stats">
                <div class="stat">
                    <span class="stat-label"> Vida:</span>
                    <span class="stat-value">${vida}</span>
                </div>
                <div class="stat">
                    <span class="stat-label"> Ataque:</span>
                    <span class="stat-value">${ataque}</span>
                </div>
                <div class="stat">
                    <span class="stat-label"> Defensa:</span>
                    <span class="stat-value">${defensa}</span>
                </div>
                <div class="stat">
                    <span class="stat-label"> Velocidad:</span>
                    <span class="stat-value">${velocidad}</span>
                </div>
                <div class="stat">
                    <span class="stat-label"> Poder:</span>
                    <span class="stat-value">${poder}</span>
                </div>
                <div class="stat">
                    <span class="stat-label"> Terror:</span>
                    <span class="stat-value">${terror}</span>
                </div>
            </div>
            <div class="carta-acciones">
                <button class="btn-jugar-carta" onclick="jugarCarta(${carta.id || carta.Id})">
                    🎮 Jugar Carta
                </button>
            </div>
        </div>
    `;
    
    return cartaDiv;
}

function actualizarInterfazPartida() {
    const textoRonda = document.querySelector('.texto-terror .numero');
    if (textoRonda && rondaActual) {
        textoRonda.textContent = rondaActual.numeroRonda || rondaActual.NumeroRonda || 1;
    }
    
    if (jugadorActual) {
        const inputJugador = document.querySelector('.iconos-1 input');
        if (inputJugador) {
            inputJugador.value = jugadorActual.nombre || jugadorActual.Nombre || 'Jugador';
        }
    }
}

async function jugarCarta(cartaId) {
    if (modoOffline) {
        mostrarMensaje(` Carta ${cartaId} jugada (modo offline)`);
        return;
    }
    
    if (!rondaActual) {
        mostrarError('No hay una ronda activa');
        return;
    }
    
    if (!jugadorActual) {
        mostrarError('No hay jugador seleccionado');
        return;
    }
    
    try {
        const jugadaDto = {
            IdRonda: rondaActual.id || rondaActual.Id,
            IdJugador: jugadorActual.id || jugadorActual.Id,
            IdCartaJugador: cartaId
        };
        
        console.log(' Enviando jugada:', jugadaDto);
        
        const response = await fetch(`${API_BASE}/jugada`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jugadaDto)
        });
        
        if (!response.ok) {
            throw new Error(`Error al jugar carta: ${response.status}`);
        }
        
        const resultado = await response.json();
        mostrarMensaje('¡Carta jugada exitosamente!');
        
    } catch (error) {
        mostrarError(`Error al jugar carta: ${error.message}`);
    }
}

function mostrarMensaje(mensaje) {
    
}

function mostrarError(mensaje) {
    
}

function volverAlLobby() {
    window.location.href = './Lobby.html';
}
