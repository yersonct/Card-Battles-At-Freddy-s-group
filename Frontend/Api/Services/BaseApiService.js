/**
 * Servicio Base para todas las operaciones CRUD
 * Card Battles At Freddy's
 */

class BaseApiService {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    /**
     * Obtiene todos los elementos
     * @returns {Promise<Array>} Lista de elementos
     */
    async getAll() {
        const url = buildUrl(this.endpoint);
        return await makeRequest(url);
    }

    /**
     * Obtiene un elemento por ID
     * @param {number} id - ID del elemento
     * @returns {Promise<Object>} Elemento encontrado
     */
    async getById(id) {
        const url = buildUrl(`${this.endpoint}/${id}`);
        return await makeRequest(url);
    }

    /**
     * Crea un nuevo elemento
     * @param {Object} data - Datos del elemento a crear
     * @returns {Promise<Object>} Elemento creado
     */
    async create(data) {
        const url = buildUrl(this.endpoint);
        return await makeRequest(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Actualiza un elemento completo
     * @param {Object} data - Datos del elemento a actualizar
     * @returns {Promise<Object>} Elemento actualizado
     */
    async update(data) {
        const url = buildUrl(this.endpoint);
        return await makeRequest(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Elimina un elemento por ID
     * @param {number} id - ID del elemento a eliminar
     * @returns {Promise<boolean>} Resultado de la eliminación
     */
    async delete(id) {
        const url = buildUrl(`${this.endpoint}/${id}`);
        return await makeRequest(url, {
            method: 'DELETE'
        });
    }

    /**
     * Eliminación lógica de un elemento
     * @param {number} id - ID del elemento a eliminar lógicamente
     * @returns {Promise<boolean>} Resultado de la eliminación
     */
    async softDelete(id) {
        const url = buildUrl(`${this.endpoint}/${id}/deleteLogical`);
        return await makeRequest(url, {
            method: 'DELETE'
        });
    }

    /**
     * Actualización parcial de un elemento
     * @param {number} id - ID del elemento a actualizar
     * @param {Object} partialData - Datos parciales para actualizar
     * @returns {Promise<Object>} Elemento actualizado
     */
    async mergePatch(id, partialData) {
        const url = buildUrl(`${this.endpoint}/${id}/merge`);
        return await makeRequest(url, {
            method: 'PATCH',
            body: JSON.stringify(partialData)
        });
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseApiService;
} else {
    window.BaseApiService = BaseApiService;
}
