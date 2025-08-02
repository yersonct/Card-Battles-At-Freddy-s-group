using Microsoft.AspNetCore.Mvc;
using Business.Interfaces;
using Entity.Model;
using Entity.Dto;

namespace Web.Controllers.Implements
{
    [ApiController]
    [Route("api/[controller]")]
    public class JugadaController : GenericController<JugadaDto, Jugada>
    {
        public JugadaController(IBaseBusiness<Jugada, JugadaDto> business, ILogger<GenericController<JugadaDto, Jugada>> logger)
            : base(business, logger)
        {
        }

        protected override int GetEntityId(JugadaDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Obtiene jugadas por ronda
        /// </summary>
        /// <param name="rondaId">ID de la ronda</param>
        /// <returns>Lista de jugadas de la ronda especificada</returns>
        [HttpGet("ronda/{rondaId}")]
        public async Task<IActionResult> GetJugadasByRonda(int rondaId)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var jugadasByRonda = entities.Where(j => j.IdRonda == rondaId).ToList();
                return Ok(jugadasByRonda);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener jugadas por ronda {rondaId}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene jugadas por jugador
        /// </summary>
        /// <param name="jugadorId">ID del jugador</param>
        /// <returns>Lista de jugadas del jugador especificado</returns>
        [HttpGet("jugador/{jugadorId}")]
        public async Task<IActionResult> GetJugadasByJugador(int jugadorId)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var jugadasByJugador = entities.Where(j => j.IdJugador == jugadorId ).ToList();
                return Ok(jugadasByJugador);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener jugadas por jugador {jugadorId}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

       
       
        
    }
}
