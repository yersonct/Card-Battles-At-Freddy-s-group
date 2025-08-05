// Función para ir a la pantalla de transición antes de volver a crear sala
function irTransmision() {
    // Guardamos la URL de destino en el almacenamiento local
    localStorage.setItem("urlDestino", "./Lobby.html");
    
    // Redirigimos a la página de transición
    window.location.href = '../html/Pantalla.html';
}

// ===== VARIABLES GLOBALES =====
let contadorJugadores = 2; // Empezamos con 2 jugadores
let maxJugadores = 7; // Máximo de 7 jugadores permitidos

// Configuración del backend
const API_BASE = 'http://localhost:7147/api';

// Variables para la partida
let partidaActual = null;
let codigoPartidaActual = null;

// Array con todas las opciones de avatares disponibles
const opcionesAvatares = [
    '../img/foto/1.jpg',              // Freddy (dorado)
    '../img/foto/2.jpg',              // Bonnie (azul/morado)
    '../img/foto/3.jpg',              // Chica (amarillo)
    '../img/foto/4.jpg',              // Foxy (rojo)
    '../img/foto/golden-freddy.png',  // Golden Freddy
    '../img/foto/ballons.jpg',        // Balloon Boy
    '../img/foto/nomeacuerdo.jpg'     // Springtrap
];

// Objeto para rastrear el índice actual de avatar de cada jugador
let indicesAvatares = {};

// Array para rastrear qué avatares están siendo usados
let avatarsUsados = [];

// ===== FUNCIONES PRINCIPALES =====

// Función para cambiar avatar al hacer clic directo
function cambiarAvatar(numeroJugador) {
    console.log(`Cambiando avatar para jugador ${numeroJugador}`);
    
    // Si es la primera vez que hace clic este jugador, empezar desde -1
    if (indicesAvatares[numeroJugador] === undefined) {
        indicesAvatares[numeroJugador] = -1;
    }

    let avatarActual = obtenerAvatarActual(numeroJugador);
    
    // Liberar el avatar actual si tiene uno
    if (avatarActual) {
        const indiceUsado = avatarsUsados.indexOf(avatarActual);
        if (indiceUsado > -1) {
            avatarsUsados.splice(indiceUsado, 1);
        }
    }

    // Buscar el siguiente avatar disponible
    let intentos = 0;
    let nuevoIndice = indicesAvatares[numeroJugador];
    
    do {
        nuevoIndice = (nuevoIndice + 1) % opcionesAvatares.length;
        intentos++;
        
        // Si ya intentamos todos los avatares, significa que todos están ocupados
        if (intentos > opcionesAvatares.length) {
            actualizarTextoJugadores("Todos los avatares están ocupados");
            return;
        }
    } while (avatarsUsados.includes(opcionesAvatares[nuevoIndice]));

    // Asignar el nuevo avatar
    indicesAvatares[numeroJugador] = nuevoIndice;
    const nuevoAvatar = opcionesAvatares[nuevoIndice];
    avatarsUsados.push(nuevoAvatar);

    // Actualizar la imagen del avatar
    const elementoAvatar = document.querySelector(`[data-jugador="${numeroJugador}"] .avatar-jugador`);
    if (elementoAvatar) {
        elementoAvatar.style.backgroundImage = `url('${nuevoAvatar}')`;
        console.log(`Avatar actualizado para jugador ${numeroJugador}: ${nuevoAvatar}`);
    }

    // Actualizar texto informativo
    actualizarTextoJugadores(`Jugadores: ${contadorJugadores}`);
}

// Función auxiliar para obtener el avatar actual de un jugador
function obtenerAvatarActual(numeroJugador) {
    if (indicesAvatares[numeroJugador] === undefined || indicesAvatares[numeroJugador] === -1) {
        return null;
    }
    return opcionesAvatares[indicesAvatares[numeroJugador]];
}

// Función para agregar un nuevo jugador
function agregarJugador() {
    console.log(`Intentando agregar jugador. Contador actual: ${contadorJugadores}`);
    
    if (contadorJugadores >= maxJugadores) {
        actualizarTextoJugadores(`Máximo ${maxJugadores} jugadores permitidos`);
        return;
    }

    contadorJugadores++;
    
    // Crear nueva caja de jugador
    const contenedor = document.getElementById('contenedor-avatares');
    const botonAgregar = document.getElementById('boton-agregar');
    
    // HTML para nuevo jugador
    const nuevoJugadorHTML = `
        <div class="caja-jugador" data-jugador="${contadorJugadores}">
            <button class="boton-eliminar" onclick="eliminarJugador(this)">X</button>
            <div class="avatar-jugador" onclick="cambiarAvatar(${contadorJugadores})"></div>
            <div class="etiqueta-nombre">
                <input type="text" placeholder="JUGADOR ${contadorJugadores}" maxlength="10" minlength="3">
            </div>
        </div>
    `;
    
    // Insertar antes del botón de agregar
    botonAgregar.insertAdjacentHTML('beforebegin', nuevoJugadorHTML);
    
    console.log(`Jugador ${contadorJugadores} agregado exitosamente`);
    
    // Actualizar contador
    actualizarTextoJugadores(`Jugadores: ${contadorJugadores}`);

    // Mostrar botones de eliminar para todos excepto los primeros 2
    mostrarBotonesEliminar();

    // Ocultar botón de agregar si llegamos al máximo
    if (contadorJugadores >= maxJugadores) {
        botonAgregar.style.display = 'none';
    }
}

