using Microsoft.AspNetCore.Mvc;
using Business.Interfaces;
using Entity.Model;
using Entity.Dto;

namespace Web.Controllers.Implements
{
    [ApiController]
    [Route("api/[controller]")]
    public class RondaController : GenericController<RondaDto, Ronda>
    {
        public RondaController(IBaseBusiness<Ronda, RondaDto> business, ILogger<GenericController<RondaDto, Ronda>> logger)
            : base(business, logger)
        {
        }

        protected override int GetEntityId(RondaDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Obtiene rondas por partida
        /// </summary>
        /// <param name="partidaId">ID de la partida</param>
        /// <returns>Lista de rondas de la partida especificada</returns>
        [HttpGet("partida/{partidaId}")]
        public async Task<IActionResult> GetRondasByPartida(int partidaId)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var rondasByPartida = entities.Where(r => r.IdPartida == partidaId).OrderBy(r => r.NumeroRonda).ToList();
                return Ok(rondasByPartida);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener rondas por partida {partidaId}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene la ronda actual (última) de una partida
        /// </summary>
        /// <param name="partidaId">ID de la partida</param>
        /// <returns>Ronda actual de la partida</returns>
        [HttpGet("partida/{partidaId}/actual")]
        public async Task<IActionResult> GetRondaActual(int partidaId)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var rondaActual = entities.Where(r => r.IdPartida == partidaId)
                                        .OrderByDescending(r => r.NumeroRonda)
                                        .FirstOrDefault();
                
                if (rondaActual == null)
                    return NotFound($"No se encontró ronda actual para la partida {partidaId}");

                return Ok(rondaActual);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener ronda actual para partida {partidaId}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
