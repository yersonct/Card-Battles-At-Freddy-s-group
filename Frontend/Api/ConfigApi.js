/**
 * Configuración de la API para Card Battles At Freddy's
 * Archivo: ConfigApi.js
 */

// ====================== CONFIG BASE ======================
const API_CONFIG = {
  baseURL: 'http://localhost:7147/api', // base swagger
  timeout: 30000, // ms
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

// ====================== ENDPOINTS ======================
// Recursos REST (convención PascalCase según tu backend)
const API_ENDPOINTS = {
  // -------- CARTA --------
  CARTA_ROOT: '/Carta',
  CARTA_BY_ID: '/Carta/{id}',
  CARTA_BY_CATEGORIA: '/Carta/categoria/{categoria}',
  CARTA_INSERTAR_PREDEFINIDAS: '/Carta/insertar-cartas-predefinidas',
  CARTA_MERGE: '/Carta/{id}/merge',
  CARTA_DELETE_LOGICAL: '/Carta/{id}/deleteLogical',

  // -------- JUGADOR --------
  JUGADOR_ROOT: '/Jugador',
  JUGADOR_BY_ID: '/Jugador/{id}',
  JUGADOR_BY_PARTIDA: '/Jugador/partida/{partidaId}',
  JUGADOR_MERGE: '/Jugador/{id}/merge',
  JUGADOR_DELETE_LOGICAL: '/Jugador/{id}/deleteLogical',

  // -------- CARTA JUGADOR --------
  CARTA_JUGADOR_ROOT: '/CartaJugador',
  CARTA_JUGADOR_BY_ID: '/CartaJugador/{id}',
  CARTA_JUGADOR_BY_JUGADOR: '/CartaJugador/jugador/{jugadorId}',
  CARTA_JUGADOR_MAZO: '/CartaJugador/jugador/{jugadorId}/mazo',
  CARTA_JUGADOR_JUGAR: '/CartaJugador/{cartaJugadorId}/jugar/{jugadaId}',
  CARTA_JUGADOR_MERGE: '/CartaJugador/{id}/merge',
  CARTA_JUGADOR_DELETE_LOGICAL: '/CartaJugador/{id}/deleteLogical',

  // -------- PARTIDA (REST) --------
  PARTIDA_ROOT: '/Partida',
  PARTIDA_BY_ID: '/Partida/{id}',
  PARTIDA_ACTIVE: '/Partida/active',
  PARTIDA_BY_ESTADO: '/Partida/estado/{estado}',
  PARTIDA_FINALIZAR: '/Partida/{id}/finalizar',
  PARTIDA_MERGE: '/Partida/{id}/merge',
  PARTIDA_DELETE_LOGICAL: '/Partida/{id}/deleteLogical',
  PARTIDA_CREAR: '/Partida/crear',        // <- AÑADIR
  // -------- RONDA --------
  RONDA_ROOT: '/Ronda',
  RONDA_BY_ID: '/Ronda/{id}',
  RONDA_BY_PARTIDA: '/Ronda/partida/{partidaId}',
  RONDA_ACTUAL: '/Ronda/partida/{partidaId}/actual',
  RONDA_MERGE: '/Ronda/{id}/merge',
  RONDA_DELETE_LOGICAL: '/Ronda/{id}/deleteLogical',

  // ================== ENDPOINTS CUSTOM (game flow) ==================
  // Estos existen en tu API en minúsculas; los mantenemos con nombres únicos:
 GF_PARTIDA_ESTADO: '/Partida/{partidaId}/estado',
GF_PARTIDA_ELEGIR_ATRIBUTO: '/Partida/elegir-atributo',
GF_PARTIDA_JUGAR_CARTA: '/Partida/jugar-carta',
GF_PARTIDA_VERIFICAR_RONDA: '/Partida/{partidaId}/verificar-ronda',
GF_PARTIDA_RANKING: '/Partida/{partidaId}/ranking',
GF_PARTIDA_FINALIZAR: '/Partida/{partidaId}/finalizar',
GF_PARTIDA_CARTAS_JUGADOR: '/Partida/{partidaId}/jugador/{jugadorId}/cartas',
GF_PARTIDA_ES_TURNO: '/Partida/{partidaId}/jugador/{jugadorId}/es-turno',



  // Jugadas (si las usas)
  JUGADA_ROOT: '/Jugada',
  JUGADA_BY_ID: '/Jugada/{id}',
  JUGADA_BY_RONDA: '/Jugada/ronda/{rondaId}',
  JUGADA_BY_JUGADOR: '/Jugada/jugador/{jugadorId}',
  JUGADA_MERGE: '/Jugada/{id}/merge',
  JUGADA_DELETE_LOGICAL: '/Jugada/{id}/deleteLogical',
};

// ====================== HELPERS DE URL ======================
/**
 * Reemplaza {params} en el endpoint.
 * Ej: buildUrl('/Partida/{id}', { id: 5 }) => 'http://.../Partida/5'
 */
function buildUrl(endpoint, params = {}) {
  let url = (API_CONFIG.baseURL || '').replace(/\/+$/, '') + endpoint;
  for (const [k, v] of Object.entries(params)) {
    url = url.replaceAll(`{${k}}`, encodeURIComponent(String(v)));
  }
  return url;
}

/**
 * Agrega query string a una url.
 * Ej: withQuery('/Jugador', { IdPartida: 1, Active: 1 })
 *  -> '/Jugador?IdPartida=1&Active=1'
 */
function withQuery(url, query = {}) {
  const q = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `${url}${url.includes('?') ? '&' : '?'}${q}` : url;
}

// ====================== CLIENTE HTTP ======================
async function makeRequest(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  const config = {
    method,
    headers: { ...API_CONFIG.headers, ...(options.headers || {}) },
    body: options.body,
  };

  // Si body es objeto y no es GET, serializa a JSON
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // Evitar Content-Type innecesario en GET (reduce preflight)
  if (method === 'GET') {
    delete config.headers['Content-Type'];
  }

  // Timeout
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  config.signal = controller.signal;

  try {
    const resp = await fetch(url, config);
    clearTimeout(t);

    const ct = resp.headers.get('content-type') || '';
    const isJson = ct.includes('application/json');

    if (!resp.ok) {
      const payload = isJson ? await resp.json().catch(() => ({})) : await resp.text();
      const message =
        (isJson && (payload.message || payload.error || payload.title)) ||
        resp.statusText ||
        'Error en la solicitud';
      throw new ApiError(message, resp.status, payload);
    }

    return isJson ? await resp.json() : await resp.text();
  } catch (err) {
    clearTimeout(t);
    if (err.name === 'AbortError') {
      throw new ApiError('La petición ha excedido el tiempo límite', 408);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError('Error de red. Verifica tu conexión a internet.', 0, err);
  }
}

// Atajos
const apiGet = (url, query) => makeRequest(withQuery(url, query), { method: 'GET' });
const apiPost = (url, body) => makeRequest(url, { method: 'POST', body });
const apiPut = (url, body) => makeRequest(url, { method: 'PUT', body });
const apiPatch = (url, body) => makeRequest(url, { method: 'PATCH', body });
const apiDelete = (url) => makeRequest(url, { method: 'DELETE' });

// ====================== EXPORTS GLOBALES ======================
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

window.API_CONFIG = API_CONFIG;
window.API_ENDPOINTS = API_ENDPOINTS;
window.ApiError = ApiError;
window.buildUrl = buildUrl;
window.withQuery = withQuery;
window.makeRequest = makeRequest;
window.apiGet = apiGet;
window.apiPost = apiPost;
window.apiPut = apiPut;
window.apiPatch = apiPatch;
window.apiDelete = apiDelete;
