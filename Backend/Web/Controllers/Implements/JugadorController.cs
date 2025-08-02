using Microsoft.AspNetCore.Mvc;
using Business.Interfaces;
using Entity.Model;
using Entity.Dto;

namespace Web.Controllers.Implements
{
    [ApiController]
    [Route("api/[controller]")]
    public class JugadorController : GenericController<JugadorDto, Jugador>
    {
        public JugadorController(IBaseBusiness<Jugador, JugadorDto> business, ILogger<GenericController<JugadorDto, Jugador>> logger)
            : base(business, logger)
        {
        }

        protected override int GetEntityId(JugadorDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Obtiene jugadores por partida
        /// </summary>
        /// <param name="partidaId">ID de la partida</param>
        /// <returns>Lista de jugadores en la partida especificada</returns>
        [HttpGet("partida/{partidaId}")]
        public async Task<IActionResult> GetJugadoresByPartida(int partidaId)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var jugadoresByPartida = entities.Where(j => j.IdPartida == partidaId).ToList();
                return Ok(jugadoresByPartida);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener jugadores por partida {partidaId}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
