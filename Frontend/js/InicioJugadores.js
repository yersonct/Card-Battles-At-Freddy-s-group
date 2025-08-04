
        // Variables globales para el sistema de jugadores
        let contadorJugadores = 2; // Empezamos con 2 jugadores
        let maxJugadores = 7; // Máximo de 7 jugadores permitidos

        // Array con todas las opciones de avatares disponibles
        // IMPORTANTE: Cambia estas rutas por las de tus imágenes reales
        const opcionesAvatares = [
            '../img/foto/1.jpg',      // Freddy (dorado)
            '../img/foto/2.jpg',      // Bonnie (azul/morado)
            '../img/foto/3.jpg',       // Chica (amarillo)
            '../img/foto/4.jpg',        // Foxy (rojo)
            '../img/foto/golden-freddy.png', // Balloon Boy (naranja)
            '../img/foto/ballons.jpg',    // Withered (marrón)
            '../img/foto/nomeacuerdo.jpg'   // Springtrap (verde/dorado)
        ];

        // Objeto para rastrear el índice actual de avatar de cada jugador
        let indicesAvatares = {};

        // Array para rastrear qué avatares están siendo usados
        let avatarsUsados = [];

        // Función para cambiar avatar al hacer clic directo
        function cambiarAvatar(numeroJugador) {
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
                    // Volver al avatar que tenía antes o dejarlo sin avatar
                    if (avatarActual) {
                        avatarsUsados.push(avatarActual);
                    }
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
            elementoAvatar.style.backgroundImage = `url('${nuevoAvatar}')`;

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
            if (contadorJugadores >= maxJugadores) {
                actualizarTextoJugadores("Máximo 7 jugadores alcanzado");
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
            
            // Actualizar contador
            actualizarTextoJugadores(`Jugadores: ${contadorJugadores}`);

            // Mostrar botones de eliminar para todos excepto los primeros 2
            mostrarBotonesEliminar();

            // Ocultar botón de agregar si llegamos al máximo
            if (contadorJugadores >= maxJugadores) {
                botonAgregar.style.display = 'none';
            }
        }

        // Función para eliminar un jugador
        function eliminarJugador(boton) {
            const cajaJugador = boton.closest('.caja-jugador');
            const numeroJugador = parseInt(cajaJugador.dataset.jugador);
            
            // No permitir eliminar si solo hay 2 jugadores
            if (contadorJugadores <= 2) {
                actualizarTextoJugadores("Mínimo 2 jugadores requeridos");
                return;
            }
            
            // Liberar avatar usado si tenía uno
            const avatarActual = obtenerAvatarActual(numeroJugador);
            if (avatarActual) {
                const indice = avatarsUsados.indexOf(avatarActual);
                if (indice > -1) {
                    avatarsUsados.splice(indice, 1);
                }
            }

            // Limpiar datos del jugador
            delete indicesAvatares[numeroJugador];
            
            // Eliminar el jugador
            cajaJugador.remove();
            contadorJugadores--;
            
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
                if (index >= 2) { // Solo mostrar para jugadores 3 en adelante
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
            textoElemento.textContent = mensaje;
            
            // Cambiar color según el tipo de mensaje
            if (mensaje.includes('Mínimo') || mensaje.includes('ocupados')) {
                textoElemento.style.color = '#f44336';
                textoElemento.style.textShadow = '0px 0px 10px #f44336';
            } else if (mensaje.includes('nombre') || mensaje.includes('avatar')) {
                textoElemento.style.color = '#ff9800';
                textoElemento.style.textShadow = '0px 0px 10px #ff9800';
            } else {
                textoElemento.style.color = '#ffffff';
                textoElemento.style.textShadow = '0px 0px 10px #ffffff';
            }
        }

        // Función para iniciar la partida
        function iniciarPartida() {
            // Verificar que todos los jugadores tengan nombre
            const inputs = document.querySelectorAll('.etiqueta-nombre input');
            let todosCompletos = true;
            
            inputs.forEach(input => {
                if (input.value.trim() === '') {
                    todosCompletos = false;
                }
            });
            
            if (!todosCompletos) {
                actualizarTextoJugadores('Todos los jugadores deben tener nombre');
                return;
            }
            
            // Verificar que todos tengan avatar
            let todosConAvatar = true;
            
            for (let i = 1; i <= contadorJugadores; i++) {
                if (!obtenerAvatarActual(i)) {
                    todosConAvatar = false;
                    break;
                }
            }
            
            if (!todosConAvatar) {
                actualizarTextoJugadores('Todos los jugadores deben seleccionar un avatar');
                return;
            }
            
            // Todo está correcto, iniciar partida
            console.log('Iniciando partida...');
            window.location.href = "../html/Pantalla.html";
        }

        // Función para agregar jugadores automáticamente haciendo clic en el área vacía
        // (Esta función se mantiene por compatibilidad pero ya no es necesaria)
        
        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            actualizarTextoJugadores(`Jugadores: ${contadorJugadores}`);
        });
