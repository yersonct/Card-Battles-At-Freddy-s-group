// js/Partida/CardSelectionManager.js
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.jfif', '.bmp', '.avif'];
class CardSelectionManager {
  constructor(gameFlowController) {
    this.gameFlow = gameFlowController;

    // Estado de selección
    this.cartaSeleccionada = null;
    this.atributoSeleccionado = null;
    this.seleccionHabilitada = false;
    this.mostrandoSeleccionAtributo = false;

    // Datos
    this.cartasJugador = [];
    this.atributosDisponibles = ['vida', 'defensa', 'defenza', 'velocidad', 'ataque', 'poder', 'terror'];

    console.log('CardSelectionManager inicializado');

    this.jugadorId = Number(this.gameFlow?.jugadorActualId ?? 0);
    this.locked = false;                  // jugador confirmó su selección en esta ronda// 👇 nuevo: guardas handlers para poder desuscribir
      this._handlers = {};
    this._bound = false;
    this.roundId = null;                  // para resetear estado al cambiar de ronda
  }
  // Extensiones que vamos a probar


  async init() {
    try {
      await this.cargarCartasJugador();
      this.configurarEventListeners();
      this.crearInterfazSeleccion();
      try {
          if (this.gameFlow?.rondaActual) {
            this.setRondaActual(this.gameFlow.rondaActual);
          }
      } catch (e) {
        console.warn('[CardSelection] No se pudo sincronizar ronda inicial:', e);
      }
      console.log('CardSelectionManager inicializado correctamente');
    } catch (error) {
      console.error('Error inicializando CardSelectionManager:', error);
      throw error;
    }
  }

  // ===================== CARGA DE CARTAS =====================
  async cargarCartasJugador() {
    const partidaId = Number(this.gameFlow.partidaId);
    const jugadorId = Number(this.gameFlow.jugadorActualId);

    if (!window.partidaService) {
      console.warn('[CardSelectionManager] Falta window.partidaService');
      this.cartasJugador = [];
      return;
    }

    try {
      // 1) Intentamos endpoint “custom”
      let entries;
      try {
        entries = await window.partidaService.getCartasJugador(partidaId, jugadorId);
      if (!entries || !entries.length) {
        // si vino vacío, intentamos la tabla simple
        entries = await window.partidaService.getCartasJugadorDesdeTabla(partidaId, jugadorId);
      }
      } catch {
        // 2) Fallback: tabla CartaJugador
        entries = await window.partidaService.getCartasJugadorDesdeTabla(partidaId, jugadorId);
      }

      // 3) Catálogo para stats
      const catalogo = await window.partidaService.getCartasCatalogo();
      const byId = new Map();
      (Array.isArray(catalogo) ? catalogo : []).forEach(c => {
        const _id = Number(c.Id ?? c.id ?? c.ID);
        if (_id) byId.set(_id, c);
      });

      // 4) Normalizar
      const normalizadas = (Array.isArray(entries) ? entries : [])
        .filter(e => (e.Active ?? e.active ?? 1) == 1)
        .map((e, i) => {
          const CartaJugadorId = Number(e.Id ?? e.id ?? 0);
          const IdCarta = Number(e.IdCarta ?? e.idCarta ?? 0);
          const PosicionEnMazo = Number(e.PosicionEnMazo ?? e.posicionEnMazo ?? (i + 1));
          const Usada = Number(e.Usada ?? e.usada ?? 0) === 1;
          const RondaUsada = Number(e.RondaUsada ?? e.rondaUsada ?? 0) || null;

          const cat = byId.get(IdCarta) || {};
          const Carta = {
            Id: IdCarta,
             // 👇 usa || para que "" haga fallback
  Nombre: (cat.Nombre || cat.nombre || `Carta ${i + 1}`),

  // 👇 usa ||; si viene "", lo tratamos como “no hay imagen”
  Imagen: (cat.Imagen || cat.imagen || null),
            Rareza: cat.Rareza ?? cat.rareza ?? '',
            Categoria: cat.Categoria ?? cat.categoria ?? '',
            Vida: Number(cat.Vida ?? cat.vida ?? 0),
            Defenza: Number(cat.Defenza ?? cat.Defensa ?? cat.defenza ?? cat.defensa ?? 0),
            Defensa: Number(cat.Defensa ?? cat.defensa ?? cat.Defenza ?? cat.defenza ?? 0),
            Velocidad: Number(cat.Velocidad ?? cat.velocidad ?? 0),
            Ataque: Number(cat.Ataque ?? cat.ataque ?? 0),
            Poder: Number(cat.Poder ?? cat.poder ?? 0),
            Terror: Number(cat.Terror ?? cat.terror ?? 0),
            Active: (cat.Active ?? 1)
          };

          return { CartaJugadorId, IdCarta, PosicionEnMazo, Usada, RondaUsada, Carta };
        })
        .sort((a, b) => (a.PosicionEnMazo ?? 0) - (b.PosicionEnMazo ?? 0));

      // Mano = solo no usadas
      this.cartasJugador = normalizadas.filter(x => !x.Usada);
  if (!this.cartasJugador.length) {
  console.warn('[Cards] sin cartas del backend: pintando dummies');
  this.cartasJugador = this.crearCartasDummy(8);
}

this.pintarCartas();

      console.log('Cartas del jugador (no usadas) cargadas:', this.cartasJugador.length);
    } catch (error) {
      console.error('Error cargando cartas del jugador:', error);
      this.cartasJugador = [];
      throw error;
    }
  }