// Función para eliminar un jugador - ÚNICA VERSIÓN
function eliminarJugador(boton) {
    console.log('Intentando eliminar jugador...');
    
    const cajaJugador = boton.closest('.caja-jugador');
    
    if (!cajaJugador) {
        console.error('No se encontró la caja del jugador');
        return;
    }
    
    const numeroJugador = parseInt(cajaJugador.dataset.jugador);
    console.log(`Eliminando jugador número: ${numeroJugador}`);
    
    // No permitir eliminar si solo hay 2 jugadores
    if (contadorJugadores <= 2) {
        actualizarTextoJugadores("Mínimo 2 jugadores requeridos");
        console.log('No se puede eliminar: mínimo 2 jugadores');
        return;
    }
    
    // Liberar avatar usado si tenía uno
    const avatarActual = obtenerAvatarActual(numeroJugador);
    if (avatarActual) {
        const indice = avatarsUsados.indexOf(avatarActual);
        if (indice > -1) {
            avatarsUsados.splice(indice, 1);
            console.log(`Avatar liberado: ${avatarActual}`);
        }
    }

    // Limpiar datos del jugador
    delete indicesAvatares[numeroJugador];
    
    // Eliminar el jugador
    cajaJugador.remove();
    contadorJugadores--;
    
    console.log(`Jugador eliminado. Contador actual: ${contadorJugadores}`);
    
    // Mostrar botón de agregar si estaba oculto
    const botonAgregar = document.getElementById('boton-agregar');
    if (botonAgregar.style.display === 'none') {
        botonAgregar.style.display = 'flex';
    }
    
    actualizarTextoJugadores(`Jugadores: ${contadorJugadores}`);

    // Ocultar botones de eliminar si solo quedan 2 jugadores
    if (contadorJugadores <= 2) {
        ocultarBotonesEliminar();
    }
}

// Función para mostrar botones de eliminar
function mostrarBotonesEliminar() {
    const botones = document.querySelectorAll('.boton-eliminar');
    botones.forEach((boton, index) => {
        // Solo mostrar botones para jugadores 3 en adelante
        const cajaJugador = boton.closest('.caja-jugador');
        const numeroJugador = parseInt(cajaJugador.dataset.jugador);
        
        if (numeroJugador > 2) {
            boton.style.display = 'flex';
        }
    });
}

// Función para ocultar botones de eliminar
function ocultarBotonesEliminar() {
    const botones = document.querySelectorAll('.boton-eliminar');
    botones.forEach(boton => {
        boton.style.display = 'none';
    });
}

// Función para actualizar el texto de cantidad de jugadores
function actualizarTextoJugadores(mensaje) {
    const textoElemento = document.getElementById('texto-cantidad');
    if (textoElemento) {
        textoElemento.textContent = mensaje;
        
        // Cambiar color según el tipo de mensaje
        if (mensaje.includes('Mínimo') || mensaje.includes('ocupados') || mensaje.includes('Máximo')) {
            textoElemento.style.color = "#ff6b35";
        } else {
            textoElemento.style.color = "#ffffff";
        }
    }
}

