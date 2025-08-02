using Microsoft.AspNetCore.Mvc;
using Business.Interfaces;
using Entity.Model;
using Entity.Dto;

namespace Web.Controllers.Implements
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartidaController : GenericController<PartidaDto, Partida>
    {
        public PartidaController(IBaseBusiness<Partida, PartidaDto> business, ILogger<GenericController<PartidaDto, Partida>> logger)
            : base(business, logger)
        {
        }

        protected override int GetEntityId(PartidaDto dto)
        {
            return dto.Id;
        }

        /// <summary>
        /// Obtiene partidas activas (en curso)
        /// </summary>
        /// <returns>Lista de partidas activas</returns>
        [HttpGet("active")]
        public async Task<IActionResult> GetActivePartidas()
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var activeEntities = entities.Where(p => p.Estado == true).ToList();
                return Ok(activeEntities);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener partidas activas: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene partidas por estado específico
        /// </summary>
        /// <param name="estado">Estado de la partida (true false etc.)</param>
        /// <returns>Lista de partidas con el estado especificado</returns>
        [HttpGet("estado/{estado}")]
        public async Task<IActionResult> GetPartidasByEstado(bool estado)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var partidasByEstado = entities.Where(p => p.Estado == true).ToList();
                return Ok(partidasByEstado);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener partidas por estado {estado}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Finaliza una partida
        /// </summary>
        /// <param name="id">ID de la partida a finalizar</param>
        /// <returns>Partida actualizada</returns>
        [HttpPut("{id}/finalizar")]
        public async Task<IActionResult> FinalizarPartida(int id)
        {
            try
            {
                var partida = await _business.GetByIdAsync(id);
                if (partida == null)
                    return NotFound($"Partida con ID {id} no encontrada");

                partida.Estado = false; // Cambiamos el estado a false para indicar que está finalizada
                
                var updatedPartida = await _business.UpdateAsync(partida);
                return Ok(updatedPartida);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al finalizar partida {id}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