  // ===================== UI / EVENTOS =====================
configurarEventListeners() {
  if (this._bound) return;
   this._handlers = this._handlers || {};
  this._handlers.onDocClick = (event) => {
    const carta = event.target.closest('.carta');
    if (carta && this.seleccionHabilitada) {
      this.onCartaClick(carta);
      return;
    }
    if (event.target.classList.contains('btn-atributo')) {
      const atributo = String(event.target.dataset.atributo || '').toLowerCase();
      this.onAtributoClick(atributo);
      return;
    }
    if (event.target.classList.contains('btn-confirmar-carta')) {
      this.confirmarSeleccionCarta();
      return;
    }
  };

  document.addEventListener('click', this._handlers.onDocClick);
  this._bound = true;
}

  crearInterfazSeleccion() {
    // Modal atributos
    let contenedorAtributos = document.querySelector('.seleccion-atributos');
    if (!contenedorAtributos) {
      contenedorAtributos = document.createElement('div');
      contenedorAtributos.className = 'seleccion-atributos';
      contenedorAtributos.style.display = 'none';
      contenedorAtributos.innerHTML = `
        <div class="modal-atributos">
          <div class="modal-content">
            <h3>Elige el atributo para competir:</h3>
            <div class="botones-atributos">
              ${this.atributosDisponibles.map(attr => `
                <button class="btn-atributo" data-atributo="${attr}">
                  ${attr.toUpperCase()}
                </button>
              `).join('')}
            </div>
          </div>
        </div>`;
      document.body.appendChild(contenedorAtributos);
    }

    // Info carta
    let indicadorCarta = document.querySelector('.carta-seleccionada-info');
    if (!indicadorCarta) {
      indicadorCarta = document.createElement('div');
      indicadorCarta.className = 'carta-seleccionada-info';
      indicadorCarta.style.display = 'none';
      const contenedorJuego = document.querySelector('.container-completo');
      if (contenedorJuego) contenedorJuego.appendChild(indicadorCarta);
    }
  }

  habilitarSeleccion() {
    this.seleccionHabilitada = true;
    this.pintarCartas();             // por si llegó tarde
    this.resaltarCartasDisponibles();
    this.mostrarMensajeInstruccion();
    console.log('Selección de cartas habilitada');
  }

  deshabilitarSeleccion() {
    this.seleccionHabilitada = false;
    this.quitarResaltadoCartas();
    this.ocultarMensajeInstruccion();
    console.log('Selección de cartas deshabilitada');
  }

  // ===================== MANEJO DE CLICKS =====================
  async onCartaClick(cartaElement) {
    try {
      if (!this.seleccionHabilitada) return;

      const cjIdAttr = cartaElement.getAttribute('data-carta-jugador-id');
      const idxAttr  = cartaElement.getAttribute('data-carta-index');
      const usadaAttr = cartaElement.getAttribute('data-usada');
      if (usadaAttr === '1') { 
        this.mostrarError('Esta carta ya fue utilizada'); 
        return; 
      }
      let cartaJugador = null;
      if (cjIdAttr) {
        const cjId = Number(cjIdAttr);
        cartaJugador = this.cartasJugador.find(c => Number(c.CartaJugadorId) === cjId);
      }
      if (!cartaJugador && idxAttr) {
        const n = Number(idxAttr);
        cartaJugador = this.cartasJugador[n - 1];
      }

      if (!cartaJugador) { this.mostrarError('No se pudo identificar esta carta.'); return; }
      if (cartaJugador.Usada) { this.mostrarError('Esta carta ya fue utilizada'); return; }

      this.limpiarSeleccionAnterior();
      cartaElement.classList.add('carta-seleccionada');
      this.cartaSeleccionada = cartaJugador;

      this.mostrarInfoCartaSeleccionada(cartaJugador);

    const atributoYaDef = (this.gameFlow.rondaActual?.AtributoCompetido ?? this.gameFlow.rondaActual?.atributoCompetido ?? '');

    const elige = (typeof this.gameFlow?.esJugadorQueEligeAtributo === 'function')
      ? !!this.gameFlow.esJugadorQueEligeAtributo()
      : false;

    if (elige && !atributoYaDef) {
      this.mostrarSeleccionAtributo();
    } else {
      this.mostrarBotonConfirmar();
    }


      console.log('Carta seleccionada:', cartaJugador);
    } catch (error) {
      console.error('Error seleccionando carta:', error);
      this.mostrarError('Error seleccionando carta');
    }
  }

