// js/Partida/GameFlowController.js
class GameFlowController {
  constructor() {
    this.partidaId = null;
    this.jugadorActualId = null;
    this.jugadores = [];
    this.estadoPartida = null;
    this.rondaActual = null;

    this.faseActual = 'ESPERANDO';
    this.turnoActualIndex = 0;
    this.rondaActualNumero = 1;
    this.cartasJugadasRonda = [];

    // Controladores
    this.cardSelection = null;
    this.battleComparator = null;
    this.turnIndicator = null;
    this.rankingDisplay = null;

    // Polling
    this.pollingInterval = null;

    // Cronómetro de selección
    this.timerId = null;
    this.tiempoRestante = 0;
    this.selecciones = new Map();   // rondaId -> Map(jugadorId -> payload)
    this.modoLocal2Jugadores = true; // si pruebas ambos desde el mismo navegador
    this._rondasCerradasLocal = new Set(); // ids de rondas que cerramos “en local”
this._pausePolling = false;            // flag para pausar el polling temporalmente

    console.log('🎮 GameFlowController inicializado');
  }

  async init(partidaId, jugadorId) {
    try {
      this.partidaId = Number(partidaId);
      this.jugadorActualId = Number(jugadorId);

      console.log('Inicializando GameFlowController:', {
        partidaId: this.partidaId,
        jugadorActualId: this.jugadorActualId
      });

      await this.cargarEstadoPartida();
      await this.inicializarControladores();

      this.configurarInterfazInicial();
      await this.determinarFaseActual();

      this.iniciarPolling();

      if (this.faseActual === 'SELECCIONANDO_CARTA') {
        this.cardSelection?.habilitarSeleccion();
        this.iniciarTemporizador(10); // <<<<< inicia el cronómetro
      }

      console.log('GameFlowController inicializado correctamente');
    } catch (e) {
      console.error('Error inicializando GameFlowController:', e);
      throw e;
    }
  }

