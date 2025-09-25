using Microsoft.AspNetCore.Mvc;
using Business.Interfaces;
using Entity.Model;
using Entity.Dto;

namespace Web.Controllers.Implements
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartaJugadorController : GenericController<CartaJugadorDto, CartaJugador>
    {
        public CartaJugadorController(IBaseBusiness<CartaJugador, CartaJugadorDto> business, ILogger<GenericController<CartaJugadorDto, CartaJugador>> logger)
            : base(business, logger)
        {
        }

        protected override int GetEntityId(CartaJugadorDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Obtiene las cartas de un jugador específico
        /// </summary>
        /// <param name="jugadorId">ID del jugador</param>
        /// <returns>Lista de cartas del jugador especificado</returns>
        [HttpGet("jugador/{jugadorId}")]
        public async Task<IActionResult> GetCartasByJugador(int jugadorId)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var cartasByJugador = entities.Where(cj => cj.IdJugador == jugadorId).ToList();
                return Ok(cartasByJugador);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener cartas del jugador {jugadorId}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
        
        /// <summary>
        /// Obtiene cartas de jugador por jugada
        /// </summary>
        /// <param name="jugadaId">ID de la jugada</param>
        /// <returns>Lista de cartas usadas en la jugada especificada</returns>
       // ❌ No uses cj.IdJugada: no existe. O elimina este endpoint,
//   o (si quieres mantenerlo) devuélvelo vacío hasta que modeles la relación.
        [HttpGet("jugada/{jugadaId}")]
        public async Task<IActionResult> GetCartasByJugada(int jugadaId)
        {
            try
            {
                // Sin columna IdJugada en CartaJugador no podemos filtrar aquí.
                // Ojo: la relación está en Jugada (IdCartaJugador).
                return Ok(new List<CartaJugadorDto>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cartas por jugada {JugadaId}", jugadaId);
                return StatusCode(500, "Error interno del servidor");
            }
        }


        /// <summary>
        /// Obtiene el mazo (cartas disponibles) de un jugador
        /// </summary>
        /// <param name="jugadorId">ID del jugador</param>
        /// <returns>Lista de cartas disponibles del jugador</returns>
        [HttpGet("jugador/{jugadorId}/mazo")]
        public async Task<IActionResult> GetMazoJugador(int jugadorId)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                // Cartas que no han sido jugadas (no tienen IdJugada)
                var mazoJugador = entities.Where(cj => cj.IdJugador == jugadorId && cj.IdJugada == null).ToList();
                return Ok(mazoJugador);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener mazo del jugador {jugadorId}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
        [HttpGet("partida/{partidaId}/jugador/{jugadorId}")]
        public async Task<IActionResult> GetCartasByPartidaYJugador(int partidaId, int jugadorId)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var list = entities.Where(cj => cj.IdJugador == jugadorId).ToList();
                return Ok(list);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener cartas del jugador {JugadorId} en partida {PartidaId}", jugadorId, partidaId);
                return StatusCode(500, "Error interno del servidor");
            }
        }
        /// <summary>
        /// Jugar una carta (asignarla a una jugada)
        /// </summary>
        /// <param name="cartaJugadorId">ID de la carta del jugador</param>
        /// <param name="jugadaId">ID de la jugada donde se usará la carta</param>
        /// <returns>Carta actualizada</returns>
        [HttpPut("{cartaJugadorId}/jugar/{jugadaId}")]
        // PUT /api/CartaJugador/{cartaJugadorId}/jugar/{jugadaId}?rondaUsada=3&usada=true
        [HttpPut("{cartaJugadorId}/jugar/{jugadaId}")]
        public async Task<IActionResult> JugarCarta(int cartaJugadorId, int jugadaId,
            [FromQuery] int? rondaUsada, [FromQuery] bool? usada)
        {
            try
            {
                var carta = await _business.GetByIdAsync(cartaJugadorId);
                if (carta == null) return NotFound($"Carta del jugador {cartaJugadorId} no encontrada");

                // Ya no comprobamos IdJugada (esa columna no existe aquí).
                if (carta.Usada) return BadRequest("Esta carta ya ha sido marcada como usada");

                if (usada.HasValue) carta.Usada = usada.Value;
                if (rondaUsada.HasValue) carta.RondaUsada = rondaUsada.Value;

                var updated = await _business.UpdateAsync(carta);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al jugar carta {CartaId} en jugada {JugadaId}", cartaJugadorId, jugadaId);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene cartas activas
        /// </summary>
        /// <returns>Lista de cartas de jugador activas</returns>
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveCartasJugador()
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var activeEntities = entities.Where(cj => cj.Usada == true).ToList();
                return Ok(activeEntities);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener cartas de jugador activas: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
        
    }
}
