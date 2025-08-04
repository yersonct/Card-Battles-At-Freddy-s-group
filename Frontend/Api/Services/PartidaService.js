/**
 * Servicio para manejo de Partidas
 * Card Battles At Freddy's
 */

class PartidaService extends BaseApiService {
    constructor() {
        super(API_ENDPOINTS.PARTIDAS);
    }

    /**
     * Crea una nueva partida
     * @param {string} nombre - Nombre descriptivo de la partida (opcional, se guarda en comentarios)
     * @param {number} cantidadJugadores - Cantidad de jugadores que participarán
     * @returns {Promise<Object>} Partida creada
     */
    async crearPartida(nombre = "Partida FNAF", cantidadJugadores = 2) {
        try {
            const ahora = new Date();
            const partidaData = {
                fechaInicio: ahora.toISOString(),
                tiempoPartida: ahora.toISOString(), // Se actualizará cuando termine
                estado: true, // true = activa
                rondasJugadas: 0 // Comienza en 0
                // Removemos active por ahora para evitar problemas de mapeo
            };

            const partida = await this.create(partidaData);
            console.log(`🎮 Partida creada: ID ${partida.id} para ${cantidadJugadores} jugadores`);
            
            // Agregar información adicional que no se guarda en BD pero es útil en frontend
            partida.nombreDisplay = nombre;
            partida.cantidadJugadores = cantidadJugadores;
            
            return partida;
        } catch (error) {
            console.error(`❌ Error al crear partida "${nombre}":`, error);
            throw error;
        }
    }

    /**
     * Obtiene partidas activas
     * @returns {Promise<Array>} Lista de partidas activas
     */
    async getPartidasActivas() {
        try {
            const url = buildUrl(API_ENDPOINTS.PARTIDAS_ACTIVE);
            return await makeRequest(url);
        } catch (error) {
            console.error('Error al obtener partidas activas:', error);
            throw error;
        }
    }

    /**
     * Obtiene partidas por estado
     * @param {string} estado - Estado de las partidas (Activa, Finalizada, Pausada)
     * @returns {Promise<Array>} Lista de partidas con el estado especificado
     */
    async getByEstado(estado) {
        try {
            const url = buildUrl(API_ENDPOINTS.PARTIDAS_BY_ESTADO, { estado });
            return await makeRequest(url);
        } catch (error) {
            console.error(`Error al obtener partidas con estado "${estado}":`, error);
            throw error;
        }
    }

    /**
     * Finaliza una partida
     * @param {number} partidaId - ID de la partida a finalizar
     * @param {number} ganadorId - ID del jugador ganador (opcional)
     * @returns {Promise<Object>} Partida finalizada
     */
    async finalizarPartida(partidaId, ganadorId = null) {
        try {
            const url = buildUrl(API_ENDPOINTS.PARTIDAS_FINALIZAR, { id: partidaId });
            
            const data = {
                fechaFin: new Date().toISOString(),
                estado: 'Finalizada'
            };

            if (ganadorId) {
                data.ganadorId = ganadorId;
            }

            const resultado = await makeRequest(url, {
                method: 'PUT',
                body: JSON.stringify(data)
            });

            console.log(`🏆 Partida ${partidaId} finalizada`);
            return resultado;
        } catch (error) {
            console.error(`Error al finalizar partida ${partidaId}:`, error);
            throw error;
        }
    }

