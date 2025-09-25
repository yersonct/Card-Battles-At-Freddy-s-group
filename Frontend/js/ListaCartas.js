       // Configuración de la API
const API_BASE_URL = 'http://localhost:7147/api';
const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');

// Función para ir a la pantalla de transición antes de volver a crear sala
function irTransmision() {
    // Guardamos la URL de destino en el almacenamiento local
    localStorage.setItem("urlDestino", "./Lobby.html");
    
    // Redirigimos a la página de transición
    window.location.href = '../html/Pantalla.html';
}
window.onload = function() {
  const audio = document.getElementById("miAudio");
  audio.play();
};

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
    
    // La API envía la imagen como una cadena Base64.
    // Si no hay imagen, usamos una por defecto.
    let imagenSrc = '/Frontend/img/foto/default-card.jpg'; // Ruta a una imagen por defecto

    if (carta.imagen) {
        // Construimos un Data URL para la imagen a partir de la cadena Base64.
        imagenSrc = `data:image/jpeg;base64,${carta.imagen}`;
    }

    // NOTA: Plantilla definitiva que respeta la estructura visual y funcional que tu CSS espera para una correcta visualización y animación.
    return `
        <div class="carta-container">
            <div class="carta" onclick="this.classList.toggle('volteada')">
                
                <!-- LADO FRONTAL DE LA CARTA -->
                <div class="lado lado-frontal ${claseCategoria}">

                    <!-- Título -->
                    <div class="nombre-carta">${carta.nombre || 'Personaje Desconocido'}</div>

                    <!-- Imagen -->
                    <img src="${imagenSrc}" alt="${carta.nombre}" class="imagen-personaje" onerror="this.onerror=null; this.src='/Frontend/img/foto/default-card.jpg';">

                    <!-- Descripción y Tipo/Rareza -->
                    <div class="descripcion-carta">
                        <p class="tipo-rareza"><strong>${carta.categoria || 'N/A'}</strong> &mdash; <em>${carta.rareza || 'Común'}</em></p>
                        <p class="texto-habilidad">${carta.descripcion || 'Esta carta no tiene una descripción.'}</p>
                    </div>

                    <!-- Estadísticas -->
                    <div class="contenedor-estadisticas">
                        <div class="fila-estadistica"><span>Ataque</span> <strong>${carta.ataque || 0}</strong></div>
                        <div class="fila-estadistica"><span>Defensa</span> <strong>${carta.defensa || 0}</strong></div>
                        <div class="fila-estadistica"><span>Velocidad</span> <strong>${carta.velocidad || 0}</strong></div>
                        <div class="fila-estadistica"><span>Ataque</span> <strong>${carta.ataque || 0}</strong></div>
                        <div class="fila-estadistica"><span>Poder</span> <strong>${carta.poder || 0}</strong></div>
                        <div class="fila-estadistica"><span>Terror</span> <strong>${carta.terror || 0}</strong></div>
                    </div>

                </div>

                <!-- LADO TRASERO DE LA CARTA -->
                <div class="lado lado-trasero">
                    <img src="/Frontend/img/foto/cartas-L.png" alt="Logo del Juego" class="imagen-reverso">
                    <h3 class="titulo-reverso">Card Battles at Freddy's</h3>
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

        // Generar todo el HTML de las cartas de una sola vez para mayor rendimiento
        const cartasHTML = cartas.map(crearCartaHTML).join('');

        // Actualizar el DOM una sola vez para evitar parpadeos
        contenedorPrincipal.innerHTML = cartasHTML;
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
