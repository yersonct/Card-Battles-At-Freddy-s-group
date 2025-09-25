/**
 * Servicio de acceso al backend para la Partida
 * Depende de: ConfigApi.js (API_ENDPOINTS, buildUrl, withQuery, apiGet, apiPost, apiPut, apiPatch)
 */

(function () {
  if (!window.API_ENDPOINTS) {
    console.error('[PartidaBackendService] Falta cargar ConfigApi.js antes de este archivo.');
    return;
  }

  const E = window.API_ENDPOINTS;

  // -------------------- Helpers internos --------------------
  function urlCartaById(id) {
    return buildUrl(E.CARTA_BY_ID, { id });
  }
  function urlJugadorById(id) {
    return buildUrl(E.JUGADOR_BY_ID, { id });
  }
  function urlPartidaById(id) {
    return buildUrl(E.PARTIDA_BY_ID, { id });
  }
  function urlRondaActual(partidaId) {
    return buildUrl(E.RONDA_ACTUAL, { partidaId });
  }

  // Endpoints estilo “custom game flow”
  function urlGF_EstadoPartida(id) {
    return buildUrl(E.GF_PARTIDA_ESTADO, { id });
  }
  function urlGF_CartasJugador(partidaId, jugadorId) {
    return buildUrl(E.GF_PARTIDA_CARTAS_JUGADOR, { partidaId, jugadorId });
  }
  function urlGF_EsTurno(partidaId, jugadorId) {
    return buildUrl(E.GF_PARTIDA_ES_TURNO, { partidaId, jugadorId });
  }

  // -------------------- API pública --------------------
  const service = {
    // ===== Jugadores =====
    async getJugadoresByPartida(partidaId, { onlyActive = true } = {}) {
      // Dos opciones: endpoint REST por query ó endpoint REST por path.
      // A) /Jugador?IdPartida=...&Active=1
      const urlA = withQuery(E.JUGADOR_ROOT, {
        IdPartida: partidaId,
        Active: onlyActive ? 1 : undefined,
      });
      return apiGet(urlA);
      // B) Si prefieres por path: return apiGet(buildUrl(E.JUGADOR_BY_PARTIDA, { partidaId }));
    },

    async getJugadorById(id) {
      return apiGet(urlJugadorById(id));
    },

    // ===== Cartas =====
    async getCartasCatalogo() {
      return apiGet(E.CARTA_ROOT);
    },

    async getCartaById(id) {
      return apiGet(urlCartaById(id));
    },

    // ===== CartaJugador (asignación/reparto) =====
    // Opción 1 (recomendada): usar tu endpoint "game flow" que ya devuelve las cartas del jugador en la partida
    async getCartasJugador(partidaId, jugadorId) {
      // Si tienes este endpoint custom:
      //   GET /partida/{partidaId}/jugador/{jugadorId}/cartas
      return apiGet(urlGF_CartasJugador(partidaId, jugadorId));
    },

    // Opción 2 (alternativa): si prefieres desde /CartaJugador con query
    async getCartasJugadorDesdeTabla(partidaId, jugadorId, { onlyActive = true } = {}) {
      const url = withQuery(E.CARTA_JUGADOR_ROOT, {
        partidaId,
        jugadorId,
        active: onlyActive ? 1 : undefined,
      });
      return apiGet(url);
    },

    // Marcar carta usada en una ronda (ajusta al contrato real de tu API)
    async marcarCartaUsada(cartaJugadorId, { usada = 1, rondaUsada = null } = {}) {
      // Si tu API acepta PUT en /CartaJugador/{id} con el body merge:
      const url = buildUrl(E.CARTA_JUGADOR_BY_ID, { id: cartaJugadorId });
      const body = { Usada: usada, RondaUsada: rondaUsada };
      // Algunas APIs usan PATCH /merge:
      // const url = buildUrl(E.CARTA_JUGADOR_MERGE, { id: cartaJugadorId });
      return apiPut(url, body);
    },

    // ===== Partida / Ronda =====
    async getPartidaById(id) {
      return apiGet(urlPartidaById(id));
    },

    async getEstadoPartidaGF(id) {
      // GET /partida/{id}/estado
      return apiGet(urlGF_EstadoPartida(id));
    },

    async getRondaActual(partidaId) {
      return apiGet(urlRondaActual(partidaId));
    },

    async esTurno(partidaId, jugadorId) {
      // GET /partida/{partidaId}/jugador/{jugadorId}/es-turno
      return apiGet(urlGF_EsTurno(partidaId, jugadorId));
    },

    // ===== Jugadas (si las usas para registrar el “lanzar”) =====
    async crearJugada(body) {
      // POST /Jugada  -> { IdRonda, IdJugador, IdCarta, ... }
      return apiPost(E.JUGADA_ROOT, body);
    },

    async getJugadasByRonda(rondaId) {
      return apiGet(buildUrl(E.JUGADA_BY_RONDA, { rondaId }));
    },
  };

  // Export global
  window.partidaService = service;
})();
