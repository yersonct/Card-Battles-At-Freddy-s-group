/**
 * Script para generar cartas dinámicamente y evitar redundancia en HTML
 * Card Battles At Freddy's - Generador de Cartas
 */

class GeneradorCartas {
    constructor() {
        this.totalCartas = 8;
        this.cartasData = null;
        this.contenedorCartas = null;
        this.init();
    }

    async init() {
        try {
            await this.cargarDatosCartas();
            this.setupContenedor();
            this.generarCartas();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error inicializando generador de cartas:', error);
            this.generarCartasConDatosPorDefecto();
        }
    }

    async cargarDatosCartas() {
        try {
            // Intentar cargar datos del JSON si existe
            const response = await fetch('../json/CartasCompletas.json');
            if (response.ok) {
                this.cartasData = await response.json();
                console.log('Datos de cartas cargados exitosamente');
            } else {
                throw new Error('No se pudo cargar el archivo JSON');
            }
        } catch (error) {
            console.warn('Usando datos por defecto:', error.message);
            this.cartasData = this.generarDatosPorDefecto();
        }
    }

    setupContenedor() {
        this.contenedorCartas = document.querySelector('.contenedor-cartas-completo');
        if (!this.contenedorCartas) {
            console.error('No se encontró el contenedor de cartas');
            return;
        }
        
        // Limpiar contenedor existente
        this.contenedorCartas.innerHTML = '';
    }

    generarCartas() {
        if (!this.contenedorCartas) return;

        for (let i = 1; i <= this.totalCartas; i++) {
            const carta = this.crearCarta(i);
            this.contenedorCartas.appendChild(carta);
        }

        console.log(`${this.totalCartas} cartas generadas exitosamente`);
    }

    crearCarta(index) {
        // Obtener datos de la carta (del JSON o por defecto)
        const datoCarta = this.obtenerDatosCarta(index);
        
        // Crear elemento carta
        const cartaDiv = document.createElement('div');
        cartaDiv.className = 'carta';
        cartaDiv.id = `carta-${index}`;
        cartaDiv.setAttribute('onclick', 'voltearCarta(this)');
        cartaDiv.setAttribute('data-carta-index', index);

        // Generar HTML interno
        cartaDiv.innerHTML = this.generarHTMLCarta(datoCarta);

        return cartaDiv;
    }

    generarHTMLCarta(datos) {
        return `
            <div class="contenedor-carta">
                <!-- Lado frontal -->
                <div class="lado-frontal ${datos.claseCategoria}">
                    <div class="encabezado-carta">
                        <div class="numero-carta">${datos.numero}</div>
                        <div class="nombre-carta">${datos.nombre}</div>
                    </div>
                    <div class="contenedor-imagen-personaje">
                        <img src="${datos.imagen}" alt="${datos.nombre}" class="imagen-personaje" loading="lazy">
                    </div>
                    <div class="contenedor-estadisticas">
                        <div class="fila-estadistica">
                            <span class="etiqueta-estadistica">VIDA</span>
                            <span class="valor-estadistica">${datos.vida}</span>
                        </div>  
                        <div class="fila-estadistica">
                            <span class="etiqueta-estadistica">ATAQUE</span>
                            <span class="valor-estadistica">${datos.ataque}</span>
                        </div>
                        <div class="fila-estadistica">
                            <span class="etiqueta-estadistica">PODER</span>
                            <span class="valor-estadistica">${datos.poder}</span>
                        </div>
                        <div class="fila-estadistica">
                            <span class="etiqueta-estadistica">DEFENSA</span>
                            <span class="valor-estadistica">${datos.defensa}</span>
                        </div>
                        <div class="fila-estadistica">
                            <span class="etiqueta-estadistica">VELOCIDAD</span>
                            <span class="valor-estadistica">${datos.velocidad}</span>
                        </div>
                        <div class="fila-estadistica">
                            <span class="etiqueta-estadistica">TERROR</span>
                            <span class="valor-estadistica">${datos.terror}</span>
                        </div>
                    </div>
                </div>
                <!-- Lado trasero -->
                <div class="lado-trasero">
                    <div class="logo-trasero"></div>
                    <div class="texto-trasero">TRADING CARDS</div>
                </div>
            </div>
        `;
    }

