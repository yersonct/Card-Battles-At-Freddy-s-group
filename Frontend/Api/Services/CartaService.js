/**
 * Servicio para manejo de Cartas
 * Card Battles At Freddy's
 */

class CartaService extends BaseApiService {
    constructor() {
        super(API_ENDPOINTS.CARTAS);
    }

    /**
     * Obtiene cartas por categoría
     * @param {string} categoria - Categoría de las cartas (Defensiva, Ofensiva, Especial)
     * @returns {Promise<Array>} Lista de cartas de la categoría
     */
    async getByCategoria(categoria) {
        try {
            const url = buildUrl(API_ENDPOINTS.CARTAS_BY_CATEGORIA, { categoria });
            return await makeRequest(url);
        } catch (error) {
            console.error(`Error al obtener cartas de categoría ${categoria}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene todas las cartas activas (estado = true)
     * @returns {Promise<Array>} Lista de cartas activas
     */
    async getActive() {
        try {
            const todasLasCartas = await this.getAll();
            return todasLasCartas.filter(carta => carta.estado === true);
        } catch (error) {
            console.error('Error al obtener cartas activas:', error);
            throw error;
        }
    }

    /**
     * Obtiene cartas disponibles para distribución inicial
     * Excluye cartas especiales que solo se obtienen por eventos
     * @returns {Promise<Array>} Lista de cartas para distribución
     */
    async getCartasParaDistribucion() {
        try {
            const cartasActivas = await this.getActive();
            
            // Filtrar cartas que pueden ser asignadas inicialmente
            // Excluir cartas muy poderosas o especiales
            return cartasActivas.filter(carta => {
                // Permitir cartas básicas y medias, excluir las muy poderosas
                return carta.poder <= 8 && carta.categoria !== 'Especial';
            });
        } catch (error) {
            console.error('Error al obtener cartas para distribución:', error);
            throw error;
        }
    }

    /**
     * Crea una nueva carta
     * @param {Object} cartaData - Datos de la carta
     * @returns {Promise<Object>} Carta creada
     */
    async crearCarta(cartaData) {
        try {
            const carta = {
                nombre: cartaData.nombre,
                descripcion: cartaData.descripcion || '',
                poder: cartaData.poder || 1,
                categoria: cartaData.categoria || 'Defensiva',
                rareza: cartaData.rareza || 'Común',
                imagenUrl: cartaData.imagenUrl || '',
                estado: true,
                fechaCreacion: new Date().toISOString()
            };

            const cartaCreada = await this.create(carta);
            console.log(` Carta creada: ${carta.nombre}`);
            return cartaCreada;
        } catch (error) {
            console.error(` Error al crear carta ${cartaData.nombre}:`, error);
            throw error;
        }
    }

    /**
     * Actualiza una carta existente
     * @param {number} id - ID de la carta
     * @param {Object} datos - Datos a actualizar
     * @returns {Promise<Object>} Carta actualizada
     */
    async actualizarCarta(id, datos) {
        try {
            return await this.mergePatch(id, datos);
        } catch (error) {
            console.error(`Error al actualizar carta ${id}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de uso de cartas
     * @returns {Promise<Object>} Estadísticas de cartas
     */
    async getEstadisticas() {
        try {
            const cartas = await this.getAll();
            const activas = cartas.filter(c => c.estado === true);
            
            const estadisticas = {
                total: cartas.length,
                activas: activas.length,
                inactivas: cartas.length - activas.length,
                porCategoria: {},
                porRareza: {},
                promedPoder: 0
            };

            // Estadísticas por categoría
            activas.forEach(carta => {
                estadisticas.porCategoria[carta.categoria] = (estadisticas.porCategoria[carta.categoria] || 0) + 1;
                estadisticas.porRareza[carta.rareza] = (estadisticas.porRareza[carta.rareza] || 0) + 1;
            });

            // Promedio de poder
            if (activas.length > 0) {
                estadisticas.promedPoder = activas.reduce((sum, carta) => sum + (carta.poder || 0), 0) / activas.length;
            }

            return estadisticas;
        } catch (error) {
            console.error('Error al obtener estadísticas de cartas:', error);
            throw error;
        }
    }

    /**
     * Busca cartas por nombre o descripción
     * @param {string} termino - Término de búsqueda
     * @returns {Promise<Array>} Cartas que coinciden con la búsqueda
     */
    async buscar(termino) {
        try {
            const cartas = await this.getActive();
            const terminoLower = termino.toLowerCase();
            
            return cartas.filter(carta => 
                carta.nombre.toLowerCase().includes(terminoLower) ||
                carta.descripcion.toLowerCase().includes(terminoLower)
            );
        } catch (error) {
            console.error(`Error al buscar cartas con término "${termino}":`, error);
            throw error;
        }
    }

    /**
     * Obtiene cartas más utilizadas (requiere integración con CartaJugador)
     * @returns {Promise<Array>} Cartas ordenadas por uso
     */
    async getCartasMasUtilizadas() {
        try {
            // Esta función requeriría datos de CartaJugador para contar uso
            // Por ahora retorna cartas ordenadas por poder
            const cartas = await this.getActive();
            return cartas.sort((a, b) => (b.poder || 0) - (a.poder || 0));
        } catch (error) {
            console.error('Error al obtener cartas más utilizadas:', error);
            throw error;
        }
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartaService;
} else {
    window.CartaService = CartaService;
}
