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
        [HttpGet("jugada/{jugadaId}")]
        public async Task<IActionResult> GetCartasByJugada(int jugadaId)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var cartasByJugada = entities.Where(cj => cj.IdJugada == jugadaId && cj.Usada == true).ToList();
                return Ok(cartasByJugada);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener cartas por jugada {jugadaId}: {ex.Message}");
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

        /// <summary>
        /// Jugar una carta (asignarla a una jugada)
        /// </summary>
        /// <param name="cartaJugadorId">ID de la carta del jugador</param>
        /// <param name="jugadaId">ID de la jugada donde se usará la carta</param>
        /// <returns>Carta actualizada</returns>
        [HttpPut("{cartaJugadorId}/jugar/{jugadaId}")]
        public async Task<IActionResult> JugarCarta(int cartaJugadorId, int jugadaId)
        {
            try
            {
                var cartaJugador = await _business.GetByIdAsync(cartaJugadorId);
                if (cartaJugador == null)
                    return NotFound($"Carta del jugador con ID {cartaJugadorId} no encontrada");

                if (cartaJugador.IdJugada != null)
                    return BadRequest("Esta carta ya ha sido jugada");

                cartaJugador.IdJugada = jugadaId;
                
                var updatedCarta = await _business.UpdateAsync(cartaJugador);
                return Ok(updatedCarta);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al jugar carta {cartaJugadorId} en jugada {jugadaId}: {ex.Message}");
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
