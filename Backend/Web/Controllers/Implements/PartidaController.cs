using Business.Interfaces;
using Entity.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartidaController : ControllerBase
    {
        private readonly IPartidaBusiness _partidaBusiness;
        private readonly ILogger<PartidaController> _logger;

        public PartidaController(IPartidaBusiness partidaBusiness, ILogger<PartidaController> logger)
        {
            _partidaBusiness = partidaBusiness;
            _logger = logger;
        }

        /// <summary>
        /// Crea una nueva partida con los jugadores especificados
        /// </summary>
        /// <param name="crearPartidaDto">Datos de los jugadores</param>
        /// <returns>ID de la partida creada</returns>
        [HttpPost("crear")]
        public async Task<IActionResult> CrearPartida([FromBody] CrearPartidaDto crearPartidaDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var partidaId = await _partidaBusiness.CrearPartidaAsync(crearPartidaDto);
                return Ok(new { PartidaId = partidaId, Mensaje = "Partida creada exitosamente" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear partida");
                return StatusCode(500, new { Error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtiene el estado actual de una partida
        /// </summary>
        /// <param name="partidaId">ID de la partida</param>
        /// <returns>Estado actual de la partida</returns>
        [HttpGet("{partidaId}/estado")]
        public async Task<IActionResult> ObtenerEstadoPartida(int partidaId)
        {
            try
            {
                var estado = await _partidaBusiness.ObtenerEstadoPartidaAsync(partidaId);
                return Ok(estado);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estado de partida {PartidaId}", partidaId);
                return StatusCode(500, new { Error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// El jugador que tiene el turno elige el atributo para competir en la ronda
        /// </summary>
        /// <param name="elegirAtributoDto">Datos del atributo elegido</param>
        /// <returns>Resultado de la operación</returns>
        [HttpPost("elegir-atributo")]
        public async Task<IActionResult> ElegirAtributo([FromBody] ElegirAtributoDto elegirAtributoDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var resultado = await _partidaBusiness.ElegirAtributoAsync(elegirAtributoDto);
                
                if (!resultado)
                {
                    return BadRequest(new { Error = "No es posible elegir atributo en este momento" });
                }

                return Ok(new { Mensaje = "Atributo elegido exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al elegir atributo");
                return StatusCode(500, new { Error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Un jugador juega una carta en la ronda actual
        /// </summary>
        /// <param name="jugarCartaDto">Datos de la carta jugada</param>
        /// <returns>Resultado de la operación</returns>
        [HttpPost("jugar-carta")]
        public async Task<IActionResult> JugarCarta([FromBody] JugarCartaDto jugarCartaDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var resultado = await _partidaBusiness.JugarCartaAsync(jugarCartaDto);
                
                if (!resultado)
                {
                    return BadRequest(new { Error = "No es posible jugar la carta en este momento" });
                }

                // Verificar si la ronda ha terminado
                var resultadoRonda = await _partidaBusiness.VerificarFinRondaAsync(jugarCartaDto.PartidaId);
                
                if (resultadoRonda != null)
                {
                    // La ronda terminó, avanzar a la siguiente
                    await _partidaBusiness.AvanzarSiguienteRondaAsync(jugarCartaDto.PartidaId);
                    
                    return Ok(new { 
                        Mensaje = "Carta jugada exitosamente", 
                        RondaTerminada = true,
                        ResultadoRonda = resultadoRonda 
                    });
                }

                return Ok(new { Mensaje = "Carta jugada exitosamente", RondaTerminada = false });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al jugar carta");
                return StatusCode(500, new { Error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtiene las cartas disponibles de un jugador
        /// </summary>
        /// <param name="partidaId">ID de la partida</param>
        /// <param name="jugadorId">ID del jugador</param>
        /// <returns>Lista de cartas disponibles</returns>
        [HttpGet("{partidaId}/jugador/{jugadorId}/cartas")]
        public async Task<IActionResult> ObtenerCartasDisponibles(int partidaId, int jugadorId)
        {
            try
            {
                var cartas = await _partidaBusiness.ObtenerCartasDisponiblesAsync(partidaId, jugadorId);
                return Ok(cartas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cartas disponibles");
                return StatusCode(500, new { Error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Verifica si es el turno de un jugador específico
        /// </summary>
        /// <param name="partidaId">ID de la partida</param>
        /// <param name="jugadorId">ID del jugador</param>
        /// <returns>True si es su turno, false en caso contrario</returns>
        [HttpGet("{partidaId}/jugador/{jugadorId}/es-turno")]
        public async Task<IActionResult> EsTurnoJugador(int partidaId, int jugadorId)
        {
            try
            {
                var esTurno = await _partidaBusiness.EsTurnoJugadorAsync(partidaId, jugadorId);
                return Ok(new { EsTurno = esTurno });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar turno del jugador");
                return StatusCode(500, new { Error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtiene el ranking final de una partida terminada
        /// </summary>
        /// <param name="partidaId">ID de la partida</param>
        /// <returns>Ranking final de la partida</returns>
        [HttpGet("{partidaId}/ranking")]
        public async Task<IActionResult> ObtenerRankingFinal(int partidaId)
        {
            try
            {
                var ranking = await _partidaBusiness.ObtenerRankingFinalAsync(partidaId);
                return Ok(ranking);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener ranking final");
                return StatusCode(500, new { Error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Finaliza una partida manualmente
        /// </summary>
        /// <param name="partidaId">ID de la partida</param>
        /// <returns>Resultado de la operación</returns>
        [HttpPost("{partidaId}/finalizar")]
        public async Task<IActionResult> FinalizarPartida(int partidaId)
        {
            try
            {
                var resultado = await _partidaBusiness.FinalizarPartidaAsync(partidaId);
                
                if (!resultado)
                {
                    return NotFound(new { Error = "Partida no encontrada" });
                }

                return Ok(new { Mensaje = "Partida finalizada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al finalizar partida");
                return StatusCode(500, new { Error = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Verifica el estado de una ronda y devuelve el resultado si ha terminado
        /// </summary>
        /// <param name="partidaId">ID de la partida</param>
        /// <returns>Resultado de la ronda si ha terminado</returns>
        [HttpGet("{partidaId}/verificar-ronda")]
        public async Task<IActionResult> VerificarEstadoRonda(int partidaId)
        {
            try
            {
                var resultado = await _partidaBusiness.VerificarFinRondaAsync(partidaId);
                
                if (resultado == null)
                {
                    return Ok(new { RondaTerminada = false });
                }

                return Ok(new { RondaTerminada = true, Resultado = resultado });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar estado de ronda");
                return StatusCode(500, new { Error = "Error interno del servidor" });
            }
        }
    }
}