  // ===================== CARGA DE ESTADO =====================
  async cargarEstadoPartida() {
  const is404 = (e) => (e && (/not\s*found/i.test(String(e.message)) || e.status === 404));

  try {
    console.log('Cargando estado de partida...');

    // Intento 1
    try {
      if (typeof window.partidaService.getPartidaById === 'function') {
        this.estadoPartida = await window.partidaService.getPartidaById(this.partidaId);
      } else if (typeof window.partidaService.getEstadoPartida === 'function') {
        this.estadoPartida = await window.partidaService.getEstadoPartida(this.partidaId);
      } else {
        throw new Error('PartidaService no expone getPartidaById / getEstadoPartida');
      }
    } catch (e) {
      if (is404(e)) {
        console.warn('[GF] Partida 404: usando estado local provisional');
        // Estado mínimo local para que la UI pueda seguir
        this.estadoPartida = { Id: this.partidaId, Estado: 'EnCurso', TurnoActual: 0 };
      } else {
        throw e;
      }
    }

    // Jugadores (si falla, crea 2 dummy para poder probar la UI)
    let jugadores = [];
    try {
      jugadores = await window.partidaService.getJugadoresByPartida(this.partidaId, { onlyActive: true });
    } catch (e) {
      if (is404(e)) {
        console.warn('[GF] Jugadores 404: usando jugadores locales');
        jugadores = [
          { Id: 1, Nombre: 'Jugador 1', Active: 1, PosicionTurnos: 1 },
          { Id: 2, Nombre: 'Jugador 2', Active: 1, PosicionTurnos: 2 },
        ];
      } else {
        throw e;
      }
    }

    this.jugadores = (Array.isArray(jugadores) ? jugadores : [])
      .map((j, i) => ({
        Id: j.Id ?? j.id ?? (i + 1),
        Nombre: j.Nombre ?? j.nombre ?? `Jugador ${i + 1}`,
        Avatar: j.Avatar ?? j.avatar ?? null,
        PosicionTurnos: j.PosicionTurnos ?? j.PosicionTurno ?? j.posicionTurno ?? (i + 1),
        IdPartida: j.IdPartida ?? this.partidaId,
        PuntosAcumulados: j.PuntosAcumulados ?? j.puntosAcumulados ?? 0,
        Active: j.Active ?? j.active ?? 1
      }))
      .filter(j => j.Active == 1)
      .sort((a, b) => (a.PosicionTurnos ?? 9999) - (b.PosicionTurnos ?? 9999));

   if (!this.modoLocal2Jugadores) {
  if (this.estadoPartida?.TurnoActual != null) {
    if (Number.isInteger(this.estadoPartida.TurnoActual)) {
      this.turnoActualIndex = Math.max(
        0,
        Math.min(this.jugadores.length - 1, Number(this.estadoPartida.TurnoActual))
      );
    } else {
      const idx = this.jugadores.findIndex(j => j.Id === Number(this.estadoPartida.TurnoActual));
      this.turnoActualIndex = idx >= 0 ? idx : 0;
    }
  } else {
    this.turnoActualIndex = 0;
  }
}

    await this.cargarRondaActual();

    console.log('Estado de partida cargado:', {
      partida: this.estadoPartida,
      jugadores: this.jugadores.length,
      ronda: this.rondaActual
    });
  } catch (error) {
    console.error('Error cargando estado de partida:', error);
    // ⚠️ No relances: deja continuar en “modo local”
  }
}
async cargarRondaActual() {
  const is404 = (e) => (e && (/not\s*found/i.test(String(e.message)) || e.status === 404));
  try {
    const ronda = await window.partidaService.getRondaActual(this.partidaId);
    if (ronda && (ronda.Id ?? ronda.id)) {

       const rid = Number(ronda.Id ?? ronda.id);
      if (this._rondasCerradasLocal.has(rid)) {
        console.warn('[GF] Ignoro ronda cerrada en local aún no reflejada por backend:', rid);
        return; // ✅ mantené la ronda que ya creaste localmente
      }
      this.rondaActual = ronda;
     const num = Number(ronda.NumeroRonda ?? ronda.numeroRonda ?? 1);
      this.rondaActualNumero = Math.max(this.rondaActualNumero || 1, num);

      await this.cargarCartasJugadasRonda();
      this.cardSelection?.setRondaActual?.(this.rondaActual);

    } else {
      this.rondaActual = null;
      this.cartasJugadasRonda = [];

    }
  } catch (e) {
    if (is404(e)) {
      console.warn('[GF] Ronda actual 404: usando ronda local');
      this.rondaActual = {
        Id: 0,
        NumeroRonda: this.rondaActualNumero,
        Estado: 'Esperando',
        IdJugadorQueElige: this.jugadores[this.turnoActualIndex]?.Id ?? this.jugadorActualId
      };
      this.cartasJugadasRonda = [];
      this.cardSelection?.setRondaActual?.(this.rondaActual);

    } else {
      this.rondaActual = null;
      this.cartasJugadasRonda = [];
    }
  }
}

  async cargarCartasJugadasRonda() {
    if (!this.rondaActual) return;
    const rondaId = Number(this.rondaActual.Id ?? this.rondaActual.id);
    if (!rondaId) return;
    try {
      const jugadas = await window.partidaService.getJugadasByRonda(rondaId);
      this.cartasJugadasRonda = Array.isArray(jugadas) ? jugadas : [];
    } catch (e) {
      console.error('Error cargando cartas jugadas:', e);
      this.cartasJugadasRonda = [];
    }
  }

  // ===================== CONTROLADORES AUX =====================
  async inicializarControladores() {
  try {
      if (typeof CardSelectionManager !== 'undefined') {
      this.cardSelection = new CardSelectionManager(this);
      await this.cardSelection.init();
      if (this.rondaActual) this.cardSelection.setRondaActual(this.rondaActual);
    }
    if (typeof BattleComparator !== 'undefined') {
      this.battleComparator = new BattleComparator(this);
      await this.battleComparator.init();
    }
    if (typeof TurnIndicator !== 'undefined') {
      this.turnIndicator = new TurnIndicator(this);
      await this.turnIndicator.init();
    }
    if (typeof RankingFinalDisplay !== 'undefined') {
      this.rankingDisplay = new RankingFinalDisplay(this);
      await this.rankingDisplay.init();
    }
    console.log('Controladores auxiliares inicializados');
  } catch (error) {
    console.error('Error inicializando controladores:', error);
  }
}

