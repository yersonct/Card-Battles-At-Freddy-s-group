
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