// ===== CONFIGURACIÓN Y VARIABLES GLOBALES =====
const API_BASE = 'http://localhost:7147/api';
let partidaActual = null;
let codigoPartidaActual = null;
let jugadoresPartida = [];
let jugadorActual = null;
let cartasJugador = [];
let rondaActual = null;
let modoOffline = false;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Inicializando página de partida...');
    inicializarPartida();
});

// Función principal de inicialización
async function inicializarPartida() {
    try {
        // Recuperar datos del localStorage
        partidaActual = localStorage.getItem('partidaId');
        codigoPartidaActual = localStorage.getItem('codigoPartida');
        const jugadoresData = localStorage.getItem('jugadoresPartida');
        modoOffline = localStorage.getItem('modoOffline') === 'true';
        
        console.log('📊 Datos recuperados:', {
            partidaActual,
            codigoPartidaActual,
            modoOffline,
            jugadoresData: jugadoresData ? 'Disponible' : 'No disponible'
        });
        
        if (jugadoresData) {
            jugadoresPartida = JSON.parse(jugadoresData);
            console.log('👥 Jugadores de la partida:', jugadoresPartida);
        }
        
        if (!modoOffline && partidaActual) {
            // Modo online - conectar con backend
            await conectarConBackend();
        } else {
            // Modo offline - usar datos locales
            console.log('⚠️ Iniciando en modo offline');
            inicializarModoOffline();
        }
        
        // Actualizar interfaz
        actualizarInterfazPartida();
        
    } catch (error) {
        console.error('❌ Error al inicializar partida:', error);
        mostrarError('Error al cargar la partida');
    }
}

// Conectar con el backend y obtener datos actualizados
async function conectarConBackend() {
    try {
        console.log('🔗 Conectando con el backend...');
        
        // Verificar estado de la partida
        const response = await fetch(`${API_BASE}/partida/${partidaActual}/estado`);
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        const estadoPartida = await response.json();
        console.log('✅ Estado de la partida obtenido:', estadoPartida);
        
        // Actualizar datos locales con información del servidor
        if (estadoPartida.jugadores) {
            jugadoresPartida = estadoPartida.jugadores;
            jugadorActual = jugadoresPartida[0]; // Por ahora usar el primer jugador
        }
        
        if (estadoPartida.rondaEnCurso) {
            rondaActual = estadoPartida.rondaEnCurso;
        }
        
        // Obtener cartas del jugador
        if (jugadorActual) {
            await obtenerCartasJugador(jugadorActual.id || jugadorActual.Id);
        }
        
    } catch (error) {
        console.error('❌ Error al conectar con backend:', error);
        console.log('⚠️ Fallback a modo offline');
        modoOffline = true;
        inicializarModoOffline();
    }
}

// Obtener cartas del jugador desde el backend
async function obtenerCartasJugador(jugadorId) {
    try {
        console.log(`🃏 Obteniendo cartas del jugador ${jugadorId}...`);
        
        const response = await fetch(`${API_BASE}/cartajugador/jugador/${jugadorId}`);
        
        if (!response.ok) {
            throw new Error(`Error al obtener cartas: ${response.status}`);
        }
        
        cartasJugador = await response.json();
        console.log('✅ Cartas obtenidas:', cartasJugador);
        
        // Generar cartas en la interfaz
        generarCartasEnInterfaz();
        
    } catch (error) {
        console.error('❌ Error al obtener cartas:', error);
        // Generar cartas de ejemplo en modo offline
        generarCartasEjemplo();
    }
}

// Modo offline con datos de ejemplo
function inicializarModoOffline() {
    console.log('🔧 Inicializando modo offline...');
    
    // Usar el primer jugador como jugador actual
    if (jugadoresPartida && jugadoresPartida.length > 0) {
        jugadorActual = {
            id: 1,
            nombre: jugadoresPartida[0].Nombre || jugadoresPartida[0].nombre,
            avatar: jugadoresPartida[0].Avatar || jugadoresPartida[0].avatar
        };
    }
    
    // Generar cartas de ejemplo
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
    
    console.log('🎴 Cartas de ejemplo generadas:', cartasJugador);
    generarCartasEnInterfaz();
}

// Generar cartas en la interfaz
function generarCartasEnInterfaz() {
    const contenedorCartas = document.querySelector('.contenedor-cartas-completo');
    const loading = document.querySelector('.loading-cartas');
    
    if (!contenedorCartas) {
        console.error('❌ No se encontró el contenedor de cartas');
        return;
    }
    
    // Ocultar loading
    if (loading) {
        loading.style.display = 'none';
    }
    
    // Limpiar contenedor
    contenedorCartas.innerHTML = '';
    
    // Generar cada carta
    cartasJugador.forEach((carta, index) => {
        const cartaElement = crearElementoCarta(carta, index);
        contenedorCartas.appendChild(cartaElement);
    });
    
    console.log('✅ Cartas generadas en la interfaz');
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
                    <span class="stat-label">❤️ Vida:</span>
                    <span class="stat-value">${vida}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">⚔️ Ataque:</span>
                    <span class="stat-value">${ataque}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">🛡️ Defensa:</span>
                    <span class="stat-value">${defensa}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">💨 Velocidad:</span>
                    <span class="stat-value">${velocidad}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">⚡ Poder:</span>
                    <span class="stat-value">${poder}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">👻 Terror:</span>
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

// Actualizar interfaz con información de la partida
function actualizarInterfazPartida() {
    // Actualizar información de la ronda
    const textoRonda = document.querySelector('.texto-terror .numero');
    if (textoRonda && rondaActual) {
        textoRonda.textContent = rondaActual.numeroRonda || rondaActual.NumeroRonda || 1;
    }
    
    // Actualizar información del jugador
    if (jugadorActual) {
        const inputJugador = document.querySelector('.iconos-1 input');
        if (inputJugador) {
            inputJugador.value = jugadorActual.nombre || jugadorActual.Nombre || 'Jugador';
        }
    }
    
    // Mostrar información de la partida en consola
    console.log('🎮 Interfaz actualizada:', {
        jugadorActual,
        rondaActual,
        totalCartas: cartasJugador.length
    });
}

// Función para jugar una carta
async function jugarCarta(cartaId) {
    console.log(`🎯 Intentando jugar carta ${cartaId}...`);
    
    if (modoOffline) {
        console.log('⚠️ Modo offline - Simulando jugada...');
        mostrarMensaje(`🎴 Carta ${cartaId} jugada (modo offline)`);
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
        
        console.log('📤 Enviando jugada:', jugadaDto);
        
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
        console.log('✅ Carta jugada exitosamente:', resultado);
        mostrarMensaje('🎉 ¡Carta jugada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error al jugar carta:', error);
        mostrarError(`Error al jugar carta: ${error.message}`);
    }
}

// Funciones de utilidad
function mostrarMensaje(mensaje) {
    console.log(`📢 ${mensaje}`);
    // Aquí podrías agregar una notificación visual
}

function mostrarError(mensaje) {
    console.error(`❌ ${mensaje}`);
    // Aquí podrías agregar una notificación de error visual
}

// Función para volver al lobby
function volverAlLobby() {
    window.location.href = './Lobby.html';
}