// Función para iniciar la partida - CONECTADA AL BACKEND
async function iniciarPartida() {
    console.log('🎮 Iniciando verificaciones para la partida...');
    
    // Verificar que todos los jugadores tengan nombre
    const inputs = document.querySelectorAll('.etiqueta-nombre input');
    let todosCompletos = true;
    
    inputs.forEach((input, index) => {
        if (input.value.trim().length < 3) {
            todosCompletos = false;
            input.style.borderColor = "#ff6b35";
        } else {
            input.style.borderColor = "#ccc";
        }
    });
    
    if (!todosCompletos) {
        actualizarTextoJugadores("Todos los jugadores deben tener nombre (mín. 3 caracteres)");
        return;
    }
    
    // Verificar que todos tengan avatar
    let todosConAvatar = true;
    
    for (let i = 1; i <= contadorJugadores; i++) {
        const avatarActual = obtenerAvatarActual(i);
        if (!avatarActual) {
            todosConAvatar = false;
            const elementoAvatar = document.querySelector(`[data-jugador="${i}"] .avatar-jugador`);
            if (elementoAvatar) {
                elementoAvatar.style.borderColor = "#ff6b35";
                elementoAvatar.style.borderWidth = "4px";
            }
        }
    }
    
    if (!todosConAvatar) {
        actualizarTextoJugadores("Todos los jugadores deben seleccionar un avatar");
        return;
    }
    
    // Recopilar datos de jugadores
    const jugadores = [];
    for (let i = 1; i <= contadorJugadores; i++) {
        const input = document.querySelector(`[data-jugador="${i}"] input`);
        const avatarPath = obtenerAvatarActual(i);
        
        if (input && avatarPath) {
            // Extraer solo el nombre del archivo del avatar
            const avatarName = avatarPath.split('/').pop().split('.')[0] + '.png';
            
            jugadores.push({
                Nombre: input.value.trim(),
                Avatar: avatarName
            });
        }
    }
    
    console.log('🎮 Datos de jugadores preparados:', jugadores);
    
    // Deshabilitar botón e indicar proceso
    const btnComenzar = document.querySelector('.btn-comenzar');
    if (btnComenzar) {
        btnComenzar.disabled = true;
        btnComenzar.textContent = 'CREANDO PARTIDA...';
    }
    
    try {
        actualizarTextoJugadores("🔗 Verificando conexión con el servidor...");
        
        // Verificar conexión con el backend
        const responseTest = await fetch(`${API_BASE}/partida`);
        if (!responseTest.ok) {
            throw new Error('No se puede conectar con el servidor');
        }
        
        actualizarTextoJugadores("✅ Servidor conectado, creando partida...");
        
        // Crear partida en el backend
        const crearPartidaDto = {
            Jugadores: jugadores
        };
        
        console.log('📤 Enviando datos al servidor:', crearPartidaDto);
        
        const response = await fetch(`${API_BASE}/partida/crear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(crearPartidaDto)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
        }
        
        const resultado = await response.json();
        console.log('✅ Partida creada exitosamente:', resultado);
        
        if (resultado && (resultado.partidaId || resultado.PartidaId)) {
            partidaActual = resultado.partidaId || resultado.PartidaId;
            codigoPartidaActual = resultado.codigo || resultado.Codigo;
            
            // Guardar datos de la partida en localStorage
            localStorage.setItem('partidaId', partidaActual.toString());
            localStorage.setItem('codigoPartida', codigoPartidaActual);
            localStorage.setItem('jugadoresPartida', JSON.stringify(jugadores));
            localStorage.setItem('modoOffline', 'false');
            
            actualizarTextoJugadores(`🎉 ¡Partida creada exitosamente!`);
            
            // Mostrar información de la partida
            const infoPartida = document.getElementById('info-partida');
            const codigoDisplay = document.getElementById('codigo-display');
            const idDisplay = document.getElementById('id-display');
            
            if (infoPartida && codigoDisplay && idDisplay) {
                codigoDisplay.textContent = codigoPartidaActual;
                idDisplay.textContent = partidaActual;
                infoPartida.style.display = 'block';
            }
            
            actualizarTextoJugadores(`📋 ID: ${partidaActual} | Código: ${codigoPartidaActual}`);
            
            // Esperar un momento para mostrar el mensaje y luego redirigir
            setTimeout(() => {
                actualizarTextoJugadores("🚀 Redirigiendo al juego...");
                window.location.href = "../html/Partida.html";
            }, 2000);
            
        } else {
            throw new Error('Respuesta del servidor inválida');
        }
        
    } catch (error) {
        console.error('❌ Error al crear partida:', error);
        actualizarTextoJugadores(`❌ Error: ${error.message}`);
        
        // Restaurar botón
        if (btnComenzar) {
            btnComenzar.disabled = false;
            btnComenzar.textContent = 'COMENZAR';
        }
        
        // Modo offline como respaldo
        setTimeout(() => {
            actualizarTextoJugadores("⚠️ Iniciando en modo offline...");
            localStorage.setItem('jugadoresPartida', JSON.stringify(jugadores));
            localStorage.setItem('modoOffline', 'true');
            
            setTimeout(() => {
                window.location.href = "../html/Partida.html";
            }, 1500);
        }, 3000);
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado - Inicializando sistema de jugadores');
    actualizarTextoJugadores(`Jugadores: ${contadorJugadores}`);
    
    // Asegurar que los botones de eliminar estén ocultos al inicio
    ocultarBotonesEliminar();
});