 // js/Partida/CardSelectionManager.js
async onAtributoClick(atributo) {
  try {
    const normalizado = String(atributo).toLowerCase().replace('defenza', 'defensa');
    this.atributoSeleccionado = normalizado;

    // Notifica al GF (fijará el atributo en la ronda si corresponde)
    await this.gameFlow.onAtributoSeleccionado(normalizado);

    // Cierra modal
    this.ocultarSeleccionAtributo();

    // Si ya había carta seleccionada, dejamos listo para confirmar.
    if (this.cartaSeleccionada) {
      this.mostrarBotonConfirmar();
    } else {
      // Caso típico: abrimos el modal al inicio de la ronda
      this.mostrarMensaje(
        `Atributo elegido: ${normalizado.toUpperCase()}. Ahora selecciona tu carta.`,
        'info'
      );
    }

    console.log('Atributo seleccionado:', normalizado);
  } catch (error) {
    console.error('Error seleccionando atributo:', error);
    this.mostrarError('Error seleccionando atributo');
  }
}


async confirmarSeleccionCarta() {
  try {
    if (!this.cartaSeleccionada) {
      this.mostrarError('No hay carta seleccionada');
      return;
    }
    if (this.locked) {
      this.mostrarMensaje('Ya confirmaste tu selección para esta ronda', 'info');
      return;
    }

    // 1) Atributo: tomamos el de la ronda o el elegido localmente
    let atributoCompetir =
      (this.gameFlow.rondaActual?.AtributoCompetido ?? this.gameFlow.rondaActual?.atributoCompetido) ||
      this.atributoSeleccionado;

    // 2) Si todavía no hay atributo, reintenta refrescando la ronda
    if (!atributoCompetir) {
      if (typeof this.gameFlow?.cargarRondaActual === 'function') {
        await this.gameFlow.cargarRondaActual();
        this.setRondaActual(this.gameFlow.rondaActual);
      }
      atributoCompetir =
        (this.gameFlow.rondaActual?.AtributoCompetido ?? this.gameFlow.rondaActual?.atributoCompetido) ||
        this.atributoSeleccionado;
    }

    // 3) Si sigue sin atributo, guía al usuario
  // 3) Si sigue sin atributo, guía al usuario (o fallback dev)
    if (!atributoCompetir) {
      const soyQuienElige = (typeof this.gameFlow?.esJugadorQueEligeAtributo === 'function' &&
                            this.gameFlow.esJugadorQueEligeAtributo());

      if (soyQuienElige) {
        this.mostrarSeleccionAtributo();
        this.mostrarMensaje('Elige el atributo para competir y luego confirma la carta.', 'info');
        return;
      } else {
        // 🔧 Fallback para DEV: auto-fijar un atributo para no bloquear
        atributoCompetir = 'ataque';
        await this.gameFlow.setAtributoCompetido(atributoCompetir);
      }
    }

    // 4) Armar payload con valor del atributo
    const valorAtributo = this.obtenerValorAtributo(this.cartaSeleccionada, atributoCompetir);
    this.jugadorId = Number(this.gameFlow?.jugadorActualId ?? this.jugadorId);

    const payload = {
      jugadorId: this.jugadorId,
      rondaId: (this.gameFlow?.rondaActual?.Id ?? this.gameFlow?.rondaActual?.id ?? null),
      cartaJugadorId: this.cartaSeleccionada.CartaJugadorId,
      idCarta: this.cartaSeleccionada.IdCarta,
      atributoKey: String(atributoCompetir).toLowerCase(),
      valor: Number(valorAtributo) || 0,
    };

    // 5) Deshabilita botón para evitar doble envío
    const btn = document.querySelector('.btn-confirmar-carta');
    if (btn) btn.disabled = true;

    // 6) Notificar al orquestador (esto crea la jugada y marca la carta usada en backend)
    if (typeof this.gameFlow?.onCartaConfirmada === 'function') {
      await this.gameFlow.onCartaConfirmada(payload);
    } else {
      // Fallback legacy
      if (typeof this.gameFlow?.onAtributoSeleccionado === 'function') {
        await this.gameFlow.onAtributoSeleccionado(payload.atributoKey);
      }
      if (typeof this.gameFlow?.onCartaSeleccionada === 'function') {
        await this.gameFlow.onCartaSeleccionada(payload.cartaJugadorId, payload.valor);
      }
    }

    // 7) Si todo salió OK en backend, ahora sí bloqueamos y sacamos la carta de la mano
    this.locked = true;
    this.marcarCartaComoUsada();
    this.limpiarSeleccion();

    console.log('Carta confirmada y enviada', payload);
  } catch (error) {
    console.error('Error confirmando carta:', error);
    this.mostrarError('Error confirmando carta');
    // Rehabilita el botón si falló
    const btn = document.querySelector('.btn-confirmar-carta');
    if (btn) btn.disabled = false;
  }
}



