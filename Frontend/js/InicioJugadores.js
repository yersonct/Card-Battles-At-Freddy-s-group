const bottomAgragarJugador = document.querySelector('.caja-contenedor-mas');
const ContenedorDeJugadorCreados = document.querySelector('.jugadores');
const textoMensaje = document.querySelector('.Text-Cantidad');

// Servicios de API
let partidaService = null;
let jugadorService = null;
let cartaJugadorService = null;
let cartaService = null;
let partidaActual = null;

// Avatares disponibles para FNAF
const avatarsDisponibles = [
    'freddy_fazbear',
    'bonnie_bunny', 
    'chica_chicken',
    'foxy_pirate',
    'golden_freddy',
    'puppet_marionette',
    'springtrap',
    'nightmare_freddy',
    'circus_baby'
];

// Estado de la inicialización
let serviciosListos = false;

// Esperar a que los servicios estén listos
document.addEventListener('serviciosApiListos', (evento) => {
    console.log('✅ Servicios de API listos para InicioJugadores');
    
    try {
        partidaService = window.partidaService;
        jugadorService = window.jugadorService;
        cartaJugadorService = window.cartaJugadorService;
        cartaService = window.cartaService;
        
        if (partidaService && jugadorService && cartaJugadorService) {
            serviciosListos = true;
            textoMensaje.textContent = "✅ Servicios listos - Agregue jugadores para iniciar";
            textoMensaje.style.color = "#00ff00";
            console.log('🎮 Todos los servicios necesarios están disponibles');
        } else {
            throw new Error('Algunos servicios no están disponibles');
        }
    } catch (error) {
        console.error('❌ Error al inicializar servicios en InicioJugadores:', error);
        textoMensaje.textContent = "❌ Error al cargar servicios - Recargue la página";
        textoMensaje.style.color = "#ff0000";
    }
});

