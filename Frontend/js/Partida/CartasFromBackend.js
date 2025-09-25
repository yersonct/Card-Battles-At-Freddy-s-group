// Render dinámico de jugadores (solo los de la BD) con nombre + avatar
(function () {
  const API_BASE = (window.API_BASE || 'http://localhost:7147/api').replace(/\/+$/, '');
  const IMG_FALLBACK = '../img/foto/icono.png';

  document.addEventListener('DOMContentLoaded', bootstrap);

  async function bootstrap() {
    const partidaId = localStorage.getItem('partidaId');
    if (!partidaId) {
      console.warn('[Jugadores] falta partidaId en localStorage');
      return;
    }

    try {
      const jugadores = await fetchJugadores(partidaId);

      const lista = jugadores
        .filter(j => (j.Active ?? j.active ?? 1) == 1)
        .sort((a, b) => {
          const pa = a.PosicionTurnos ?? 9999;
          const pb = b.PosicionTurnos ?? 9999;
          return pa - pb || String(a.Nombre ?? '').localeCompare(String(b.Nombre ?? ''));
        });

      // Exponer a otros módulos
      window.jugadoresPartida = lista.map((j, i) => ({
        id: j.Id ?? j.id ?? (i + 1),
        nombre: j.Nombre ?? `Jugador ${i + 1}`,
        avatar: j.Avatar ?? null,
        posicionTurnos: j.PosicionTurnos ?? (i + 1),
        idPartida: j.IdPartida ?? null,
        puntosAcumulados: j.PuntosAcumulados ?? 0,
        active: j.Active ?? 1
      }));

      // Pintar cabecera dinámica
      renderCabecera(window.jugadoresPartida);

      // Pintar bloque inferior (T1) = jugador actual
      renderJugadorActual(window.jugadoresPartida);

      console.log(`[Jugadores] renderizados ${window.jugadoresPartida.length}`);
    } catch (e) {
      console.error('[Jugadores] Error trayendo jugadores:', e);
    }
  }

  async function fetchJugadores(partidaId) {
    // Ajusta si tu API usa otro nombre de parámetro (IdPartida/idPartida)
    const url = `${API_BASE}/Jugador?IdPartida=${encodeURIComponent(partidaId)}&Active=1`;
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  }

  function renderCabecera(jugadores) {
    const cont = document.getElementById('slots-jugadores');
    if (!cont) return;

    // limpiar cualquier cosa previa
    cont.innerHTML = '';

    // crear un slot por jugador
    jugadores.forEach((j, idx) => {
      const slot = crearSlotJugador(j, idx);
      cont.appendChild(slot);
    });
  }

  function crearSlotJugador(jugador, idx) {
    // Alterna clases para respetar tu CSS (iconos-1 / iconos-2)
    const clase = idx % 2 === 0 ? 'iconos-1' : 'iconos-2';

    const wrap = document.createElement('div');
    wrap.className = 'container-icono';

    const slot = document.createElement('div');
    slot.className = clase;

    // Título T#
    const h4 = document.createElement('h4');
    h4.textContent = `T${Number(jugador.posicionTurnos) || (idx + 2)}`; // T2.. en cabecera

    // Contador de cartas (dejo tu estructura con 7 bolitas)
    const contCartas = document.createElement('div');
    contCartas.className = 'contenedor-cantidad-cartas-jugador';
    for (let i = 0; i < 7; i++) {
      const dot = document.createElement('div');
      dot.className = 'cantidad-no-jugadas';
      contCartas.appendChild(dot);
    }

    // Avatar
    const img = document.createElement('img');
    img.className = 'avatar-jugador';
    img.alt = `Avatar de ${jugador.nombre}`;
    img.src = resolveAvatarSrc(jugador.avatar);
    img.onerror = () => { img.src = IMG_FALLBACK; };
    // Estilos mínimos para no romper tu layout
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    img.style.display = 'block';
    img.style.margin = '4px 0';

    // Nombre
    const input = document.createElement('input');
    input.type = 'text';
    input.readOnly = true;
    input.value = jugador.nombre ?? `Jugador ${idx + 1}`;

    // armar estructura
    slot.appendChild(h4);
    slot.appendChild(contCartas);
    slot.appendChild(img);
    slot.appendChild(input);
    wrap.appendChild(slot);
    return wrap;
  }

  function renderJugadorActual(jugadores) {
    const slot = document.querySelector('.iconos-jugador .iconos-1');
    if (!slot) return;

    const jugadorIdLS = Number(localStorage.getItem('jugadorId'));
    const jugador = jugadores.find(j => Number(j.id) === jugadorIdLS) || jugadores[0];
    if (!jugador) return;

    const titulo = slot.querySelector('h4');
    if (titulo) titulo.textContent = 'T1';

    // Asegurar avatar
    let img = slot.querySelector('img.avatar-jugador');
    if (!img) {
      img = document.createElement('img');
      img.className = 'avatar-jugador';
      img.style.width = '48px';
      img.style.height = '48px';
      img.style.borderRadius = '50%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';
      img.style.margin = '4px 0';
      slot.insertBefore(img, slot.querySelector('input') || null);
    }
    img.src = resolveAvatarSrc(jugador.avatar);
    img.alt = `Avatar de ${jugador.nombre}`;
    img.onerror = () => { img.src = IMG_FALLBACK; };

    const input = slot.querySelector('input');
    if (input) {
      input.readOnly = true;
      input.value = jugador.nombre ?? 'Jugador';
    }
  }

  function resolveAvatarSrc(avatar) {
    if (!avatar) return IMG_FALLBACK;
    if (typeof avatar !== 'string') return IMG_FALLBACK;
    if (/^https?:\/\//i.test(avatar) || avatar.startsWith('data:')) return avatar;
    // si solo viene el nombre del archivo, servimos desde el backend quitando /api
    const base = API_BASE.replace(/\/api$/i, '');
    const file = avatar.split(/[\\/]/).pop();
    return `${base}/img/foto/${encodeURIComponent(file)}`;
  }
})();