  // ===================== UTILIDADES =====================
  obtenerValorAtributo(cj, atributo) {
  const carta = cj?.Carta || {};
  const a = String(atributo).toLowerCase();
  switch (a) {
    case 'vida':      return Number(carta.Vida ?? carta.vida ?? 0);
    case 'defensa':
    case 'defenza':   return Number(
                        carta.Defensa ?? carta.defensa ??
                        carta.Defenza ?? carta.defenza ?? 0
                      );
    case 'velocidad': return Number(carta.Velocidad ?? carta.velocidad ?? 0);
    case 'ataque':    return Number(carta.Ataque ?? carta.ataque ?? 0);
    case 'poder':     return Number(carta.Poder ?? carta.poder ?? 0);
    case 'terror':    return Number(carta.Terror ?? carta.terror ?? 0);
    default: return 0;
  }
}


  mostrarInfoCartaSeleccionada(cj) {
    const infoElement = document.querySelector('.carta-seleccionada-info');
    if (!infoElement) return;

    const c = cj?.Carta || {};
    const atributoElegido = (this.gameFlow.rondaActual?.AtributoCompetido ?? this.gameFlow.rondaActual?.atributoCompetido) || null;

    infoElement.innerHTML = `
      <div class="info-carta-container">
        <h4>Carta Seleccionada: ${c.Nombre ?? 'Carta'}</h4>
        <div class="atributos-carta">
          <div class="atributo"><span>Vida:</span> ${num(c.Vida)}</div>
          <div class="atributo"><span>Defensa:</span> ${num(c.Defensa ?? c.Defenza)}</div>
          <div class="atributo"><span>Velocidad:</span> ${num(c.Velocidad)}</div>
          <div class="atributo"><span>Ataque:</span> ${num(c.Ataque)}</div>
          <div class="atributo"><span>Poder:</span> ${num(c.Poder)}</div>
          <div class="atributo"><span>Terror:</span> ${num(c.Terror)}</div>
        </div>
        ${atributoElegido ? `<p class="atributo-competir">Se competirá en: <strong>${String(atributoElegido).toUpperCase()}</strong></p>` : ''}
      </div>
    `;
    infoElement.style.display = 'block';

    function num(v) { const n = Number(v); return Number.isFinite(n) ? n : '-'; }
  }

  mostrarSeleccionAtributo() {
    const modal = document.querySelector('.seleccion-atributos');
    if (modal) {
      modal.style.display = 'flex';
      this.mostrandoSeleccionAtributo = true;
    }
  }

  ocultarSeleccionAtributo() {
    const modal = document.querySelector('.seleccion-atributos');
    if (modal) {
      modal.style.display = 'none';
      this.mostrandoSeleccionAtributo = false;
    }
  }

  mostrarBotonConfirmar() {
    const prev = document.querySelector('.btn-confirmar-carta');
    if (prev) prev.remove();

    const btn = document.createElement('button');
    btn.className = 'btn-confirmar-carta';
    btn.textContent = 'CONFIRMAR CARTA';

    const info = document.querySelector('.carta-seleccionada-info');
    if (info) info.appendChild(btn);
  }

  // marcarCartaComoUsada() {
  //   const cartaElement = document.querySelector('.carta-seleccionada');
  //   if (cartaElement) {
  //     cartaElement.classList.add('carta-usada');
  //     cartaElement.classList.remove('carta-seleccionada');
  //     cartaElement.style.opacity = '0.5';
  //     cartaElement.style.transform = 'rotateY(180deg)';
  //     cartaElement.style.pointerEvents = 'none';
  //   }
  // }
  eliminarCartaDeMano(cartaJugadorId) {
    const idNum = Number(cartaJugadorId);
    this.cartasJugador = this.cartasJugador.filter(c => Number(c.CartaJugadorId) !== idNum);
    const el = document.querySelector(`.carta[data-carta-jugador-id="${idNum}"]`);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    this.pintarCartas();
  }

  // REEMPLAZA el método anterior por este:
marcarCartaComoUsada() {
   const idSel = this.cartaSeleccionada?.CartaJugadorId;
  if (!idSel) return;
  this.eliminarCartaDeMano(idSel);   // suficiente
}

  resaltarCartasDisponibles() {
    const cartas = document.querySelectorAll('.carta:not(.carta-usada)');
    cartas.forEach(c => c.classList.add('carta-disponible'));
  }