  // ===================== INTERFAZ =====================
  configurarInterfazInicial() {
    this.actualizarInfoRonda();
    this.turnIndicator?.actualizarIndicadores();
    this.ocultarElementosComparacion();
  }

  actualizarInfoRonda() {
    const rondaElement = document.querySelector('.numero');
    if (rondaElement) rondaElement.textContent = this.rondaActualNumero;
  }

  ocultarElementosComparacion() {
    ['.batalla-comparacion', '.resultado-ronda', '.ranking-final'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.style.display = 'none';
    });
  }

  mostrarMensajeEspera() {
    const message = `Esperando a que los demás jugadores jueguen... (${this.cartasJugadasRonda.length}/${this.jugadores.length})`;
    console.log('esperando', message);
  }

  // ===================== FASES =====================
  async determinarFaseActual() {
    if (!this.estadoPartida) return;

    const estado = this.estadoPartida.Estado ?? this.estadoPartida.estado;

    if (String(estado).toLowerCase() === 'finalizada') {
      this.faseActual = 'FINALIZADA';
      await this.mostrarRankingFinal();
      return;
    }

    if (!this.rondaActual) {
      this.faseActual = 'SELECCIONANDO_CARTA';
      await this.iniciarNuevaRonda();
      await this.actualizarInterfazSegunFase(); // 👈 AQUÍ
      return;
    }

      // Si cerramos la ronda en local y el backend aún no lo refleja, no regreses a COMPARANDO
  const rIdLocal = Number(this.rondaActual?.Id ?? this.rondaActual?.id ?? 0);

  if (rIdLocal && this._rondasCerradasLocal.has(rIdLocal)) {
    this.faseActual = 'SELECCIONANDO_CARTA';
      await this.actualizarInterfazSegunFase();   // ← AÑADE ESTO
    return; // ✅ no crear otra ronda desde acá
  }
    const estadoRonda = this.rondaActual.Estado ?? this.rondaActual.estado ?? 'Esperando';
    const todosHanJugado = this.cartasJugadasRonda.length >= this.jugadores.length;

    if (todosHanJugado && String(estadoRonda).toLowerCase() === 'enprogreso') {
      this.faseActual = 'COMPARANDO';
      await this.compararCartas();
    } else if (String(estadoRonda).toLowerCase() === 'finalizada') {
      this.faseActual = 'MOSTRANDO_RESULTADO';
      await this.mostrarResultadoRonda();
    } else {
      const yaJugo = this.cartasJugadasRonda.some(j => Number(j.IdJugador ?? j.idJugador) === this.jugadorActualId);
      this.faseActual = yaJugo ? 'ESPERANDO_JUGADORES' : 'SELECCIONANDO_CARTA';
    }

    console.log('Fase actual determinada:', this.faseActual);
    await this.actualizarInterfazSegunFase();
  }

 // --- NUEVA RONDA ---
async iniciarNuevaRonda() {
  try {
    console.log('Iniciando nueva ronda:', this.rondaActualNumero);
    const jugadorQueElige = this.jugadores[this.turnoActualIndex];

    // 👇 importante en modo local con 2 jugadores en el mismo navegador
    if (this.modoLocal2Jugadores) {
      this.jugadorActualId = Number(jugadorQueElige?.Id ?? this.jugadorActualId);
    }

    const body = {
      IdPartida: this.partidaId,
      NumeroRonda: this.rondaActualNumero,
      AtributoCompetido: null,
      IdJugadorQueElige: Number(jugadorQueElige?.Id ?? this.jugadorActualId),
      Estado: 'Esperando',
      FechaInicio: new Date().toISOString(),
      Active: 1
    };

    try {
      this.rondaActual = await window.partidaService.crearRonda(body);
      // 🔁 si no vino Id, intenta leer la ronda actual del backend
      const rid = Number(this.rondaActual?.Id ?? this.rondaActual?.id ?? 0);
      if (!rid) {
        const fallback = await window.partidaService.getRondaActual(this.partidaId).catch(() => null);
        if (fallback && (fallback.Id ?? fallback.id)) this.rondaActual = fallback;
      }
    } catch (e) {
      console.warn('[GF] POST /Ronda falló: creando ronda local', e);
      this.rondaActual = { Id: 0, ...body };
    }

    this.cartasJugadasRonda = [];
    this.actualizarInfoRonda();
    this.cardSelection?.setRondaActual?.(this.rondaActual);
    this.cardSelection?.setSeleccionHabilitada?.(this._puedeSeleccionarCarta());
    this._pintaTurno?.();
    this._forzarModalAtributo();
    console.log('Nueva ronda preparada:', this.rondaActual);
  } catch (error) {
    console.error('Error iniciando nueva ronda:', error);
  }
}