// Servicios de API
let partidaService = null;
let jugadorService = null;
let cartaJugadorService = null;
let partidaActual = null;

// Avatares disponibles para FNAF
const avatarsDisponibles = [
    'freddy_fazbear',
    'bonnie_bunny', 
    'chica_chicken',
    'foxy_pirate',
    'golden_freddy',
    'puppet_marionette'
];

// Esperar a que los servicios estén listos
window.addEventListener('serviciosApiListos', () => {
    console.log('✅ Servicios de API listos');
    partidaService = window.partidaService;
    jugadorService = window.jugadorService;
    cartaJugadorService = window.cartaJugadorService;
    
    textoMensaje.textContent = "Servicios listos - Agregue jugadores";
    textoMensaje.style.color = "#00ff00";
});

function PonerCamposUsuario() {
    const cantidadHijos = ContenedorDeJugadorCreados.children.length;

    if (cantidadHijos < 6) {
        const cajas_usuario = `
            <div class='caja-jugadores' id='caja-${cantidadHijos + 1}'>
               <div class="Cancelar" id="Cancelar-${cantidadHijos + 1}" onclick="eliminarJugador(this)"><b>X</b></div>
                <div class="PonerAvatar" onclick="ponerAvatar(${cantidadHijos + 1})">+</div>
                <div class='caja-imagen' id='imagen-${cantidadHijos + 1}'></div>
                <div class='caja-nombre'>
                    <input type='text' placeholder='Nombre' required maxlength="10" minlength="3" data-jugador="${cantidadHijos + 1}">
                </div>
            </div>`;
        ContenedorDeJugadorCreados.insertAdjacentHTML('beforeend', cajas_usuario);
        textoMensaje.textContent = `Jugadores: ${cantidadHijos + 1}`;
        textoMensaje.style.color = "#ffffff";
    } else {
        textoMensaje.textContent = "Máximo 6 jugadores";
        textoMensaje.style.color = "yellow";
        bottomAgragarJugador.style.display = 'none';
    }
}

bottomAgragarJugador.addEventListener('click', PonerCamposUsuario);

function eliminarJugador(boton) {
    const contenedor = boton.closest('.caja-jugadores');
    if (contenedor) {
        const cantidadHijos = ContenedorDeJugadorCreados.children.length;
        
        if (cantidadHijos <= 2) {
            textoMensaje.textContent = `Mínimo 2 jugadores requeridos`;
            textoMensaje.style.color = "orange";
        } else {
            contenedor.remove();
            bottomAgragarJugador.style.display = 'flex';
            textoMensaje.textContent = `Jugadores: ${cantidadHijos - 1}`;
            textoMensaje.style.color = "#ffffff";
        }
    }
}