  quitarResaltadoCartas() {
    const cartas = document.querySelectorAll('.carta');
    cartas.forEach(c => c.classList.remove('carta-disponible'));
  }

  limpiarSeleccionAnterior() {
    document.querySelectorAll('.carta-seleccionada').forEach(e => e.classList.remove('carta-seleccionada'));
  }

  limpiarSeleccion() {
    this.cartaSeleccionada = null;
    this.atributoSeleccionado = null;
    this.limpiarSeleccionAnterior();
    this.ocultarSeleccionAtributo();

    const info = document.querySelector('.carta-seleccionada-info');
    if (info) info.style.display = 'none';
  }

  mostrarMensajeInstruccion() {
    const esQuienElige = (typeof this.gameFlow?.esJugadorQueEligeAtributo === 'function')
      ? !!this.gameFlow.esJugadorQueEligeAtributo()
      : false;
    const msg = esQuienElige
      ? 'Es tu turno: Selecciona tu carta y elige el atributo para competir'
      : 'Selecciona tu carta para esta ronda';
    this.mostrarMensaje(msg, 'info');
  }


    ocultarMensajeInstruccion() {
    document.querySelectorAll('.mensaje-instruccion').forEach(m => m.remove());
  }

  // --- NUEVO: helper para mostrar errores en la UI ---
  mostrarMensaje(texto, tipo = 'info') {
    document.querySelectorAll('.mensaje-instruccion').forEach(m => m.remove());

    const div = document.createElement('div');
    div.className = `mensaje-instruccion mensaje-${tipo}`;
    div.textContent = texto;

    const cont = document.querySelector('.container-completo');
    if (cont) cont.insertBefore(div, cont.firstChild);

    setTimeout(() => { if (div.parentNode) div.remove(); }, 5000);
  }
  mostrarError(texto) {
  console.error('[CardSelection][ERROR]', texto);
  this.mostrarMensaje(texto, 'error');
}

  async actualizarEstadoCartas() {
    await this.cargarCartasJugador();
  }

  getEstadoSeleccion() {
    return {
      cartaSeleccionada: this.cartaSeleccionada,
      atributoSeleccionado: this.atributoSeleccionado,
      seleccionHabilitada: this.seleccionHabilitada,
      mostrandoSeleccionAtributo: this.mostrandoSeleccionAtributo,
      cartasDisponibles: this.cartasJugador.filter(c => !c.Usada).length
    };
  }