// --- FIJAR ATRIBUTO EN RONDA ---
// --- FIJAR ATRIBUTO EN RONDA ---
// GameFlowController.js
async setAtributoCompetido(atributo) {
  if (!this.rondaActual) return;

  const attrKey = String(atributo || '').toLowerCase().replace('defenza','defensa');
  if (!attrKey) return;
  if (this.rondaActual.AtributoCompetido ?? this.rondaActual.atributoCompetido) return;

  const idRonda = Number(this.rondaActual.Id ?? this.rondaActual.id) || 0;

  // ⛔ Si la ronda es "local" (id 0), no intentes pegarle al backend:
  if (!idRonda) {
    this.rondaActual = { ...this.rondaActual, AtributoCompetido: attrKey, Estado: 'EnProgreso' };
    this.cardSelection?.setRondaActual?.(this.rondaActual);
    this.cardSelection?.setSeleccionHabilitada?.(this._puedeSeleccionarCarta());
    return;
  }

  // ✅ Sólo si hay id real, intentá API:
  try {
    await window.partidaService.elegirAtributoEnRonda({
      idRonda, partidaId: this.partidaId, jugadorId: this.jugadorActualId, atributo: attrKey
    });
  } catch (e) {
    console.warn('[GF] elegirAtributoEnRonda falló, intento legacy:', e);
    try {
      const url = buildUrl(API_ENDPOINTS.GF_PARTIDA_ELEGIR_ATRIBUTO);
      await apiPost(url, { partidaId: this.partidaId, jugadorId: this.jugadorActualId, atributo: attrKey });
    } catch (_) {}
  }

  this.rondaActual = { ...this.rondaActual, AtributoCompetido: attrKey, Estado: 'EnProgreso' };
  this.cardSelection?.setRondaActual?.(this.rondaActual);
  this.cardSelection?.setSeleccionHabilitada?.(this._puedeSeleccionarCarta());
}





  esJugadorQueEligeAtributo() {
    if (!this.rondaActual) return false;
    const id = Number(this.rondaActual.IdJugadorQueElige ?? this.rondaActual.idJugadorQueElige);
    return id === this.jugadorActualId;
  }

  jugadorActualYaJugo() {
    return this.cartasJugadasRonda.some(j => Number(j.IdJugador ?? j.idJugador) === this.jugadorActualId);
  }

async onCartaSeleccionada(cartaJugadorId, valorAtributo) {
  try {
    console.log('Carta seleccionada:', cartaJugadorId, 'Valor:', valorAtributo);

    const body = {
      IdRonda: Number(this.rondaActual.Id ?? this.rondaActual.id),
      IdJugador: this.jugadorActualId,
      IdCartaJugador: Number(cartaJugadorId),
      ValorAtributo: Number(valorAtributo),
      
    };

    // 👇 SOLO una creación de jugada
    const jugada = await window.partidaService.crearJugada(body);
    const jugadaId = Number(jugada?.Id ?? jugada?.id ?? 0);

    try {
      await window.partidaService.marcarCartaUsada(Number(cartaJugadorId), {
        usada: 1,
        rondaUsada:  Number(this.rondaActual.NumeroRonda ?? this.rondaActualNumero), // <- AQUÍ
        jugadaId: jugadaId || undefined
      });
    } catch {}

    await this.cargarCartasJugadasRonda();

    // (opcional) refrescar la mano al instante
    this.cardSelection?.actualizarEstadoCartas?.();

    this.faseActual = 'ESPERANDO_JUGADORES';
    await this.actualizarInterfazSegunFase();

    console.log('Jugada registrada correctamente');
  } catch (error) {
    console.error('Error procesando carta seleccionada:', error);
    throw error;
  }
}


