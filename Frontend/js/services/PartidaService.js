// js/services/PartidaService.js
(() => {
  const DEBUG_GF = true;
  const log = (...a) => DEBUG_GF && console.debug('[GF:Service]', ...a);
  // ====== Base (fallback REST) ======
  const API_BASE = (window.API_CONFIG?.baseURL || 'http://localhost:7147/api').replace(/\/+$/, '');

  const unwrap = (x) => (x && (x.data ?? x.result ?? x)) ?? null;

  async function req(method, path, body) {
    const r = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body == null ? undefined : JSON.stringify(body),
      credentials: 'include',
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      const err = new Error(`ApiError: ${r.status} ${r.statusText} ${txt}`);
      err.status = r.status;
      throw err;
    }
    // puede venir vacío (204) o con wrapper
    try {
      const json = await r.json();
      return unwrap(json);
    } catch {
      return null;
    }
  }
  // ====== Helpers para elegir ruta/cliente ======
  
  const hasEndpoints = typeof window.API_ENDPOINTS === 'object' && typeof window.buildUrl === 'function';
  const hasClient = typeof window.apiGet === 'function' && typeof window.apiPost === 'function' && typeof window.apiPut === 'function';
 const GET = async (keyOrPath, params) => {
    if (hasEndpoints && hasClient) {
      const url = buildUrl(API_ENDPOINTS[keyOrPath] ?? keyOrPath, params || {});
      return unwrap(await apiGet(url));
    }
    return req('GET', keyOrPath);
  };
  const POST = async (keyOrPath, body, params) => {
    if (hasEndpoints && hasClient) {
      const url = buildUrl(API_ENDPOINTS[keyOrPath] ?? keyOrPath, params || {});
      return unwrap(await apiPost(url, body));
    }
    return req('POST', keyOrPath, body);
  };
  const PUT = async (keyOrPath, body, params) => {
    if (hasEndpoints && hasClient) {
      const url = buildUrl(API_ENDPOINTS[keyOrPath] ?? keyOrPath, params || {});
      return unwrap(await apiPut(url, body));
    }
    return req('PUT', keyOrPath, body);
  };

   const is405 = (e) => e && (e.status === 405 || /method\s*not\s*allowed/i.test(String(e.message || '')));
  const putOrPost = async (keyOrPath, body, params) => {
    try { return await PUT(keyOrPath, body, params); }
    catch (e) {
      if (is405(e)) return await POST(keyOrPath, body, params);
      throw e;
    }
  };

  // ====== PARTIDA ======
  async function getPartidaById(id) {
    if (hasEndpoints) return GET('PARTIDA_BY_ID', { id: Number(id) });
    return req('GET', `/Partida/${Number(id)}`);
  }
  async function getEstadoPartida(id) { return getPartidaById(id); }

  // ====== JUGADORES ======
  async function getJugadoresByPartida(partidaId, { onlyActive } = {}) {
    let list;
    if (hasEndpoints) {
      list = await GET('JUGADOR_BY_PARTIDA', { partidaId: Number(partidaId) });
    } else {
      list = await req('GET', `/Jugador/partida/${Number(partidaId)}`);
    }
    list = Array.isArray(list) ? list : [];              // ✅ siempre array
    return onlyActive ? list.filter(j => (j.active ?? j.Active) !== 0) : list;
  }


async function actualizarJugador(idJugador, data) {
  const body = {
    Id: Number(idJugador),
    IdPartida: data.IdPartida != null ? Number(data.IdPartida)
             : (data.idPartida != null ? Number(data.idPartida) : null),
    Nombre: data.Nombre ?? data.nombre ?? '',
    Avatar: data.Avatar ?? data.avatar ?? null,
    PosicionTurno: Number(data.PosicionTurno ?? data.PosicionTurnos ?? data.posicionTurno ?? 0) || null,
    PuntosAcumulados: Number(data.PuntosAcumulados ?? data.puntosAcumulados ?? 0),
    Active: Number(data.Active ?? 1),
  };

  if (hasEndpoints) return putOrPost('JUGADOR_BY_ID', body, { id: Number(idJugador) });

  try {
    return await req('PUT', `/Jugador`, body);   // ← AQUÍ
  } catch (e) {
    const is405 = (e && (e.status === 405 || /method\s*not\s*allowed/i.test(String(e.message))));
    if (is405) return await req('POST', `/Jugador`, body);
    throw e;
  }
}


  // ====== RONDA ======
    async function crearRonda(payload) {
  const body = {
    IdPartida: Number(payload.IdPartida),
    NumeroRonda: Number(payload.NumeroRonda),
    AtributoCompetido: payload.AtributoCompetido ?? null,
    IdJugadorQueElige: Number(payload.IdJugadorQueElige),
    Estado: String(payload.Estado || 'Esperando'), // ← antes estaba 'EnProgreso'
    FechaInicio: payload.FechaInicio || new Date().toISOString(),
    Active: Number(payload.Active ?? 1),
  };
  log('crearRonda > req', body);

  let ronda;
  if (hasEndpoints) ronda = await POST('RONDA_ROOT', body);
  else ronda = await req('POST', `/Ronda`, body);

  const newId = Number(ronda?.Id ?? ronda?.id ?? ronda?.insertId ?? 0);
  if (newId) ronda.Id = newId;

  log('crearRonda > res', ronda);
  return ronda;
}



 async function getRondaActual(partidaId) {
  const pid = Number(partidaId);
  let res;
  if (hasEndpoints) {
    res = await GET('RONDA_ACTUAL', { partidaId: pid });
  } else {
    res = await req('GET', `/Ronda/partida/${pid}/actual`);
  }
  log('getRondaActual > res', res);
  return res;
}


  async function getRondaById(idRonda) {
    if (hasEndpoints) return GET('RONDA_BY_ID', { id: Number(idRonda) });
    return req('GET', `/Ronda/${Number(idRonda)}`);
  }

// EN js/services/PartidaService.js
// js/services/PartidaService.js  (dentro de actualizarRonda)
async function actualizarRonda(idRonda, data) {
  const body = {
    Id: Number(idRonda),
    IdPartida: Number(data.IdPartida ?? data.idPartida),
    NumeroRonda: Number(data.NumeroRonda ?? data.numeroRonda),
    AtributoCompetido: data.AtributoCompetido ?? data.atributoCompetido ?? null,
    IdJugadorQueElige: Number(data.IdJugadorQueElige ?? data.idJugadorQueElige ?? 0) || null,
    IdGanador: data.IdGanador != null ? Number(data.IdGanador) : null,
    Estado: data.Estado ?? data.estado ?? null,
    FechaInicio: data.FechaInicio ?? null,
    FechaFin: data.FechaFin ?? null,
    Active: data.Active ?? 1,
  };
  log('actualizarRonda > id/body', idRonda, body);

  // 1) Si hay endpoints configurados, usalos
  if (hasEndpoints) {
    try { return await PUT('RONDA_BY_ID', body, { id: Number(idRonda) }); }
    catch (e) {
      // si devuelve 405, probamos POST al mismo endpoint
      const is405 = (e && (e.status === 405 || /405|method\s*not\s*allowed/i.test(String(e.message))));
      if (is405) {
        try {
          const url = buildUrl(API_ENDPOINTS.RONDA_BY_ID, { id: Number(idRonda) });
          return await apiPost(url, body);
        } catch {}
      }
      throw e;
    }
  }

  // 2) Fallback “puro REST” con tu GenericController: PUT /Ronda  (SIN {id})
  return req('PUT', `/Ronda`, body);
}





  async function elegirAtributoEnRonda({ idRonda = null, partidaId, jugadorId, atributo }) {
    const attr = String(atributo || '').toLowerCase().replace('defenza', 'defensa');

    if (idRonda) {
      // Actualiza parcialmente pero mergeando para no perder campos
      return actualizarRonda(Number(idRonda), { AtributoCompetido: attr, Estado: 'EnProgreso' });
    }

    // Si hay endpoint custom GF, úsalo
    if (hasEndpoints && API_ENDPOINTS.GF_PARTIDA_ELEGIR_ATRIBUTO) {
      return POST('GF_PARTIDA_ELEGIR_ATRIBUTO', {
        partidaId: Number(partidaId),
        jugadorId: Number(jugadorId),
        atributo: attr
      });
    }

    // Último recurso: resuelve la ronda actual y actualiza
    const ronda = await getRondaActual(partidaId);
    const rid = Number(ronda?.Id ?? ronda?.id ?? 0);
    if (rid) return actualizarRonda(rid, { AtributoCompetido: attr, Estado: 'EnProgreso' });

    throw new Error('No hay idRonda ni endpoint GF_PARTIDA_ELEGIR_ATRIBUTO configurado.');
  }

  // ====== JUGADA ======
  async function crearJugada(data) {
    const body = {
      IdRonda: Number(data.IdRonda),
      IdJugador: Number(data.IdJugador),
      IdCartaJugador: Number(data.IdCartaJugador),
      ValorAtributo: Number(data.ValorAtributo),
      Active: 1,
    };

    // preferencia 1: endpoint estándar /Jugada
    try {
      if (hasEndpoints) return await POST('JUGADA_ROOT', body);
      return await req('POST', `/Jugada`, body);
    } catch (e1) {
      // preferencia 2: endpoint custom “GF”
      try {
        if (hasEndpoints && API_ENDPOINTS.GF_PARTIDA_JUGAR_CARTA) {
          return await POST('GF_PARTIDA_JUGAR_CARTA', {
            rondaId: body.IdRonda,
            jugadorId: body.IdJugador,
            cartaJugadorId: body.IdCartaJugador,
            valorAtributo: body.ValorAtributo,
          });
        }
      } catch (e2) {
        throw e1;
      }
    }
  }

  async function getJugadasByRonda(rondaId) {
    if (hasEndpoints) return GET('JUGADA_BY_RONDA', { rondaId: Number(rondaId) });
    return req('GET', `/Jugada/ronda/${Number(rondaId)}`);
  }

  // ====== CARTA JUGADOR ======
async function marcarCartaUsada(cartaJugadorId, { usada = 1, rondaUsada = null, jugadaId } = {}) {
  const cid = Number(cartaJugadorId);

  // si tengo jugadaId, prefiero el endpoint “jugar”
  if (jugadaId != null) {
    const q = [];
    if (rondaUsada != null) q.push(`rondaUsada=${encodeURIComponent(Number(rondaUsada))}`);
    if (usada != null) q.push(`usada=${usada ? 1 : 0}`);
    const qs = q.length ? `?${q.join('&')}` : '';

    // 1) si tengo API_ENDPOINTS configurados
    if (hasEndpoints && API_ENDPOINTS.CARTA_JUGADOR_JUGAR) {
      try {
        const url = buildUrl(API_ENDPOINTS.CARTA_JUGADOR_JUGAR, { cartaJugadorId: cid, jugadaId: Number(jugadaId) });
        return await apiPut(url + qs, undefined);
      } catch (e) {
        console.warn('[Service] CARTA_JUGADOR_JUGAR (API_ENDPOINTS) falló, pruebo fallback:', e);
      }
    }

    // 2) fallback REST directo a tu controlador
    try {
      return await req('PUT', `/CartaJugador/${cid}/jugar/${Number(jugadaId)}${qs}`);
    } catch (e) {
      console.warn('[Service] PUT /CartaJugador/{id}/jugar/{jugadaId} falló:', e);
      throw e;
    }
  }

  // (sólo si NO hay jugadaId) último recurso: actualizar por body completo (riesgoso)
  // ⚠️ tu GenericController expone PUT /CartaJugador (SIN id en la URL)
  const bodyById = {
    Id: cid,
    Usada: usada ? 1 : 0,
    RondaUsada: rondaUsada == null ? null : Number(rondaUsada),
  };
  return req('PUT', `/CartaJugador`, bodyById);
}





  // ====== CARTAS (catálogo / mano) ======
async function getCartasJugador(partidaId, jugadorId) {
  if (hasEndpoints && API_ENDPOINTS.GF_PARTIDA_CARTAS_JUGADOR) {
    return GET('GF_PARTIDA_CARTAS_JUGADOR', { partidaId: Number(partidaId), jugadorId: Number(jugadorId) });
  }
  // ✅ ahora sí existe en tu controller
  return req('GET', `/CartaJugador/partida/${Number(partidaId)}/jugador/${Number(jugadorId)}`);
}

async function getCartasJugadorDesdeTabla(partidaId, jugadorId) {
  const pid = Number(partidaId), jid = Number(jugadorId);
  if (hasEndpoints && API_ENDPOINTS.CARTA_JUGADOR_ROOT) {
    const base = buildUrl(API_ENDPOINTS.CARTA_JUGADOR_ROOT);
    const url = `${base}?IdPartida=${encodeURIComponent(pid)}&IdJugador=${encodeURIComponent(jid)}`;
    return unwrap(await apiGet(url));
  }
  // si no tienes este endpoint en backend, deja el /jugador/{jid} como fallback
  try {
    return await req('GET', `/CartaJugador/partida/${pid}/jugador/${jid}`);
  } catch {
    return req('GET', `/CartaJugador/jugador/${jid}`);
  }
}



  async function getCartasCatalogo() {
    if (hasEndpoints) return GET('CARTA_ROOT');
    return req('GET', `/Carta`);
  }

  // ====== Export ======
  window.partidaService = {
    // Partida
    getPartidaById,
    getEstadoPartida,

    // Jugadores
    getJugadoresByPartida,
    actualizarJugador,

    // Ronda
    crearRonda,
    getRondaActual,
    getRondaById,
    actualizarRonda,
    elegirAtributoEnRonda,

    // Jugadas
    crearJugada,
    getJugadasByRonda,

    // CartaJugador / Catálogo
    marcarCartaUsada,
    getCartasJugador,
    getCartasJugadorDesdeTabla,
    getCartasCatalogo,
  };
})();