 destroy() {
  this.limpiarSeleccion();
  this.deshabilitarSeleccion?.();

  if (this._bound) {
    document.removeEventListener('click', this._handlers.onDocClick);
    this._bound = false;
    this._handlers = {};
  }

  ['.seleccion-atributos', '.carta-seleccionada-info', '.mensaje-instruccion'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.remove();
  });
  console.log('CardSelectionManager destruido');
}

  // ===================== RENDER DE CARTAS =====================
 pintarCartas() {
  const root = document.querySelector('.contenedor-cartas-completo');
  if (!root) return;

  const loading = root.querySelector('.loading-cartas');
  if (loading) loading.remove();

  let grid = root.querySelector('.mano-cartas');
  if (!grid) {
    grid = document.createElement('div');
    grid.className = 'mano-cartas';
    root.appendChild(grid);
  }
  grid.innerHTML = '';

  if (!Array.isArray(this.cartasJugador) || !this.cartasJugador.length) {
    grid.innerHTML = `<div class="mensaje">No tienes cartas disponibles</div>`;
    return;
  }

  // 👇 AQUI va tu log + render
  this.cartasJugador.forEach((cj, i) => {
    const c = cj.Carta || {};
    console.debug('[Carta]', i + 1, { nombre: c.Nombre || c.nombre, imagen: c.Imagen || c.imagen });
    const el = this.crearCartaElemento(cj, i);
    grid.appendChild(el);
  });

  if (this.seleccionHabilitada) this.resaltarCartasDisponibles();
}


 crearCartaElemento(cj, idx) {
  const c = cj.Carta || {};
  const el = document.createElement('div');
  el.className = 'carta';
  el.setAttribute('data-carta-jugador-id', String(cj.CartaJugadorId));
  el.setAttribute('data-carta-index', String(idx + 1));
  el.setAttribute('data-usada', cj.Usada ? '1' : '0');

  el.innerHTML = `
    <div class="carta-wrap">
      <div class="carta-header">
        <span class="carta-nombre">${c.Nombre ?? 'Carta'}</span>
        ${c.Rareza ? `<span class="carta-rareza">${c.Rareza}</span>` : ''}
      </div>
      <div class="carta-imagen"><img alt="${c.Nombre ?? ''}"></div>
      <div class="carta-stats">
        <div class="stat"><span>VIDA</span><b>${num(c.Vida)}</b></div>
        <div class="stat"><span>DEF</span><b>${num(c.Defensa ?? c.Defenza)}</b></div>
        <div class="stat"><span>VEL</span><b>${num(c.Velocidad)}</b></div>
        <div class="stat"><span>ATQ</span><b>${num(c.Ataque)}</b></div>
        <div class="stat"><span>POD</span><b>${num(c.Poder)}</b></div>
        <div class="stat"><span>TER</span><b>${num(c.Terror)}</b></div>
      </div>
    </div>
  `;

  const img = el.querySelector('.carta-imagen img');
  this.setImageFromCard(img, cj);

  if (cj.Usada) {
    el.classList.add('carta-usada');
    el.style.opacity = '0.5';
    el.style.pointerEvents = 'none';
  }

  function num(v){ const n = Number(v); return Number.isFinite(n) ? n : '-'; }
  return el;
}


  resolveCartaImg(carta) {
    const img = carta.Imagen ?? carta.imagen;
    if (!img) return '../img/foto/default-card.jpg';

    if (typeof img === 'string') {
      const API_BASE = (window.API_CONFIG?.baseURL || '').replace(/\/+$/, '');
      const PUBLIC_BASE = API_BASE.replace(/\/api$/i, '');
      const baseName = String(img).split(/[\\/]/).pop();
      return `${PUBLIC_BASE}/img/foto/${encodeURIComponent(baseName)}`;
    }
    try {
      const u8 = Array.isArray(img) ? new Uint8Array(img) : new Uint8Array(Object.values(img));
      return `data:image/jpeg;base64,${this.arrayBufferToBase64(u8.buffer)}`;
    } catch {
      return '../img/foto/default-card.jpg';
    }
  }

  arrayBufferToBase64(buf) {
    let binary = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  // helper para cartas dummy
crearCartasDummy(n = 8) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({
      CartaJugadorId: 1000 + i,
      IdCarta: 2000 + i,
      PosicionEnMazo: i + 1,
      Usada: false,
      RondaUsada: null,
      Carta: {
        Id: 2000 + i,
        Nombre: `Dummy #${i + 1}`,
        Imagen: `../img/foto/cartas/${(i % 8) + 1}.jpg`,
        Rareza: ['C','R','SR'][i % 3],
        Categoria: 'Test',
        Vida: 20 + i,
        Defensa: 10 + i,
        Defenza: 10 + i,
        Velocidad: 5 + i,
        Ataque: 15 + i,
        Poder: 8 + i,
        Terror: 6 + i
      }
    });
  }
  return out;
}
setImageFromCard(imgEl, cj) {
  const c = cj?.Carta || {};
  const raw = c.Imagen || c.imagen || null;
  const nombre = c.Nombre || c.nombre || '';
  const idCarta = cj.IdCarta || c.Id || '';

  console.debug('[IMG raw]', { rawType: typeof raw, hasRaw: !!raw, nombre, idCarta });

  // 1) Si viene dataURL / bytes → directo
  const direct = this.buildImageUrl(raw);
  if (direct) {
    imgEl.src = direct;
    imgEl.onerror = () => this.tryNameBasedSources(imgEl, nombre, idCarta);
    return;
  }

  // 2) Si viene un string (ruta o nombre de archivo), probamos rutas + extensiones
  if (typeof raw === 'string' && raw.trim()) {
    this.tryPathBasedSources(imgEl, raw, nombre, idCarta);
    return;
  }

  // 3) Último recurso: por nombre + id, probando todas las extensiones
  this.tryNameBasedSources(imgEl, nombre, idCarta);
}