async onAtributoSeleccionado(atributo) {
  try {
    // sólo quien elige debería llamar a esto
    if (!this.esJugadorQueEligeAtributo()) return;
    await this.setAtributoCompetido(atributo);
    console.log('Atributo registrado en la ronda:', atributo);
  } catch (error) {
    console.error('Error procesando atributo seleccionado:', error);
    throw error;
  }
}
async onCartaConfirmada(payload) {
  try {
    // 1) Fijar atributo si aún no estaba
    await this.setAtributoCompetido(payload.atributoKey);

    // 2) Crear jugada
    let jugadaResp = null;
    try {
      jugadaResp = await window.partidaService.crearJugada({
        IdRonda: Number(this.rondaActual.Id ?? this.rondaActual.id),
        IdJugador: Number(payload.jugadorId),
        IdCartaJugador: Number(payload.cartaJugadorId),
        ValorAtributo: Number(payload.valor),
      });
    } catch (e) {
      console.warn('[GF] crearJugada falló:', e);
    }

    // 3) Marcar carta usada
    const jugadaId = Number(jugadaResp?.Id ?? jugadaResp?.id ?? 0);
    try {
      await window.partidaService.marcarCartaUsada(Number(payload.cartaJugadorId), {
      usada: 1,
      rondaUsada: Number(this.rondaActual.NumeroRonda ?? this.rondaActualNumero),
      jugadaId: jugadaId || undefined
      });
    } catch (e) {
      console.warn('[GF] marcarCartaUsada falló:', e);
    }

    // 4) Refrescar y seguir flujo
    await this.cargarCartasJugadasRonda();

    const roundKey = String(this.rondaActual?.Id ?? payload.rondaId ?? 'r?');
    if (!this.selecciones.has(roundKey)) this.selecciones.set(roundKey, new Map());
    this.selecciones.get(roundKey).set(Number(payload.jugadorId), payload);

    const jugadas = this.selecciones.get(roundKey);
    const total   = this.jugadores.length;

    if (jugadas.size >= total) {
      const [p1, p2] = [...jugadas.values()];
      const attr = (p1.atributoKey || '').toLowerCase();
      let ganadorId = 0;
      try {
        if (this.battleComparator?.compare) {
          ganadorId = await this.battleComparator.compare(p1, p2, attr);
        } else {
          ganadorId = (Number(p1.valor) === Number(p2.valor)) ? 0
                     : (Number(p1.valor) > Number(p2.valor) ? p1.jugadorId : p2.jugadorId);
        }
      } catch {
        ganadorId = (Number(p1.valor) === Number(p2.valor)) ? 0
                   : (Number(p1.valor) > Number(p2.valor) ? p1.jugadorId : p2.jugadorId);
      }
      await this.onRondaTerminada(ganadorId);
      this.selecciones.delete(roundKey);
    } else {
      if (this.modoLocal2Jugadores) {
        this.turnoActualIndex = (this.turnoActualIndex + 1) % total;
        this.jugadorActualId  = Number(this.jugadores[this.turnoActualIndex]?.Id);
        this.cardSelection?.setRondaActual?.(this.rondaActual);
        await this.cardSelection?.actualizarEstadoCartas?.();
        this.cardSelection?.unlockForOtherPlayer?.();
        this.cardSelection?.setSeleccionHabilitada?.(this._puedeSeleccionarCarta());
        this._pintaTurno?.();
        this.iniciarTemporizador(10);
      } else {
        this.faseActual = 'ESPERANDO_JUGADORES';
        await this.actualizarInterfazSegunFase();
      }
    }
  } catch (e) {
    console.error('onCartaConfirmada error:', e);
  }
}


  async compararCartas() {
    try {
      console.log('Comparando cartas de la ronda...');
      if (this.battleComparator) {
        const atributo = this.rondaActual.AtributoCompetido ?? this.rondaActual.atributoCompetido;
        await this.battleComparator.mostrarComparacion(this.cartasJugadasRonda, atributo);
      }
    } catch (error) {
      console.error('Error comparando cartas:', error);
    }
  }

  async mostrarResultadoRonda() {
    console.log('Mostrando resultado de la ronda (stub).');
  }

  // GameFlowController.js