// Error en servicios
document.addEventListener('errorInicializacionApi', (evento) => {
    console.error('❌ Error en inicialización de servicios API:', evento.detail.error);
    textoMensaje.textContent = "❌ Error de conexión - Verifique el backend";
    textoMensaje.style.color = "#ff0000";
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
    if (!serviciosListos || !partidaService || !jugadorService || !cartaJugadorService) {
        textoMensaje.textContent = "❌ Error: Servicios no disponibles - Espere un momento";
        textoMensaje.style.color = "red";
        return;
    }

    const InputTotal = document.querySelectorAll("input[data-jugador]");
    let todosLlenos = true;
    const jugadoresData = [];

    // Validar que todos los campos estén llenos y recopilar datos
    InputTotal.forEach((input, index) => {
        if (input.value.trim() === '') {
            todosLlenos = false;
        } else {
            const jugadorIndex = parseInt(input.dataset.jugador);
            const imagenContainer = document.querySelector(`#imagen-${jugadorIndex}`);
            const avatar = imagenContainer?.dataset.avatar || avatarsDisponibles[index % avatarsDisponibles.length];
            
            jugadoresData.push({
                nombre: input.value.trim(),
                avatar: avatar,
                posicion: index + 1
            });
        }
    });

    // Validaciones
    if (!todosLlenos) {
        textoMensaje.style.color = "yellow";
        textoMensaje.style.textShadow = '0px 0px 10px yellow';
        textoMensaje.textContent = `⚠️ Cada jugador debe tener un nombre`;
        return;
    }

    if (jugadoresData.length < 2) {
        textoMensaje.textContent = "⚠️ Se necesitan al menos 2 jugadores";
        textoMensaje.style.color = "orange";
        return;
    }

    // Deshabilitar botón durante el proceso
    const btnIniciar = document.querySelector('.btn-iniciar');
    const textoOriginalBtn = btnIniciar.textContent;
    btnIniciar.disabled = true;
    btnIniciar.textContent = "Creando partida...";
    btnIniciar.style.opacity = "0.6";

    try {
        // 1. Crear la partida
        textoMensaje.textContent = "🎮 Creando partida...";
        textoMensaje.style.color = "#00ffff";

        const nombrePartida = `Partida FNAF ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        partidaActual = await partidaService.crearPartida(nombrePartida, jugadoresData.length);
        
        console.log('✅ Partida creada:', partidaActual);

        // 2. Registrar jugadores en la partida
        textoMensaje.textContent = "👥 Registrando jugadores...";
        btnIniciar.textContent = "Registrando jugadores...";

        const jugadoresCreados = await jugadorService.añadirJugadoresASala(jugadoresData, partidaActual.id);
        
        console.log('✅ Jugadores registrados:', jugadoresCreados);
        
        // 3. Asignar cartas iniciales a cada jugador
        textoMensaje.textContent = "🎴 Asignando cartas a los jugadores...";
        btnIniciar.textContent = "Asignando cartas...";
        
        const resultadosCartas = [];
        for (let i = 0; i < jugadoresCreados.length; i++) {
            const jugador = jugadoresCreados[i];
            try {
                textoMensaje.textContent = `🎴 Asignando cartas a ${jugador.nombre}... (${i + 1}/${jugadoresCreados.length})`;
                
                const cartasAsignadas = await cartaJugadorService.asignarCartasIniciales(jugador.id, 5);
                resultadosCartas.push({
                    jugador: jugador,
                    cartas: cartasAsignadas
                });
                
                console.log(`✅ ${cartasAsignadas.length} cartas asignadas a ${jugador.nombre}`);
            } catch (cardError) {
                console.error(`❌ Error al asignar cartas a ${jugador.nombre}:`, cardError);
                textoMensaje.textContent = `❌ Error al asignar cartas a ${jugador.nombre}: ${cardError.message}`;
                textoMensaje.style.color = "red";
                
                // Revertir cambios si es posible
                await revertirCreacionPartida(partidaActual.id);
                return;
            }
        }
        
        console.log('✅ Cartas asignadas a todos los jugadores:', resultadosCartas);
        
        // 4. Guardar información en sessionStorage para la siguiente pantalla
        const datosPartida = {
            partida: partidaActual,
            jugadores: jugadoresCreados,
            cartasAsignadas: resultadosCartas,
            fechaCreacion: new Date().toISOString()
        };
        
        sessionStorage.setItem('partidaActual', JSON.stringify(datosPartida));
        
        // 5. Mostrar éxito y redirigir
        textoMensaje.textContent = `🎉 ¡Partida creada exitosamente! ID: ${partidaActual.id}`;
        textoMensaje.style.color = "#00ff00";
        textoMensaje.style.textShadow = '0px 0px 15px #00ff00';
        
        btnIniciar.textContent = "¡Iniciando juego!";
        btnIniciar.style.background = "#00ff00";
        btnIniciar.style.color = "#000";
        
        // Mostrar resumen de cartas asignadas
        console.log('📊 Resumen de cartas asignadas:');
        resultadosCartas.forEach(resultado => {
            console.log(`🎮 ${resultado.jugador.nombre} (${resultado.jugador.avatar}): ${resultado.cartas.length} cartas`);
        });
        
        // Redirigir después de un breve delay
        setTimeout(() => {
            window.location.href = "../html/Pantalla.html";
        }, 2500);
        
    } catch (error) {
        console.error('❌ Error al crear partida:', error);
        textoMensaje.textContent = `❌ Error: ${error.message || 'Error desconocido'}`;
        textoMensaje.style.color = "red";
        textoMensaje.style.textShadow = '0px 0px 10px red';
        
        // Restaurar botón
        btnIniciar.disabled = false;
        btnIniciar.textContent = textoOriginalBtn;
        btnIniciar.style.opacity = "1";
        btnIniciar.style.background = "";
        btnIniciar.style.color = "";
    }
}

/**
 * Función auxiliar para revertir la creación de una partida en caso de error
 */
async function revertirCreacionPartida(partidaId) {
    try {
        console.log(`🔄 Revirtiendo creación de partida ${partidaId}...`);
        await partidaService.delete(partidaId);
        console.log('✅ Partida revertida exitosamente');
    } catch (revertError) {
        console.error('❌ Error al revertir partida:', revertError);
    }
}

function ponerAvatar(jugadorIndex) {
    // Información detallada de los avatares FNAF
    const avatarInfo = {
        'freddy_fazbear': { nombre: 'Freddy Fazbear', color: '#8B4513', emoji: '🐻' },
        'bonnie_bunny': { nombre: 'Bonnie the Bunny', color: '#4169E1', emoji: '🐰' },
        'chica_chicken': { nombre: 'Chica the Chicken', color: '#FFD700', emoji: '🐥' },
        'foxy_pirate': { nombre: 'Foxy the Pirate', color: '#DC143C', emoji: '🦊' },
        'golden_freddy': { nombre: 'Golden Freddy', color: '#FFD700', emoji: '👑' },
        'puppet_marionette': { nombre: 'The Puppet', color: '#2F4F4F', emoji: '🎭' },
        'springtrap': { nombre: 'Springtrap', color: '#556B2F', emoji: '🟫' },
        'nightmare_freddy': { nombre: 'Nightmare Freddy', color: '#800080', emoji: '👹' },
        'circus_baby': { nombre: 'Circus Baby', color: '#FF69B4', emoji: '🤡' }
    };
    
    // Crear modal para seleccionar avatar
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-in-out;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        padding: 30px;
        border-radius: 15px;
        border: 3px solid #ffd700;
        text-align: center;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
    `;
    
    modalContent.innerHTML = `
        <h3 style="color: #ffd700; margin-bottom: 25px; font-family: 'Creepster', cursive; font-size: 24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
            👤 Selecciona tu Avatar FNAF
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
            ${Object.entries(avatarInfo).map(([key, info]) => `
                <div onclick="seleccionarAvatar('${key}', ${jugadorIndex})" 
                     class="avatar-option"
                     style="
                        padding: 15px; 
                        border: 2px solid #444; 
                        border-radius: 10px; 
                        cursor: pointer; 
                        background: linear-gradient(145deg, #333, #222);
                        color: white; 
                        text-align: center;
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                     "
                     onmouseover="this.style.borderColor='${info.color}'; this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 15px ${info.color}40';" 
                     onmouseout="this.style.borderColor='#444'; this.style.transform='scale(1)'; this.style.boxShadow='none';">
                    <div style="font-size: 40px; margin-bottom: 8px;">${info.emoji}</div>
                    <div style="font-size: 14px; font-weight: bold; color: ${info.color};">${info.nombre}</div>
                    <div style="font-size: 11px; color: #aaa; margin-top: 5px;">${key.replace('_', ' ')}</div>
                </div>
            `).join('')}
        </div>
        <button onclick="cerrarModal()" 
                style="
                    background: linear-gradient(145deg, #ff6b35, #ff4500); 
                    color: white; 
                    border: none; 
                    padding: 12px 25px; 
                    border-radius: 8px; 
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                "
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.4)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.3)';">
            ❌ Cancelar
        </button>
    `;
    
    // Añadir estilos CSS para animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .avatar-option:active {
            transform: scale(0.95) !important;
        }
    `;
    document.head.appendChild(style);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Función global para cerrar modal
    window.cerrarModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease-in-out';
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 300);
        delete window.cerrarModal;
        delete window.seleccionarAvatar;
    };
    
    // Función global para seleccionar avatar
    window.seleccionarAvatar = (avatar, jugadorIndex) => {
        const imagenContainer = document.querySelector(`#imagen-${jugadorIndex}`);
        const info = avatarInfo[avatar];
        
        if (imagenContainer && info) {
            imagenContainer.innerHTML = `
                <div style="
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    justify-content: center;
                    height: 100%;
                    background: linear-gradient(145deg, ${info.color}20, ${info.color}10);
                    border-radius: 8px;
                    border: 2px solid ${info.color};
                    padding: 5px;
                ">
                    <div style="font-size: 24px; margin-bottom: 5px;">${info.emoji}</div>
                    <div style="font-size: 10px; color: ${info.color}; font-weight: bold; text-align: center; line-height: 1.1;">
                        ${info.nombre.split(' ').join('<br>')}
                    </div>
                </div>
            `;
            imagenContainer.dataset.avatar = avatar;
            
            // Feedback visual para el usuario
            imagenContainer.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                imagenContainer.style.animation = '';
            }, 600);
        }
        
        cerrarModal();
    };
    
    // Cerrar modal al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            cerrarModal();
        }
    });
    
    // Añadir animación pulse
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
    `;
    document.head.appendChild(pulseStyle);
}