async function IniciarPartidad() {
    // Verificar que los servicios estén disponibles
    if (!partidaService || !jugadorService || !cartaJugadorService) {
        textoMensaje.textContent = "Error: Servicios no disponibles";
        textoMensaje.style.color = "red";
        return;
    }

    const InputTotal = document.querySelectorAll("input");
    let todosLlenos = true;
    const jugadoresData = [];

    // Validar que todos los campos estén llenos
    InputTotal.forEach((input, index) => {
        if (input.value.trim() === '') {
            todosLlenos = false;
        } else {
            // Recopilar datos del jugador
            const jugadorIndex = parseInt(input.dataset.jugador);
            const avatar = document.querySelector(`#imagen-${jugadorIndex}`)?.dataset.avatar || avatarsDisponibles[index % avatarsDisponibles.length];
            
            jugadoresData.push({
                nombre: input.value.trim(),
                avatar: avatar,
                posicion: index + 1
            });
        }
    });

    if (!todosLlenos) {
        textoMensaje.style.color = "yellow";
        textoMensaje.style.textShadow = '0px 0px 10px yellow';
        textoMensaje.textContent = `Cada jugador debe tener un nombre`;
        return;
    }

    if (jugadoresData.length < 2) {
        textoMensaje.textContent = "Se necesitan al menos 2 jugadores";
        textoMensaje.style.color = "orange";
        return;
    }

    try {
        // 1. Crear la partida
        textoMensaje.textContent = "Creando partida...";
        textoMensaje.style.color = "#00ffff";

        const nombrePartida = `Partida FNAF ${Date.now()}`;
        partidaActual = await partidaService.crearPartida(nombrePartida, jugadoresData.length);
        
        console.log('✅ Partida creada:', partidaActual);

        // 2. Registrar jugadores en la partida
        textoMensaje.textContent = "Registrando jugadores...";
        textoMensaje.style.color = "#00ffff";

        const jugadoresCreados = await jugadorService.añadirJugadoresASala(jugadoresData, partidaActual.id);
        
        console.log('✅ Jugadores registrados:', jugadoresCreados);
        
        // 3. Asignar cartas iniciales a cada jugador
        textoMensaje.textContent = "Asignando cartas a los jugadores...";
        textoMensaje.style.color = "#ffff00";
        
        for (const jugador of jugadoresCreados) {
            try {
                await cartaJugadorService.asignarCartasIniciales(jugador.id);
                console.log(`✅ Cartas asignadas al jugador ${jugador.nombre}`);
            } catch (cardError) {
                console.error(`❌ Error al asignar cartas al jugador ${jugador.nombre}:`, cardError);
                textoMensaje.textContent = `Error al asignar cartas al jugador ${jugador.nombre}`;
                textoMensaje.style.color = "red";
                return;
            }
        }
        
        console.log('✅ Cartas asignadas a todos los jugadores');
        
        // 4. Guardar información en sessionStorage para la siguiente pantalla
        sessionStorage.setItem('partidaActual', JSON.stringify(partidaActual));
        sessionStorage.setItem('jugadoresCreados', JSON.stringify(jugadoresCreados));
        
        textoMensaje.textContent = `¡Partida creada! Jugadores registrados y cartas asignadas. ID: ${partidaActual.id} - Iniciando...`;
        textoMensaje.style.color = "#00ff00";
        
        // 5. Redirigir después de un breve delay
        setTimeout(() => {
            window.location.href = "../html/Pantalla.html";
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error al crear partida:', error);
        textoMensaje.textContent = `Error: ${error.message}`;
        textoMensaje.style.color = "red";
    }
}

function ponerAvatar(jugadorIndex) {
    // Crear modal para seleccionar avatar
    const modal = document.createElement('div');
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
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #1a1a2e;
        padding: 20px;
        border-radius: 10px;
        border: 2px solid #ffd700;
        text-align: center;
        max-width: 500px;
    `;
    
    modalContent.innerHTML = `
        <h3 style="color: #ffd700; margin-bottom: 20px;">Selecciona tu Avatar FNAF</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
            ${avatarsDisponibles.map(avatar => `
                <div onclick="seleccionarAvatar('${avatar}', ${jugadorIndex})" 
                     style="padding: 10px; border: 2px solid #444; border-radius: 5px; cursor: pointer; background: #333; color: white; text-transform: capitalize;"
                     onmouseover="this.style.borderColor='#ffd700'" 
                     onmouseout="this.style.borderColor='#444'">
                    ${avatar.replace('_', ' ')}
                </div>
            `).join('')}
        </div>
        <button onclick="cerrarModal()" style="background: #ff6b35; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
            Cancelar
        </button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Función global para cerrar modal
    window.cerrarModal = () => {
        document.body.removeChild(modal);
        delete window.cerrarModal;
        delete window.seleccionarAvatar;
    };
    
    // Función global para seleccionar avatar
    window.seleccionarAvatar = (avatar, jugadorIndex) => {
        const imagenContainer = document.querySelector(`#imagen-${jugadorIndex}`);
        if (imagenContainer) {
            imagenContainer.textContent = avatar.replace('_', ' ');
            imagenContainer.style.background = '#444';
            imagenContainer.style.color = '#ffd700';
            imagenContainer.style.padding = '10px';
            imagenContainer.style.borderRadius = '5px';
            imagenContainer.style.fontSize = '12px';
            imagenContainer.dataset.avatar = avatar;
        }
        cerrarModal();
    };
}