async onRondaTerminada(ganadorId) {
  try {
    console.log('Ronda terminada. Ganador:', ganadorId);

    const idRonda = Number(this.rondaActual.Id ?? this.rondaActual.id);
    const esEmpate = !ganadorId || Number(ganadorId) === 0;

    // datos opcionales del ganador
    let valorAtributoGanador = null;
    let idCartaJugadorGanadora = null;
    if (!esEmpate) {
      const ganadora = (this.cartasJugadasRonda || [])
        .find(j => Number(j.IdJugador ?? j.idJugador) === Number(ganadorId));
      if (ganadora) {
        valorAtributoGanador = Number(ganadora.ValorAtributo ?? ganadora.valorAtributo ?? null);
        idCartaJugadorGanadora = Number(ganadora.IdCartaJugador ?? ganadora.idCartaJugador ?? null);
      }
    }

    const payloadUpdate = {
      ...this.rondaActual,
      IdGanador: esEmpate ? null : Number(ganadorId),
      Estado: 'Finalizada',
      FechaFin: new Date().toISOString(),
      ValorAtributoGanador: valorAtributoGanador,
      IdCartaJugadorGanadora: idCartaJugadorGanadora
    };

    // intenta actualizar backend; si da 405 seguimos local
    try {
      await window.partidaService.actualizarRonda(idRonda, payloadUpdate);
    } catch (e) {
      console.warn('[GF] actualizarRonda falló (seguimos local):', e);
    }

    // ✅ fuerza estado local finalizado (para que el polling no te devuelva a COMPARANDO)
    this.rondaActual = { ...(this.rondaActual || {}), ...payloadUpdate };

    // marca esta ronda como cerrada en local
    if (idRonda) this._rondasCerradasLocal.add(idRonda);

    // limpia comparación y estado para que no re-detecte “2 jugadas”
    try { this.battleComparator?.ocultar?.(); } catch {}
    this.cartasJugadasRonda = [];

    // pausa el polling un instante para evitar “rebotes”
    this.pausarPolling(2000);

    // siguiente paso
    if (this.rondaActualNumero >= 8) {
      await this.finalizarPartida();
    } else {
      await this.prepararSiguienteRonda();
    }
  } catch (error) {
    console.error('Error procesando resultado de ronda:', error);
  }
}
  async prepararSiguienteRonda() {
  this.turnoActualIndex = (this.turnoActualIndex + 1) % this.jugadores.length;

  // 👇 asegura que el “dueño del turno” sea el jugador actual en el front
  if (this.modoLocal2Jugadores) {
    this.jugadorActualId = Number(this.jugadores[this.turnoActualIndex]?.Id ?? this.jugadorActualId);
  }

  this.rondaActualNumero++;
  setTimeout(async () => {
    await this.iniciarNuevaRonda();
    this.faseActual = 'SELECCIONANDO_CARTA';
    await this.actualizarInterfazSegunFase();
  }, 1200);
}

  async finalizarPartida() {
    try {
      console.log('Finalizando partida...');
      const url = buildUrl(API_ENDPOINTS.PARTIDA_BY_ID, { id: this.partidaId });
      const update = { ...this.estadoPartida, Estado: 'Finalizada', FechaFin: new Date().toISOString() };
      await apiPut(url, update);
      this.faseActual = 'FINALIZADA';
      await this.mostrarRankingFinal();
    } catch (error) {
      console.error('Error finalizando partida:', error);
    }
  }

  async mostrarRankingFinal() {
    if (this.rankingDisplay) await this.rankingDisplay.mostrar();
  }

