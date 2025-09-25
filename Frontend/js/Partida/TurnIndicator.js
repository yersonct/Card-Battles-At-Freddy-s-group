/**
 * Indicador de Turnos
 * Card Battles At Freddy's
 * 
 * Muestra visualmente de quién es el turno y el estado de cada jugador
 */

class TurnIndicator {
    constructor(gameFlowController) {
        this.gameFlow = gameFlowController;
        this.jugadoresIndicadores = [];
        this.contenedorIndicadores = null;
        
        console.log(' TurnIndicator inicializado');
    }

      // 👇 PON AQUÍ EL HELPER, DENTRO DE LA CLASE
    resolveAvatar(avatar) {
        if (!avatar) return '../img/foto/icono.png';
        if (String(avatar).startsWith('http') || String(avatar).startsWith('data:')) return avatar;
        const API_BASE = (window.API_CONFIG?.baseURL || '').replace(/\/+$/, '');
        const PUBLIC_BASE = API_BASE.replace(/\/api$/i, '');
        const baseName = String(avatar).split(/[\\/]/).pop();
        return `${PUBLIC_BASE}/img/foto/${encodeURIComponent(baseName)}`;
    }
    /**
     * Inicializa el indicador de turnos
     */
    async init() {
        try {
            this.crearContenedorIndicadores();
            this.crearIndicadoresJugadores();
            this.actualizarIndicadores();
            
            console.log(' TurnIndicator inicializado correctamente');
            
        } catch (error) {
            console.error(' Error inicializando TurnIndicator:', error);
            throw error;
        }
    }

    /**
     * Crea el contenedor principal de indicadores
     */
    crearContenedorIndicadores() {
        // Buscar si ya existe
        this.contenedorIndicadores = document.querySelector('.indicadores-turnos');
        
        if (!this.contenedorIndicadores) {
            this.contenedorIndicadores = document.createElement('div');
            this.contenedorIndicadores.className = 'indicadores-turnos';
            
            // Insertar en la interfaz
            const contenedorPrincipal = document.querySelector('.completo-iconos-usuario');
            if (contenedorPrincipal) {
                contenedorPrincipal.appendChild(this.contenedorIndicadores);
            } else {
                document.body.appendChild(this.contenedorIndicadores);
            }
        }
    }

    /**
     * Crea los indicadores individuales para cada jugador
     */
    crearIndicadorJugador(jugador, index) {
  const id   = Number(jugador.Id ?? jugador.id);
  const nom  = jugador.Nombre ?? jugador.nombre ?? `Jugador ${index+1}`;
  const av   = jugador.Avatar ?? jugador.avatar ?? null;
  const pos  = Number(jugador.PosicionTurnos ?? jugador.posicionTurno ?? (index+1));
  const pts  = Number(jugador.PuntosAcumulados ?? jugador.puntosAcumulados ?? 0);

  const indicador = document.createElement('div');
  indicador.className = 'indicador-jugador';
  indicador.dataset.jugadorId = String(id);
  indicador.dataset.posicion = String(pos);

  const esYo = id === Number(this.gameFlow.jugadorActualId);

  indicador.innerHTML = `
    <div class="avatar-contenedor">
      <img src="${this.resolveAvatar(av)}" alt="${nom}" class="avatar-jugador">
      <div class="indicador-turno"></div>
      <div class="indicador-estado"></div>
    </div>
    <div class="info-jugador">
      <div class="nombre-jugador">${nom}${esYo ? ' (Tú)' : ''}</div>
      <div class="puntos-jugador">${pts} pts</div>
      <div class="posicion-turno">T${pos}</div>
    </div>
    <div class="estado-ronda">
      <span class="texto-estado">Esperando...</span>
    </div>
  `;
  // Guarda los valores normalizados para uso posterior
  indicador.__norm__ = { id, nom, av, pos, pts };
  return indicador;
}


    /**
     * Crea un indicador individual para un jugador
     */
    crearIndicadorJugador(jugador, index) {
        const indicador = document.createElement('div');
        indicador.className = 'indicador-jugador';
        indicador.dataset.jugadorId = jugador.id;
        indicador.dataset.posicion = jugador.posicionTurno;
        
        // Determinar si es el jugador actual
        const esJugadorActual = jugador.id === parseInt(this.gameFlow.jugadorActualId);
        
        indicador.innerHTML = `
            <div class="avatar-contenedor">
                <img src="${jugador.avatar}" alt="${jugador.nombre}" class="avatar-jugador">
                <div class="indicador-turno"></div>
                <div class="indicador-estado"></div>
            </div>
            <div class="info-jugador">
                <div class="nombre-jugador">${jugador.nombre}${esJugadorActual ? ' (Tú)' : ''}</div>
                <div class="puntos-jugador">${jugador.puntosAcumulados || 0} pts</div>
                <div class="posicion-turno">T${jugador.posicionTurno}</div>
            </div>
            <div class="estado-ronda">
                <span class="texto-estado">Esperando...</span>
            </div>
        `;
        
        return indicador;
    }

