       // Configuración de la API
const API_BASE_URL = 'http://localhost:7147/api';

// Función para ir a la pantalla de transición antes de volver a crear sala
function irTransmision() {
    // Guardamos la URL de destino en el almacenamiento local
    localStorage.setItem("urlDestino", "./Lobby.html");
    
    // Redirigimos a la página de transición
    window.location.href = '../html/Pantalla.html';
}

// Función para voltear carta
function voltearCarta(carta) {
    // Alternar la clase 'volteada' para activar la animación
    carta.classList.toggle('volteada');
    
    // Sonido opcional (opcional, puedes comentar esta línea si no quieres sonido)
    // const audio = new Audio('sonido-volteo.mp3');
    // audio.play().catch(e => console.log('No se pudo reproducir el sonido'));
}

// Función para obtener las cartas del backend
async function obtenerCartasDelBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/Carta`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const cartas = await response.json();
        return cartas;
    } catch (error) {
        console.error('Error al obtener cartas del backend:', error);
        return [];
    }
}

// Función para convertir array de bytes a base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Función para determinar la clase CSS según la rareza
function obtenerClaseCategoria(rareza) {
    if (!rareza) return 'azul';

    const rarezaLower = rareza.toLowerCase();
    if (rarezaLower === 'especial') {
        return 'dorada';
    } else if (rarezaLower === 'rara') {
        return 'rosa';
    } else {
        return 'azul'; // común u otro valor
    }
}

// Función para crear el HTML de una carta
function crearCartaHTML(carta) {
    const claseCategoria = obtenerClaseCategoria(carta.rareza);
    
    // Convertir imagen a base64 si existe
    let imagenSrc = '../img/foto/default-card.jpg'; // imagen por defecto
    if (carta.imagen && carta.imagen.length > 0) {
        const base64String = carta.imagen;
        imagenSrc = `data:image/jpeg;base64,${base64String}`;
    }

    return `
        <div class="carta" onclick="voltearCarta(this)">
            <div class="contenedor-carta">
                <!-- Lado frontal -->
                <div class="lado-frontal ${claseCategoria}">
                    <div class="encabezado-carta">
                        <div class="numero-carta">${carta.categoria || 'N/A'}</div>
                        <div class="nombre-carta">${carta.nombre}</div>
                    </div>
                    <div class="contenedor-imagen-personaje">
                        <img src="${imagenSrc}" alt="${carta.nombre}" class="imagen-personaje">
                    </div>
                    <div class="contenedor-estadisticas">
                        <div class="fila-estadistica">
                            <span class="etiqueta-estadistica">VIDA</span>
                            <span class="valor-estadistica">${carta.vida || 0}</span>
                        </div>
                        <div class="fila-estadistica">
                            <span class="etiqueta-estadistica">ATAQUE</span>
                            <span class="valor-estadistica">${carta.ataque || 0}</span>
                        </div>
                        <div class="fila-estadistica">
                            <span class="etiqueta-estadistica">PODER</span>
                            <span class="valor-estadistica">${carta.poder || 0}</span>
                        </div>
                        <div class="fila-estadistica">
                            <span class="etiqueta-estadistica">DEFENSA</span>
                            <span class="valor-estadistica">${carta.defensa || 0}</span>
                        </div>
                        <div class="fila-estadistica">
                            <span class="etiqueta-estadistica">VELOCIDAD</span>
                            <span class="valor-estadistica">${carta.velocidad || 0}</span>
                        </div>
                        <div class="fila-estadistica">
                            <span class="etiqueta-estadistica">TERROR</span>
                            <span class="valor-estadistica">${carta.terror || 0}</span>
                        </div>
                    </div>
                </div>
                <!-- Lado trasero -->
                <div class="lado-trasero">
                    <div class="logo-trasero"></div>
                    <div class="texto-trasero">TRADING CARDS</div>
                </div>
            </div>
        </div>
    `;
}

// Función para cargar y mostrar las cartas
async function cargarCartas() {
    const contenedorPrincipal = document.querySelector('.contenedor-principal');
    
    if (!contenedorPrincipal) {
        console.error('No se encontró el contenedor principal');
        return;
    }

    // Mostrar mensaje de carga
    contenedorPrincipal.innerHTML = '<div class="loading">Cargando cartas...</div>';

    try {
        const cartas = await obtenerCartasDelBackend();
        
        if (cartas.length === 0) {
            contenedorPrincipal.innerHTML = '<div class="no-cartas">No se encontraron cartas en el backend</div>';
            return;
        }

        // Ordenar cartas por rareza
        const ordenRareza = { 'especial': 1, 'rara': 2, 'comun': 3 };
        cartas.sort((a, b) => {
            const rarezaA = a.rareza ? a.rareza.toLowerCase() : 'comun';
            const rarezaB = b.rareza ? b.rareza.toLowerCase() : 'comun';
            const ordenA = ordenRareza[rarezaA] || 4;
            const ordenB = ordenRareza[rarezaB] || 4;
            return ordenA - ordenB;
        });

        // Limpiar contenedor y agregar cartas
        contenedorPrincipal.innerHTML = '';
        cartas.forEach(carta => {
            contenedorPrincipal.innerHTML += crearCartaHTML(carta);
        });

        console.log(`Se cargaron ${cartas.length} cartas desde el backend`);
        
    } catch (error) {
        console.error('Error al cargar las cartas:', error);
        contenedorPrincipal.innerHTML = '<div class="error">Error al cargar las cartas del backend</div>';
    }
}

// Función para insertar cartas desde JSON al backend
async function insertarCartasDesdeJSON() {
    try {
        const btnInsertar = document.getElementById('insertarCartas');
        if (btnInsertar) {
            btnInsertar.disabled = true;
            btnInsertar.textContent = 'Insertando...';
        }

        const response = await fetch(`${API_BASE_URL}/Carta/insertar-cartas-predefinidas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const resultado = await response.json();
        console.log('Resultado de inserción:', resultado);
        
        alert(`Operación completada: ${resultado.mensaje || 'Cartas insertadas correctamente'}`);
        
        // Recargar las cartas después de la inserción
        await cargarCartas();
        
    } catch (error) {
        console.error('Error al insertar cartas:', error);
        alert('Error al insertar cartas: ' + error.message);
    } finally {
        const btnInsertar = document.getElementById('insertarCartas');
        if (btnInsertar) {
            btnInsertar.disabled = false;
            btnInsertar.textContent = 'Insertar Cartas desde JSON';
        }
    }
}

// Cargar las cartas cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Configurar event listeners para los botones
    const btnInsertar = document.getElementById('insertarCartas');
    const btnRecargar = document.getElementById('recargarCartas');
    
    if (btnInsertar) {
        btnInsertar.addEventListener('click', insertarCartasDesdeJSON);
    }
    
    if (btnRecargar) {
        btnRecargar.addEventListener('click', cargarCartas);
    }
    
    // Cargar cartas al inicio
    cargarCartas();
});

// Opcional: Auto-voltear todas las cartas después de 3 segundos (para demostración)
// setTimeout(() => {
//     const todasLasCartas = document.querySelectorAll('.carta');
//     todasLasCartas.forEach(carta => {
//         carta.classList.add('volteada');
//     });
// }, 3000);
