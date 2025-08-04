/**
 * Configuración de la API para Card Battles At Freddy's
 */

// Configuración base de la API
const API_CONFIG = {
    baseURL: 'http://localhost:7147/api', // Cambiado a HTTP para evitar problemas de CORS
    timeout: 30000, // 30 segundos de timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// URLs de los endpoints
const API_ENDPOINTS = {
    // Cartas
    CARTAS: '/Carta',
    CARTAS_BY_CATEGORIA: '/Carta/categoria/{categoria}',
    CARTAS_BY_ID: '/Carta/{id}',
    CARTAS_UPDATE: '/Carta/{id}',
    CARTAS_DELETE: '/Carta/{id}',
    CARTAS_MERGE: '/Carta/{id}/merge',
    CARTAS_DELETE_LOGICAL: '/Carta/{id}/deleteLogical',
    
    // Carta Jugador
    CARTA_JUGADOR: '/CartaJugador',
    CARTA_JUGADOR_BY_JUGADOR: '/CartaJugador/jugador/{jugadorId}',
    CARTA_JUGADOR_BY_JUGADA: '/CartaJugador/jugada/{jugadaId}',
    CARTA_JUGADOR_MAZO: '/CartaJugador/jugador/{jugadorId}/mazo',
    CARTA_JUGADOR_JUGAR: '/CartaJugador/{cartaJugadorId}/jugar/{jugadaId}',
    CARTA_JUGADOR_ACTIVE: '/CartaJugador/active',
    CARTA_JUGADOR_BY_ID: '/CartaJugador/{id}',
    CARTA_JUGADOR_UPDATE: '/CartaJugador/{id}',
    CARTA_JUGADOR_DELETE: '/CartaJugador/{id}',
    CARTA_JUGADOR_MERGE: '/CartaJugador/{id}/merge',
    CARTA_JUGADOR_DELETE_LOGICAL: '/CartaJugador/{id}/deleteLogical',
    
    // Jugadas
    JUGADAS: '/Jugada',
    JUGADAS_BY_RONDA: '/Jugada/ronda/{rondaId}',
    JUGADAS_BY_JUGADOR: '/Jugada/jugador/{jugadorId}',
    JUGADAS_BY_ID: '/Jugada/{id}',
    JUGADAS_UPDATE: '/Jugada/{id}',
    JUGADAS_DELETE: '/Jugada/{id}',
    JUGADAS_MERGE: '/Jugada/{id}/merge',
    JUGADAS_DELETE_LOGICAL: '/Jugada/{id}/deleteLogical',
    
    // Jugadores
    JUGADORES: '/Jugador',
    JUGADORES_BY_PARTIDA: '/Jugador/partida/{partidaId}',
    JUGADORES_BY_ID: '/Jugador/{id}',
    JUGADORES_UPDATE: '/Jugador/{id}',
    JUGADORES_DELETE: '/Jugador/{id}',
    JUGADORES_MERGE: '/Jugador/{id}/merge',
    JUGADORES_DELETE_LOGICAL: '/Jugador/{id}/deleteLogical',
    
    // Partidas
    PARTIDAS: '/Partida',
    PARTIDAS_ACTIVE: '/Partida/active',
    PARTIDAS_BY_ESTADO: '/Partida/estado/{estado}',
    PARTIDAS_FINALIZAR: '/Partida/{id}/finalizar',
    PARTIDAS_BY_ID: '/Partida/{id}',
    PARTIDAS_UPDATE: '/Partida/{id}',
    PARTIDAS_DELETE: '/Partida/{id}',
    PARTIDAS_MERGE: '/Partida/{id}/merge',
    PARTIDAS_DELETE_LOGICAL: '/Partida/{id}/deleteLogical',
    
    // Rondas
    RONDAS: '/Ronda',
    RONDAS_BY_PARTIDA: '/Ronda/partida/{partidaId}',
    RONDA_ACTUAL: '/Ronda/partida/{partidaId}/actual',
    RONDAS_BY_ID: '/Ronda/{id}',
    RONDAS_UPDATE: '/Ronda/{id}',
    RONDAS_DELETE: '/Ronda/{id}',
    RONDAS_MERGE: '/Ronda/{id}/merge',
    RONDAS_DELETE_LOGICAL: '/Ronda/{id}/deleteLogical'
};

// Clase base para manejo de errores
class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Función helper para construir URLs
function buildUrl(endpoint, params = {}) {
    let url = API_CONFIG.baseURL + endpoint;
    
    // Reemplazar parámetros en la URL
    Object.keys(params).forEach(key => {
        url = url.replace(`{${key}}`, params[key]);
    });
    
    return url;
}

// Función helper para hacer peticiones HTTP
async function makeRequest(url, options = {}) {
    const config = {
        method: 'GET',
        headers: { ...API_CONFIG.headers },
        ...options
    };

    // Agregar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    config.signal = controller.signal;

    try {
        console.log(`🚀 API Request: ${config.method} ${url}`);
        
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            const errorData = await response.text();
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            
            try {
                const jsonError = JSON.parse(errorData);
                errorMessage = jsonError.message || errorMessage;
            } catch (e) {
                // Si no es JSON válido, usar el texto tal como está
                errorMessage = errorData || errorMessage;
            }
            
            throw new ApiError(errorMessage, response.status, errorData);
        }

        // Intentar parsear como JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`✅ API Response: ${config.method} ${url}`, data);
            return data;
        } else {
            const text = await response.text();
            console.log(`✅ API Response: ${config.method} ${url}`, text);
            return text;
        }

    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            console.error(`⏰ API Timeout: ${config.method} ${url}`);
            throw new ApiError('La petición ha excedido el tiempo límite', 408);
        }
        
        if (error instanceof ApiError) {
            console.error(`❌ API Error: ${config.method} ${url}`, error);
            throw error;
        }
        
        console.error(`💥 Network Error: ${config.method} ${url}`, error);
        throw new ApiError('Error de red. Verifica tu conexión a internet.', 0, error);
    }
}

// Exportar configuraciones y helpers
window.API_CONFIG = API_CONFIG;
window.API_ENDPOINTS = API_ENDPOINTS;
window.ApiError = ApiError;
window.buildUrl = buildUrl;
window.makeRequest = makeRequest;