    obtenerDatosCarta(index) {
        // Si tenemos datos del JSON, usarlos
        if (this.cartasData && this.cartasData.length > 0) {
            const carta = this.cartasData[index - 1] || this.cartasData[0];
            return {
                numero: carta['numero-carta'] || `#${index.toString().padStart(3, '0')}`,
                nombre: carta.nombre || `Carta ${index}`,
                imagen: carta.imagen || '../img/foto/1.jpg',
                vida: carta.vida || this.generarEstadisticaAleatoria(50, 100),
                ataque: carta.ataque || this.generarEstadisticaAleatoria(20, 80),
                poder: carta.poder || this.generarEstadisticaAleatoria(30, 90),
                defensa: carta.defensa || this.generarEstadisticaAleatoria(25, 75),
                velocidad: carta.velocidad || this.generarEstadisticaAleatoria(10, 95),
                terror: carta.terror || this.generarEstadisticaAleatoria(40, 100),
                claseCategoria: carta.categoria || this.determinarCategoria(index)
            };
        }

        // Datos por defecto si no hay JSON
        return this.generarDatosCartaPorDefecto(index);
    }

    generarDatosCartaPorDefecto(index) {
        const personajes = [
            'Freddy Fazbear', 'Bonnie', 'Chica', 'Foxy', 
            'Golden Freddy', 'Springtrap', 'Puppet', 'Mangle'
        ];

        return {
            numero: `#${index.toString().padStart(3, '0')}`,
            nombre: personajes[index - 1] || `Personaje ${index}`,
            imagen: `../img/foto/${index}.jpg`,
            vida: this.generarEstadisticaAleatoria(50, 100),
            ataque: this.generarEstadisticaAleatoria(20, 80),
            poder: this.generarEstadisticaAleatoria(30, 90),
            defensa: this.generarEstadisticaAleatoria(25, 75),
            velocidad: this.generarEstadisticaAleatoria(10, 95),
            terror: this.generarEstadisticaAleatoria(40, 100),
            claseCategoria: this.determinarCategoria(index)
        };
    }

    generarEstadisticaAleatoria(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    determinarCategoria(index) {
        // Determinar rareza basada en el índice
        if (index <= 2) return 'dorada';
        if (index <= 5) return 'rosa';
        return 'azul';
    }

    generarDatosPorDefecto() {
        const datos = [];
        for (let i = 1; i <= this.totalCartas; i++) {
            datos.push(this.generarDatosCartaPorDefecto(i));
        }
        return datos;
    }

    generarCartasConDatosPorDefecto() {
        console.log('Generando cartas con datos por defecto...');
        this.cartasData = this.generarDatosPorDefecto();
        this.setupContenedor();
        this.generarCartas();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event delegation para manejar clicks en cartas
        if (this.contenedorCartas) {
            this.contenedorCartas.addEventListener('click', (event) => {
                const carta = event.target.closest('.carta');
                if (carta && typeof voltearCarta === 'function') {
                    voltearCarta(carta);
                }
            });

            // Soporte para teclado
            this.contenedorCartas.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    const carta = event.target.closest('.carta');
                    if (carta && typeof voltearCarta === 'function') {
                        event.preventDefault();
                        voltearCarta(carta);
                    }
                }
            });
        }
    }

    // Método público para regenerar cartas
    regenerarCartas() {
        this.generarCartas();
    }

    // Método público para obtener datos de una carta específica
    obtenerDatosCartaPorId(cartaId) {
        const index = parseInt(cartaId.replace('carta-', ''));
        return this.obtenerDatosCarta(index);
    }

    // Método público para actualizar una carta específica
    actualizarCarta(cartaId, nuevosDatos) {
        const carta = document.getElementById(cartaId);
        if (carta) {
            const datosCompletos = { ...this.obtenerDatosCartaPorId(cartaId), ...nuevosDatos };
            carta.innerHTML = this.generarHTMLCarta(datosCompletos);
        }
    }
}

// Función de utilidad para inicializar las cartas
function inicializarCartas() {
    return new GeneradorCartas();
}

// Auto-inicialización cuando el DOM esté listo
let generadorCartas;
document.addEventListener('DOMContentLoaded', () => {
    generadorCartas = inicializarCartas();
});

// Funciones globales para compatibilidad
window.regenerarCartas = () => {
    if (generadorCartas) {
        generadorCartas.regenerarCartas();
    }
};

window.obtenerDatosCarta = (cartaId) => {
    if (generadorCartas) {
        return generadorCartas.obtenerDatosCartaPorId(cartaId);
    }
    return null;
};

// Export para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeneradorCartas;
}