buildImageUrl(raw) {
  if (!raw) return null;

  // data:image/...
  if (typeof raw === 'string' && /^data:image\//i.test(raw)) return raw;

  // base64 “pelado”
  if (typeof raw === 'string') {
    const s = raw.replace(/\s+/g, '');
    if (/^[A-Za-z0-9+/=]+$/.test(s) && s.length > 100) {
      const mime = this.guessMimeFromBase64(s);
      return `data:${mime};base64,${s}`;
    }
  }

  // bytes: Uint8Array / ArrayBuffer / array / objeto {0:..}
  try {
    const u8 = this.toUint8Array(raw);
    if (u8 && u8.length > 4) {
      const mime = this.detectMime(u8) || 'image/jpeg';
      return URL.createObjectURL(new Blob([u8], { type: mime }));
    }
  } catch {}
  return null; // las rutas string las maneja tryPathBasedSources
}
tryPathBasedSources(imgEl, raw, nombre, idCarta) {
  const API_BASE    = (window.API_CONFIG?.baseURL || '').replace(/\/+$/, '');
  const PUBLIC_BASE = API_BASE.replace(/\/api$/i, '');           // http://localhost:7147
  const FRONT_DIR   = '../img/foto';
  const FRONT_DIR2  = '../img/foto/cartas';
  const PUB_DIR     = `${PUBLIC_BASE}/img/foto`;
  const PUB_DIR2    = `${PUBLIC_BASE}/img/foto/cartas`;

  const s0 = String(raw || '').trim().replace(/\\/g, '/');

  // Si es http(s), úsalo tal cual
  if (/^https?:\/\//i.test(s0)) {
    imgEl.src = s0;
    imgEl.onerror = () => this.tryNameBasedSources(imgEl, nombre, idCarta);
    return;
  }

  const candidates = [];

  // Ruta tal cual
  candidates.push(s0);

  // Si la ruta empieza por img/... prepende PUBLIC_BASE
  const s1 = s0.replace(/^\.{0,2}\//, ''); // quita ./ y ../
  if (/^img\//i.test(s1)) candidates.push(`${PUBLIC_BASE}/${s1}`);

  // Si NO tiene extensión, prueba todas
  const hasExt = /\.[a-z0-9]+$/i.test(s0);
  if (!hasExt) {
    const baseName = s0.split('/').pop() || '';
    for (const e of IMAGE_EXTS) {
      const fname = encodeURIComponent(baseName + e);
      candidates.push(`${FRONT_DIR}/${fname}`);
      candidates.push(`${FRONT_DIR2}/${fname}`);
      candidates.push(`${PUB_DIR}/${fname}`);
      candidates.push(`${PUB_DIR2}/${fname}`);
    }
  }

  // También intenta por nombre normalizado + id (por si raw no existe)
  const bases = this.nameToBasenames(nombre, idCarta);
  for (const b of bases) for (const e of IMAGE_EXTS) {
    const fname = encodeURIComponent(b + e);
    candidates.push(`${FRONT_DIR}/${fname}`);
    candidates.push(`${FRONT_DIR2}/${fname}`);
    candidates.push(`${PUB_DIR}/${fname}`);
    candidates.push(`${PUB_DIR2}/${fname}`);
  }

  // Fallback real
  candidates.push(`${FRONT_DIR}/default-card.jpg`);

  let i = 0;
  const next = () => {
    if (i >= candidates.length) { imgEl.src = `${FRONT_DIR}/default-card.jpg`; return; }
    imgEl.src = candidates[i++];
    imgEl.onerror = next;
  };
  next();
}


tryNameBasedSources(imgEl, nombre, idCarta) {
  const API_BASE    = (window.API_CONFIG?.baseURL || '').replace(/\/+$/, '');
  const PUBLIC_BASE = API_BASE.replace(/\/api$/i, '');
  const FRONT_DIR   = '../img/foto';
  const FRONT_DIR2  = '../img/foto/cartas';
  const PUB_DIR     = `${PUBLIC_BASE}/img/foto`;
  const PUB_DIR2    = `${PUBLIC_BASE}/img/foto/cartas`;

  const bases = this.nameToBasenames(nombre, idCarta);

  const candidates = [];
  for (const b of bases) for (const e of IMAGE_EXTS) {
    const fname = encodeURIComponent(b + e);
    candidates.push(`${FRONT_DIR}/${fname}`);
    candidates.push(`${FRONT_DIR2}/${fname}`);
    candidates.push(`${PUB_DIR}/${fname}`);
    candidates.push(`${PUB_DIR2}/${fname}`);
  }
  candidates.push(`${FRONT_DIR}/default-card.jpg`);

  let i = 0;
  const next = () => {
    if (i >= candidates.length) { imgEl.src = `${FRONT_DIR}/default-card.jpg`; return; }
    imgEl.src = candidates[i++]; imgEl.onerror = next;
  };
  next();
}

nameToBasenames(nombre, idCarta) {
  const out = [];
  const s = String(nombre || '').trim();
  if (s) {
    const norm  = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const clean = norm.replace(/[^\w\s-]/g, ' ');
    const words = clean.split(/\s+/).filter(Boolean);
    const lower = words.map(w => w.toLowerCase());
    const camel = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    out.push(
      words.join(' '),    // "Balloon Boy"
      lower.join(' '),    // "balloon boy"
      lower.join('-'),    // "balloon-boy"
      lower.join('_'),    // "balloon_boy"
      camel,              // "BalloonBoy"
      words.join('-')     // "Balloon-Boy"
    );
  }
  if (idCarta) out.push(String(idCarta));
  return Array.from(new Set(out));
}


// --- utils ---
guessMimeFromBase64(b64) {
  const p = b64.slice(0, 20);
  if (p.startsWith('/9j/'))   return 'image/jpeg';
  if (p.startsWith('iVBOR'))  return 'image/png';
  if (p.startsWith('R0lGOD')) return 'image/gif';
  if (p.startsWith('UklG') || p.startsWith('TU0A')) return 'image/webp';
  return 'image/jpeg';
}
toUint8Array(raw) {
  if (raw instanceof Uint8Array) return raw;
  if (raw instanceof ArrayBuffer) return new Uint8Array(raw);
  if (Array.isArray(raw)) return new Uint8Array(raw);
  if (typeof raw === 'object') return new Uint8Array(Object.values(raw));
  return null;
}
detectMime(u8) {
  if (u8[0]===0xFF&&u8[1]===0xD8&&u8[2]===0xFF) return 'image/jpeg';         // JPEG
  if (u8[0]===0x89&&u8[1]===0x50&&u8[2]===0x4E&&u8[3]===0x47) return 'image/png'; // PNG
  if (u8[0]===0x47&&u8[1]===0x49&&u8[2]===0x46&&u8[3]===0x38) return 'image/gif'; // GIF
  if (u8[0]===0x52&&u8[1]===0x49&&u8[2]===0x46&&u8[3]===0x46) return 'image/webp';// WebP
  return '';
}

setRondaActual(rondaObj) {
  const id  = Number(rondaObj?.Id ?? rondaObj?.id ?? 0);
  const num = Number(rondaObj?.NumeroRonda ?? rondaObj?.numeroRonda ?? 0);

  this._roundKey = this._roundKey || null;
  const newKey = `${id}|${num}`;

  if (this._roundKey !== newKey) {
    this._roundKey = newKey;
    this.roundId = id;

    // Reset completo para la nueva ronda
    this.locked = false;
    this.cartaSeleccionada = null;
    this.atributoSeleccionado = null;
    this.limpiarSeleccion();

    const atributoElegido = (rondaObj?.AtributoCompetido ?? rondaObj?.atributoCompetido ?? null);
    if (atributoElegido && this.cartaSeleccionada) {
      this.mostrarInfoCartaSeleccionada(this.cartaSeleccionada);
    }
  }
}

// Habilita/deshabilita selección (según de quién sea el turno)
setSeleccionHabilitada(flag) {
  if (flag) this.habilitarSeleccion();
  else this.deshabilitarSeleccion();
}

// “Bloquea” manualmente la selección del jugador (por ejemplo si expira el tiempo)
bloquearSeleccion() {
  this.seleccionHabilitada = false;
  this.locked = true;
  this.quitarResaltadoCartas();
}

// Permite inyectar/limitar atributos competibles dinámicamente
setAtributosDisponibles(arr) {
  if (Array.isArray(arr) && arr.length) {
    this.atributosDisponibles = arr.map(a => String(a).toLowerCase());
    // Re-pinta el modal si ya existe
    const cont = document.querySelector('.seleccion-atributos .botones-atributos');
    if (cont) {
      cont.innerHTML = this.atributosDisponibles.map(attr => `
        <button class="btn-atributo" data-atributo="${attr}">
          ${attr.toUpperCase()}
        </button>
      `).join('');
    }
  }
}

// Devuelve si este jugador ya confirmó (lock-in) en la ronda actual
isLocked() { return !!this.locked; }
// Desbloquea la selección cuando el turno pasa al otro jugador en la MISMA ronda
unlockForOtherPlayer() {
  this.locked = false;
  this.cartaSeleccionada = null;
  this.atributoSeleccionado = null;

  this.limpiarSeleccionAnterior();
  this.ocultarSeleccionAtributo();

  // Oculta panel e botón de confirmar si quedaron en pantalla
  const info = document.querySelector('.carta-seleccionada-info');
  if (info) info.style.display = 'none';
  const btn = document.querySelector('.btn-confirmar-carta');
  if (btn) btn.remove();

  // Re-pinta la mano y resalta si corresponde
  this.pintarCartas();
  if (this.seleccionHabilitada) this.resaltarCartasDisponibles();
}

// Construye (sin confirmar) el payload de la selección actual
getSeleccionPayloadPreview() {
  if (!this.cartaSeleccionada) return null;
  const atributoCompetir =
    (this.gameFlow.rondaActual?.AtributoCompetido ?? this.gameFlow.rondaActual?.atributoCompetido) ||
    this.atributoSeleccionado;
  if (!atributoCompetir) return null;

  return {
    jugadorId: this.jugadorId,
    rondaId: (this.gameFlow?.rondaActual?.Id ?? this.gameFlow?.rondaActual?.id ?? null),
    cartaJugadorId: this.cartaSeleccionada.CartaJugadorId,
    idCarta: this.cartaSeleccionada.IdCarta,
    atributoKey: String(atributoCompetir).toLowerCase(),
    valor: this.obtenerValorAtributo(this.cartaSeleccionada, atributoCompetir),
  };
}


}

window.CardSelectionManager = CardSelectionManager;
if (typeof module !== 'undefined' && module.exports) module.exports = CardSelectionManager;
