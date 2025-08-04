document.addEventListener("DOMContentLoaded", () => {
    const cuerpo = document.querySelector("body");
    const contenedorCompleto = document.querySelector(".container-completo");
    const tablaJugadores = document.querySelector(".container");
    let tiempo = 180; // 3 minutos en segundos
    const cronometro = document.getElementById("cronometro");
    
    // Variables para gestión de turnos
    let jugadores = ["T1", "T2", "T3", "T4", "T5", "T6", "T7"];
    let jugadorActual = 0;
    let rondaActual = 1;
    
    // Variables para el sistema de batalla
    let jugadasRonda = [];
    let atributoRonda = null;
    let cartasJuego = null;
    let victoriasJugadores = {};
    let maxRondas = 7; // Número total de rondas del juego
    
    // Inicializar victorias de jugadores
    jugadores.forEach(jugador => {
        victoriasJugadores[jugador] = 0;
    });

    const intervalo = setInterval(() => {
        const minutos = Math.floor(tiempo / 60);
        const segundos = tiempo % 60;

        cronometro.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

        if (tiempo <= 0) {
            clearInterval(intervalo);
            cronometro.textContent = "¡Tiempo!";
            cuerpo.style.backgroundImage = "url(../img/gif/pantalla-partida-v.gif)";
            contenedorCompleto.style.display = "none";
            cuerpo.style.overflowY = "auto";
            tablaJugadores.style.display = "block";

            setTimeout(() => {
                window.location.href = "../html/InicioDelJuego.html";
            }, 10000);
        }

        tiempo--;
    }, 1000);

    const cronometro2 = document.getElementById("cronometro-2");
    const cartas = document.querySelectorAll('.carta');
    const ContainerBottones = document.querySelector(".container-bottones");
    const noLanzar = document.querySelector('.no-tirar');
    const tirar = document.querySelector(".tirar");
    let intervalo2;

    cartas.forEach((carta) => {
        carta.addEventListener("click", (evento) => {
            cartas.forEach(c => c.classList.remove('seleccionada'));

            const cartaSeleccionada = evento.currentTarget;
            const idCarta = cartaSeleccionada.id;

            console.log("Carta presionada con ID:", idCarta);
            cartaSeleccionada.classList.add('seleccionada');
            
            // Mostrar selector de atributos en lugar de botones simples
            mostrarSelectoresAtributos();
            cronometro2.style.display = "block";

            iniciarCuentaRegresiva();
        });
    });

   tirar.addEventListener("click", () => {
    // Este botón ahora está deshabilitado, se usa el nuevo sistema de atributos
    console.log("Botón original deshabilitado - usar selector de atributos");
});


    noLanzar.addEventListener("click", () => {
        cartas.forEach(c => c.classList.remove('seleccionada'));
        ContainerBottones.style.display = "none";
        cronometro2.style.display = "none";
        clearInterval(intervalo2);
    });

    function iniciarCuentaRegresiva() {
        let tiempo2 = 10;

        clearInterval(intervalo2);
        cronometro2.style.color = "";
        cronometro2.style.background = "";
        cronometro2.style.textShadow = "";
        cronometro2.textContent = tiempo2;

        intervalo2 = setInterval(() => {
            if (tiempo2 >= 0) {
                cronometro2.textContent = tiempo2;
                tiempo2--;
            } else {
                clearInterval(intervalo2);
                cronometro2.textContent = "¡BOOM!";
                cronometro2.style.color = "white";
                cronometro2.style.background = "darkred";
                cronometro2.style.textShadow = "0 0 10px white";
            }
        }, 1000);
    }

    function voltearCarta(carta) {
        carta.classList.toggle('volteada');
        // Aquí podrías activar un sonido, si lo deseas
    }

    // Función para mostrar de quién es el turno
    function mostrarTurnoActual() {
        // Quitar resaltado de todos los jugadores
        const todosLosJugadores = document.querySelectorAll('.iconos-1, .iconos-2');
        todosLosJugadores.forEach(jugador => {
            jugador.classList.remove('turno-activo');
        });

        // Resaltar al jugador actual
        const h4Elements = document.querySelectorAll('h4');
        h4Elements.forEach(h4 => {
            if (h4.textContent.trim() === jugadores[jugadorActual]) {
                h4.closest('.iconos-1, .iconos-2').classList.add('turno-activo');
            }
        });

        // Crear o actualizar indicador de turno
        let indicadorTurno = document.querySelector('.indicador-turno');
        if (!indicadorTurno) {
            indicadorTurno = document.createElement('div');
            indicadorTurno.className = 'indicador-turno';
            document.querySelector('.contenedor-ronda').appendChild(indicadorTurno);
        }
        indicadorTurno.textContent = `Turno de: ${jugadores[jugadorActual]}`;
        indicadorTurno.style.display = 'block';
    }

    // Función para pasar al siguiente turno
    function siguienteTurno() {
        jugadorActual = (jugadorActual + 1) % jugadores.length;
        if (jugadorActual === 0) {
            rondaActual++;
            document.querySelector('.numero').textContent = rondaActual;
        }
        mostrarTurnoActual();
    }

    // Inicializar mostrando el primer turno
    mostrarTurnoActual();
    
    // Cargar cartas del JSON
    cargarCartasDelJuego();

    // Función para mostrar selectores de atributos
    function mostrarSelectoresAtributos() {
        // Ocultar botones originales
        ContainerBottones.style.display = "none";
        
        // Crear o mostrar contenedor de atributos
        let selectorAtributos = document.querySelector('.selector-atributos');
        if (!selectorAtributos) {
            selectorAtributos = document.createElement('div');
            selectorAtributos.className = 'selector-atributos';
            selectorAtributos.innerHTML = `
                <h3 class="titulo-atributos">Elige el atributo para la batalla:</h3>
                <div class="botones-atributos">
                    <button class="btn-atributo" data-atributo="VIDA">VIDA</button>
                    <button class="btn-atributo" data-atributo="ATAQUE">ATAQUE</button>
                    <button class="btn-atributo" data-atributo="DEFENSA">DEFENSA</button>
                    <button class="btn-atributo" data-atributo="VELOCIDAD">VELOCIDAD</button>
                    <button class="btn-atributo" data-atributo="PODER">PODER</button>
                    <button class="btn-atributo" data-atributo="TERROR">TERROR</button>
                </div>
                <div class="botones-accion">
                    <button class="tirar-nueva">Lanzar</button>
                    <button class="no-tirar-nueva">Cancelar</button>
                </div>
            `;
            document.body.appendChild(selectorAtributos);
            
            // Agregar eventos a los botones de atributos
            const botonesAtributo = selectorAtributos.querySelectorAll('.btn-atributo');
            botonesAtributo.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // Quitar selección anterior
                    botonesAtributo.forEach(b => b.classList.remove('seleccionado'));
                    // Agregar selección al botón actual
                    e.target.classList.add('seleccionado');
                    
                    // Habilitar botón de lanzar
                    document.querySelector('.tirar-nueva').disabled = false;
                });
            });
            
            // Eventos para botones de acción
            document.querySelector('.tirar-nueva').addEventListener('click', () => {
                const atributoSeleccionado = document.querySelector('.btn-atributo.seleccionado');
                if (atributoSeleccionado) {
                    const atributo = atributoSeleccionado.getAttribute('data-atributo');
                    lanzarCartaConAtributo(atributo);
                }
            });
            
            document.querySelector('.no-tirar-nueva').addEventListener('click', () => {
                ocultarSelectoresAtributos();
                cartas.forEach(c => c.classList.remove('seleccionada'));
                cronometro2.style.display = "none";
                clearInterval(intervalo2);
            });
        }
        
        selectorAtributos.style.display = "block";
        // Deshabilitar botón de lanzar hasta que se seleccione un atributo
        document.querySelector('.tirar-nueva').disabled = true;
    }

    // Función para ocultar selectores de atributos
    function ocultarSelectoresAtributos() {
        const selectorAtributos = document.querySelector('.selector-atributos');
        if (selectorAtributos) {
            selectorAtributos.style.display = "none";
        }
        // Limpiar selecciones
        const botonesAtributo = document.querySelectorAll('.btn-atributo');
        botonesAtributo.forEach(btn => btn.classList.remove('seleccionado'));
    }

    // Función para lanzar carta con atributo seleccionado
    function lanzarCartaConAtributo(atributo) {
        const cartaSeleccionada = document.querySelector('.carta.seleccionada');
        if (cartaSeleccionada) {
            const idCarta = cartaSeleccionada.id;
            const datosCarta = obtenerDatosCarta(idCarta);
            
            if (datosCarta) {
                // Guardar la jugada del jugador actual
                const jugada = {
                    jugador: jugadores[jugadorActual],
                    carta: datosCarta,
                    atributo: atributo,
                    valor: parseInt(datosCarta['etiqueta-estadistica'][0][atributo])
                };
                
                jugadasRonda.push(jugada);
                
                // Si es el primer jugador de la ronda, establecer el atributo
                if (atributoRonda === null) {
                    atributoRonda = atributo;
                }
                
                console.log(`${jugada.jugador} jugó ${datosCarta['nombre-carta']} con ${atributo}: ${jugada.valor}`);
            }
            
            cartaSeleccionada.classList.add("dejar");
            cartaSeleccionada.classList.remove("seleccionada", "volteada");
            
            // Mostrar qué atributo se seleccionó
            mostrarAtributoSeleccionado(atributo);
        }

        ocultarSelectoresAtributos();
        cronometro2.style.display = "none";
        clearInterval(intervalo2);
        
        // Verificar si todos los jugadores han jugado
        if (jugadasRonda.length === jugadores.length) {
            // Todos han jugado, comparar cartas
            setTimeout(() => {
                compararCartas();
            }, 2000);
        } else {
            // Pasar al siguiente turno
            setTimeout(() => {
                siguienteTurno();
            }, 2000);
        }
    }

    // Función para mostrar el atributo seleccionado
    function mostrarAtributoSeleccionado(atributo) {
        let notificacion = document.querySelector('.notificacion-atributo');
        if (!notificacion) {
            notificacion = document.createElement('div');
            notificacion.className = 'notificacion-atributo';
            document.body.appendChild(notificacion);
        }
        
        notificacion.textContent = `${jugadores[jugadorActual]} eligió: ${atributo}`;
        notificacion.style.display = 'block';
        
        setTimeout(() => {
            notificacion.style.display = 'none';
        }, 1500);
    }

    // Función para cargar cartas del JSON
    async function cargarCartasDelJuego() {
        try {
            const response = await fetch('../json/CartasCompletas.json');
            cartasJuego = await response.json();
            console.log('Cartas cargadas:', cartasJuego.length);
        } catch (error) {
            console.error('Error cargando cartas:', error);
        }
    }

    // Función para obtener datos de una carta por su ID
    function obtenerDatosCarta(idCarta) {
        if (!cartasJuego) return null;
        return cartasJuego.find(carta => carta['numero-carta'] === idCarta);
    }

    // Función para comparar las cartas de la ronda
    function compararCartas() {
        if (jugadasRonda.length === 0) return;
        
        // Encontrar el ganador (mayor valor en el atributo)
        let ganador = jugadasRonda[0];
        jugadasRonda.forEach(jugada => {
            if (jugada.valor > ganador.valor) {
                ganador = jugada;
            }
        });
        
        // Incrementar victorias del ganador
        victoriasJugadores[ganador.jugador]++;
        
        // Mostrar resultado de la comparación
        mostrarResultadoComparacion(ganador);
        
        // Verificar si es la última ronda
        if (rondaActual >= maxRondas) {
            // Mostrar ranking final después de un delay
            setTimeout(() => {
                mostrarRankingFinal();
            }, 6000);
        } else {
            // Limpiar para la siguiente ronda
            setTimeout(() => {
                jugadasRonda = [];
                atributoRonda = null;
                rondaActual++;
                document.querySelector('.numero').textContent = rondaActual;
                jugadorActual = 0; // Resetear al primer jugador
                mostrarTurnoActual();
            }, 5000);
        }
    }

    // Función para mostrar el resultado de la comparación
    function mostrarResultadoComparacion(ganador) {
        let modalResultado = document.querySelector('.modal-resultado');
        if (!modalResultado) {
            modalResultado = document.createElement('div');
            modalResultado.className = 'modal-resultado';
            document.body.appendChild(modalResultado);
        }
        
        let contenidoHTML = `
            <div class="contenido-resultado">
                <h2>¡Resultado de la Ronda!</h2>
                <div class="atributo-batalla">Atributo: ${atributoRonda}</div>
                <div class="comparacion-cartas">
        `;
        
        // Mostrar todas las jugadas ordenadas por valor
        const jugadasOrdenadas = [...jugadasRonda].sort((a, b) => b.valor - a.valor);
        jugadasOrdenadas.forEach((jugada, index) => {
            const esGanador = jugada.jugador === ganador.jugador;
            contenidoHTML += `
                <div class="carta-resultado ${esGanador ? 'ganadora' : ''}">
                    <h3>${jugada.jugador}</h3>
                    <p>${jugada.carta['nombre-carta']}</p>
                    <div class="valor-atributo">${jugada.atributo}: ${jugada.valor}</div>
                    ${esGanador ? '<div class="etiqueta-ganador">¡GANADOR!</div>' : ''}
                </div>
            `;
        });
        
        contenidoHTML += `
                </div>
                <button class="btn-continuar" onclick="cerrarModalResultado()">Continuar</button>
            </div>
        `;
        
        modalResultado.innerHTML = contenidoHTML;
        modalResultado.style.display = 'block';
    }

    // Función para mostrar el ranking final
    function mostrarRankingFinal() {
        let modalRanking = document.querySelector('.modal-ranking');
        if (!modalRanking) {
            modalRanking = document.createElement('div');
            modalRanking.className = 'modal-ranking';
            document.body.appendChild(modalRanking);
        }
        
        // Ordenar jugadores por número de victorias
        const rankingJugadores = Object.entries(victoriasJugadores)
            .sort(([,a], [,b]) => b - a)
            .map(([jugador, victorias], index) => ({
                posicion: index + 1,
                jugador,
                victorias
            }));
        
        let contenidoHTML = `
            <div class="contenido-ranking">
                <h1>🏆 RANKING FINAL 🏆</h1>
                <div class="podio-container">
        `;
        
        // Mostrar el podio (top 3)
        rankingJugadores.slice(0, 3).forEach((item, index) => {
            const medallas = ['🥇', '🥈', '🥉'];
            const clases = ['oro', 'plata', 'bronce'];
            contenidoHTML += `
                <div class="posicion-podio ${clases[index]}">
                    <div class="medalla">${medallas[index]}</div>
                    <div class="info-jugador">
                        <h2>${item.jugador}</h2>
                        <div class="victorias">${item.victorias} victorias</div>
                    </div>
                </div>
            `;
        });
        
        contenidoHTML += `
                </div>
                <div class="ranking-completo">
                    <h3>Clasificación Completa:</h3>
                    <table class="tabla-ranking">
                        <thead>
                            <tr>
                                <th>Posición</th>
                                <th>Jugador</th>
                                <th>Victorias</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // Mostrar toda la tabla de ranking
        rankingJugadores.forEach(item => {
            contenidoHTML += `
                <tr class="${item.posicion <= 3 ? 'top-three' : ''}">
                    <td>${item.posicion}</td>
                    <td>${item.jugador}</td>
                    <td>${item.victorias}</td>
                </tr>
            `;
        });
        
        contenidoHTML += `
                        </tbody>
                    </table>
                </div>
                <div class="botones-finales">
                    <button class="btn-nueva-partida" onclick="nuevaPartida()">Nueva Partida</button>
                    <button class="btn-menu-principal" onclick="volverMenu()">Menú Principal</button>
                </div>
            </div>
        `;
        
        modalRanking.innerHTML = contenidoHTML;
        modalRanking.style.display = 'block';
        
        // Animación de confetti o celebración
        celebrarFinDelJuego();
    }

    // Función para celebrar el fin del juego
    function celebrarFinDelJuego() {
        // Cambiar el fondo temporalmente
        document.body.style.backgroundImage = "url(../img/gif/pantalla-partida-v.gif)";
        
        // Reproducir sonido de celebración si está disponible
        console.log("🎉 ¡Juego terminado! 🎉");
        
        setTimeout(() => {
            document.body.style.backgroundImage = "url(../img/foto/0008.webp)";
        }, 3000);
    }
});

// Función global para cerrar modal de resultado
window.cerrarModalResultado = function() {
    const modalResultado = document.querySelector('.modal-resultado');
    if (modalResultado) {
        modalResultado.style.display = 'none';
    }
}

// Función global para nueva partida
window.nuevaPartida = function() {
    location.reload(); // Recargar la página para empezar de nuevo
}

// Función global para volver al menú principal
window.volverMenu = function() {
    // Usar irTransmision para volver al menú
    if (typeof irTransmision === 'function') {
        irTransmision('../html/CrearSala.html');
    } else {
        window.location.href = '../html/CrearSala.html';
    }
}