    /**
     * Actualiza todos los indicadores según el estado actual del juego
     */
    actualizarIndicadores() {
        if (!this.jugadoresIndicadores.length) {
            console.warn(' No hay indicadores para actualizar');
            return;
        }
        
        const estadoJuego = this.gameFlow.getEstadoActual();
        
        this.jugadoresIndicadores.forEach((indicadorData, index) => {
            this.actualizarIndicadorJugador(indicadorData, estadoJuego);
        });
        
        console.log(' Indicadores actualizados');
    }

    /**
     * Actualiza un indicador específico de jugador
     */
    actualizarIndicadorJugador(indicadorData, estadoJuego) {
        const { elemento, jugador } = indicadorData;
        const esJugadorDelTurno = this.esJugadorDelTurno(jugador, estadoJuego);
        const esJugadorQueElige = this.esJugadorQueElige(jugador);

        const yaJugo = this.jugadorYaJugo(jugador.id);
        
        // Actualizar clases CSS
        elemento.className = 'indicador-jugador';
        
        if (esJugadorDelTurno) {
            elemento.classList.add('turno-activo');
        }
        
        if (esJugadorQueElige) {
            elemento.classList.add('elige-atributo');
        }
        
        if (yaJugo) {
            elemento.classList.add('ya-jugo');
        }
        
        // Actualizar indicador de turno
        const indicadorTurno = elemento.querySelector('.indicador-turno');
        if (indicadorTurno) {
            indicadorTurno.style.display = esJugadorDelTurno ? 'block' : 'none';
        }
        
        // Actualizar estado visual
        this.actualizarEstadoVisual(elemento, jugador, estadoJuego, yaJugo);
        
        // Actualizar puntos
        const puntosElement = elemento.querySelector('.puntos-jugador');
        if (puntosElement) {
            puntosElement.textContent = `${jugador.puntosAcumulados || 0} pts`;
        }
    }

    /**
     * Actualiza el estado visual de un jugador
     */
    actualizarEstadoVisual(elemento, jugador, estadoJuego, yaJugo) {
        const estadoElement = elemento.querySelector('.texto-estado');
        const indicadorEstado = elemento.querySelector('.indicador-estado');
        
        if (!estadoElement || !indicadorEstado) return;
        
        let textoEstado = '';
        let claseEstado = '';
        
        if (estadoJuego.faseActual === 'FINALIZADA') {
            textoEstado = 'Partida terminada';
            claseEstado = 'finalizada';
        } else if (yaJugo) {
            textoEstado = 'Carta jugada ✓';
            claseEstado = 'completado';
        } else if (this.esJugadorDelTurno(jugador, estadoJuego)) {
            if (estadoJuego.esElQueElige && !estadoJuego.rondaActual?.atributoCompetido) {
                textoEstado = 'Eligiendo atributo...';
                claseEstado = 'eligiendo';
            } else {
                textoEstado = 'Seleccionando carta...';
                claseEstado = 'seleccionando';
            }
        } else {
            textoEstado = 'Esperando turno...';
            claseEstado = 'esperando';
        }
        
        estadoElement.textContent = textoEstado;
        indicadorEstado.className = `indicador-estado ${claseEstado}`;
    }

    /**
     * Verifica si un jugador es el del turno actual
     */
    esJugadorDelTurno(jugador, estadoJuego) {
    // En selección, es “del turno” quien NO ha jugado
    if (estadoJuego.faseActual === 'SELECCIONANDO_CARTA') {
        return !this.jugadorYaJugo(jugador.Id ?? jugador.id ?? jugador?.__norm__?.id);
    }
    // En otras fases, “del turno” es el que elige
    return this.esJugadorQueElige(jugador);
    }


    /**
     * Verifica si un jugador ya jugó en la ronda actual
     */
    jugadorYaJugo(jugadorId) {
    const jid = Number(jugadorId);
    return this.gameFlow.cartasJugadasRonda.some(j => Number(j.IdJugador ?? j.idJugador) === jid);
    }


    /**
     * Resalta el jugador que debe elegir el atributo
     */
    resaltarJugadorQueElige() {
        // Quitar resaltado anterior
        this.jugadoresIndicadores.forEach(({ elemento }) => {
            elemento.classList.remove('elige-atributo-destacado');
        });
        
        // Resaltar jugador actual que elige
        if (this.gameFlow.esJugadorQueEligeAtributo()) {
            const indicadorActual = this.jugadoresIndicadores.find(
                ({ jugador }) => jugador.id === parseInt(this.gameFlow.jugadorActualId)
            );
            
            if (indicadorActual) {
                indicadorActual.elemento.classList.add('elige-atributo-destacado');
            }
        }
    }