    /**
     * Actualiza el estado de una partida
     * @param {number} partidaId - ID de la partida
     * @param {string} nuevoEstado - Nuevo estado (Activa, Pausada, Finalizada)
     * @returns {Promise<Object>} Partida actualizada
     */
    async actualizarEstado(partidaId, nuevoEstado) {
        try {
            const data = { 
                estado: nuevoEstado,
                fechaActualizacion: new Date().toISOString()
            };

            if (nuevoEstado === 'Finalizada') {
                data.fechaFin = new Date().toISOString();
            }

            const resultado = await this.mergePatch(partidaId, data);
            console.log(`📝 Estado de partida ${partidaId} actualizado a: ${nuevoEstado}`);
            return resultado;
        } catch (error) {
            console.error(`Error al actualizar estado de partida ${partidaId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene el resumen de una partida con sus jugadores
     * @param {number} partidaId - ID de la partida
     * @returns {Promise<Object>} Resumen completo de la partida
     */
    async getResumenPartida(partidaId) {
        try {
            const partida = await this.getById(partidaId);
            
            // Obtener jugadores de la partida
            let jugadores = [];
            if (window.jugadorService) {
                try {
                    jugadores = await window.jugadorService.getByPartida(partidaId);
                } catch (jugadorError) {
                    console.warn('No se pudieron obtener jugadores de la partida:', jugadorError);
                }
            }

            return {
                ...partida,
                jugadores: jugadores,
                totalJugadores: jugadores.length,
                duracion: this.calcularDuracion(partida.fechaInicio, partida.fechaFin)
            };
        } catch (error) {
            console.error(`Error al obtener resumen de partida ${partidaId}:`, error);
            throw error;
        }
    }

    /**
     * Calcula la duración de una partida
     * @param {string} fechaInicio - Fecha de inicio en formato ISO
     * @param {string} fechaFin - Fecha de fin en formato ISO (opcional)
     * @returns {Object} Duración calculada
     */
    calcularDuracion(fechaInicio, fechaFin = null) {
        try {
            const inicio = new Date(fechaInicio);
            const fin = fechaFin ? new Date(fechaFin) : new Date();
            
            const diferenciaMilisegundos = fin - inicio;
            const minutos = Math.floor(diferenciaMilisegundos / (1000 * 60));
            const horas = Math.floor(minutos / 60);
            
            return {
                milisegundos: diferenciaMilisegundos,
                minutos: minutos,
                horas: horas,
                textoLegible: horas > 0 ? 
                    `${horas}h ${minutos % 60}min` : 
                    `${minutos}min`
            };
        } catch (error) {
            console.error('Error al calcular duración:', error);
            return { textoLegible: 'Duración desconocida' };
        }
    }

    /**
     * Obtiene estadísticas generales de partidas
     * @returns {Promise<Object>} Estadísticas de partidas
     */
    async getEstadisticas() {
        try {
            const todasLasPartidas = await this.getAll();
            
            const estadisticas = {
                total: todasLasPartidas.length,
                activas: 0,
                finalizadas: 0,
                pausadas: 0,
                duracionPromedio: 0,
                jugadoresPromedio: 0
            };

            let duracionTotal = 0;
            let jugadoresTotales = 0;
            let partidasConDuracion = 0;

            todasLasPartidas.forEach(partida => {
                switch (partida.estado) {
                    case 'Activa':
                        estadisticas.activas++;
                        break;
                    case 'Finalizada':
                        estadisticas.finalizadas++;
                        break;
                    case 'Pausada':
                        estadisticas.pausadas++;
                        break;
                }

                if (partida.cantidadJugadores) {
                    jugadoresTotales += partida.cantidadJugadores;
                }

                if (partida.fechaInicio && partida.fechaFin) {
                    const duracion = this.calcularDuracion(partida.fechaInicio, partida.fechaFin);
                    duracionTotal += duracion.minutos;
                    partidasConDuracion++;
                }
            });

            if (partidasConDuracion > 0) {
                estadisticas.duracionPromedio = Math.round(duracionTotal / partidasConDuracion);
            }

            if (todasLasPartidas.length > 0) {
                estadisticas.jugadoresPromedio = Math.round(jugadoresTotales / todasLasPartidas.length);
            }

            return estadisticas;
        } catch (error) {
            console.error('Error al obtener estadísticas de partidas:', error);
            throw error;
        }
    }

    /**
     * Pausa una partida activa
     * @param {number} partidaId - ID de la partida a pausar
     * @returns {Promise<Object>} Partida pausada
     */
    async pausarPartida(partidaId) {
        try {
            return await this.actualizarEstado(partidaId, 'Pausada');
        } catch (error) {
            console.error(`Error al pausar partida ${partidaId}:`, error);
            throw error;
        }
    }

    /**
     * Reanuda una partida pausada
     * @param {number} partidaId - ID de la partida a reanudar
     * @returns {Promise<Object>} Partida reanudada
     */
    async reanudarPartida(partidaId) {
        try {
            return await this.actualizarEstado(partidaId, 'Activa');
        } catch (error) {
            console.error(`Error al reanudar partida ${partidaId}:`, error);
            throw error;
        }
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PartidaService;
} else {
    window.PartidaService = PartidaService;
}