async actualizarInterfazSegunFase() {
  console.log('Actualizando interfaz para fase:', this.faseActual);
  switch (this.faseActual) {
      case 'SELECCIONANDO_CARTA': {
      this.cardSelection?.setRondaActual?.(this.rondaActual);
      this.cardSelection?.unlockForOtherPlayer?.();   // evita lock residual de la otra selección
      this.cardSelection?.setSeleccionHabilitada?.(this._puedeSeleccionarCarta());
      this.iniciarTemporizador(10);
      this._pintaTurno?.();
      this._forzarModalAtributo();   // 👈 FALTA ESTA LÍNEA
      break;
    }

    case 'ESPERANDO_JUGADORES':
      this.cardSelection?.deshabilitarSeleccion();
      this.mostrarMensajeEspera();
      this.detenerTemporizador();
      break;
    case 'COMPARANDO':
      this.detenerTemporizador();
      await this.compararCartas();
      break;
    case 'FINALIZADA':
      this.detenerTemporizador();
      await this.mostrarRankingFinal();
      break;
    case 'MOSTRANDO_RESULTADO':
      this.detenerTemporizador();
      await this.mostrarResultadoRonda();
      break;
  }
  this.turnIndicator?.actualizarIndicadores();
}

  // ===================== CRONÓMETRO =====================
  iniciarTemporizador(segundos) {
    this.detenerTemporizador();
    this.tiempoRestante = Number(segundos) || 0;
    this._pintaCronometro();
    this.timerId = setInterval(() => {
      this.tiempoRestante -= 1;
      this._pintaCronometro();
      if (this.tiempoRestante <= 0) {
        this.detenerTemporizador();
        console.log('⏱️ Tiempo agotado');
        this.cardSelection?.deshabilitarSeleccion();
      }
    }, 1000);
  }

  detenerTemporizador() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
  }

  _pintaCronometro() {
    const el = document.getElementById('cronometro-2');
    if (el) el.textContent = String(this.tiempoRestante);
  }
    _pintaTurno() {
    const el = document.getElementById('turno-actual') || document.querySelector('.turno-actual');
    if (!el) return;
    const owner = this.jugadores[this.turnoActualIndex];
    el.textContent = `Le toca: ${owner?.Nombre ?? 'Jugador'}`;
  }
  // ===================== POLLING / ESTADO =====================
  
  getEstadoActual() {
    return {
      partidaId: this.partidaId,
      jugadorActualId: this.jugadorActualId,
      faseActual: this.faseActual,
      rondaActual: this.rondaActualNumero,
      turnoActual: this.turnoActualIndex,
      jugadores: this.jugadores,
      cartasJugadas: this.cartasJugadasRonda.length,
      esElQueElige: this.esJugadorQueEligeAtributo(),
      yaJugo: this.jugadorActualYaJugo()
    };
  }

  destroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.detenerTemporizador();
    this.cardSelection?.destroy?.();
    this.battleComparator?.destroy?.();
    this.turnIndicator?.destroy?.();
    this.rankingDisplay?.destroy?.();
    console.log('GameFlowController destruido');
  }


_puedeSeleccionarCarta() {
  if (!this.rondaActual) return false;

  const turnOwnerId = Number(
    this.rondaActual?.IdJugadorQueElige ??
    this.jugadores[this.turnoActualIndex]?.Id ??
    0
  );

  const atributoFijo = !!(this.rondaActual?.AtributoCompetido ?? this.rondaActual?.atributoCompetido);
  const yaJugoEsteJugador = this.jugadorActualYaJugo();

  // Si NO hay atributo fijado: sólo el que elige puede tirar.
  if (!atributoFijo) return this.jugadorActualId === turnOwnerId;

  // Si YA hay atributo fijado: cualquiera que aún no haya jugado puede tirar.
  return !yaJugoEsteJugador;
}
  _forzarModalAtributo() {
    const attr = this.rondaActual?.AtributoCompetido ?? this.rondaActual?.atributoCompetido;
    if (!attr && this.esJugadorQueEligeAtributo()) {
      this.cardSelection?.mostrarSeleccionAtributo?.();
      this.cardSelection?.mostrarMensaje?.('Elige el atributo para competir y luego confirma la carta.', 'info');
    }
  }

pausarPolling(ms = 2000) {
  this._pausePolling = true;
  setTimeout(() => { this._pausePolling = false; }, ms);
}

iniciarPolling() {
  if (this.pollingInterval) clearInterval(this.pollingInterval);
  this.pollingInterval = setInterval(async () => {
    try {
      if (this._pausePolling) return; // ✅ clave
      await this.cargarEstadoPartida();
      await this.determinarFaseActual();
    } catch (error) {
      console.error('Error en polling:', error);
    }
  }, 3000);
}



}

window.GameFlowController = GameFlowController;
if (typeof module !== 'undefined' && module.exports) module.exports = GameFlowController;