    /**
     * Muestra un mensaje temporal sobre el estado del turno
     */
    mostrarMensajeTurno(mensaje, duracion = 3000) {
        // Remover mensaje anterior si existe
        const mensajeAnterior = document.querySelector('.mensaje-turno');
        if (mensajeAnterior) mensajeAnterior.remove();
        
        const mensajeElement = document.createElement('div');
        mensajeElement.className = 'mensaje-turno';
        mensajeElement.textContent = mensaje;
        
        this.contenedorIndicadores.appendChild(mensajeElement);
        
        // Auto-remover después del tiempo especificado
        setTimeout(() => {
            if (mensajeElement.parentNode) {
                mensajeElement.remove();
            }
        }, duracion);
    }

    /**
     * Actualiza la información de puntos de todos los jugadores
     */
    async actualizarPuntos() {
  try {
    const partId = Number(this.gameFlow.partidaId);
    const backend = await window.partidaService.getJugadoresByPartida(partId);
    backend.forEach(bj => {
      const bid = Number(bj.Id ?? bj.id);
      const pts = Number(bj.PuntosAcumulados ?? bj.puntosAcumulados ?? 0);
      const ind = this.jugadoresIndicadores.find(
        ({ elemento }) => Number(elemento.__norm__?.id) === bid
      );
      if (ind) {
        ind.jugador.PuntosAcumulados = pts;
        ind.elemento.__norm__.pts = pts;
        const el = ind.elemento.querySelector('.puntos-jugador');
        if (el) el.textContent = `${pts} pts`;
      }
    });
  } catch (e) {
    console.error(' Error actualizando puntos:', e);
  }
}


    /**
     * Marca visualmente que un jugador ha completado su jugada
     */
    marcarJugadorCompletado(jugadorId) {
        const indicador = this.jugadoresIndicadores.find(
            ({ jugador }) => jugador.id === parseInt(jugadorId)
        );
        
        if (indicador) {
            indicador.elemento.classList.add('ya-jugo');
            
            const estadoElement = indicador.elemento.querySelector('.texto-estado');
            if (estadoElement) {
                estadoElement.textContent = 'Carta jugada ✓';
            }
        }
    }

    /**
     * Resetea los indicadores para una nueva ronda
     */
    resetearParaNuevaRonda() {
        this.jugadoresIndicadores.forEach(({ elemento }) => {
            elemento.classList.remove('ya-jugo', 'completado');
            
            const estadoElement = elemento.querySelector('.texto-estado');
            if (estadoElement) {
                estadoElement.textContent = 'Esperando...';
            }
            
            const indicadorEstado = elemento.querySelector('.indicador-estado');
            if (indicadorEstado) {
                indicadorEstado.className = 'indicador-estado esperando';
            }
        });
        
        console.log(' Indicadores reseteados para nueva ronda');
    }

    /**
     * Muestra el conteo de jugadores que han jugado
     */
    mostrarProgresoRonda() {
        const totalJugadores = this.gameFlow.jugadores.length;
        const jugadoresCompletados = this.gameFlow.cartasJugadasRonda.length;
        
        this.mostrarMensajeTurno(
            `Jugadores que han jugado: ${jugadoresCompletados}/${totalJugadores}`,
            2000
        );
    }

    /**
     * Obtiene información del estado actual de los indicadores
     */
    getEstadoIndicadores() {
        return {
            totalJugadores: this.jugadoresIndicadores.length,
            jugadoresCompletados: this.gameFlow.cartasJugadasRonda.length,
            jugadorDelTurno: this.gameFlow.turnoActualIndex,
            fase: this.gameFlow.faseActual
        };
    }

    /**
     * Limpia recursos
     */
    destroy() {
        if (this.contenedorIndicadores && this.contenedorIndicadores.parentNode) {
            this.contenedorIndicadores.remove();
        }
        
        this.jugadoresIndicadores = [];
        this.contenedorIndicadores = null;
        
        console.log(' TurnIndicator destruido');
    }
    esJugadorQueElige(jugador) {
      const rid = Number(this.gameFlow.rondaActual?.IdJugadorQueElige ?? this.gameFlow.rondaActual?.idJugadorQueElige);
      const jid = Number(jugador.Id ?? jugador.id ?? jugador?.__norm__?.id);
      if (rid) return jid === rid;
      // Fallback: si no hay ronda, asume el de turnoActualIndex
      const chooser = this.gameFlow.jugadores?.[this.gameFlow.turnoActualIndex];
      const chooserId = Number(chooser?.Id ?? chooser?.id);
      return jid && chooserId ? (jid === chooserId) : false;
    }
}

// Exportar para uso global
window.TurnIndicator = TurnIndicator;

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TurnIndicator;
}
