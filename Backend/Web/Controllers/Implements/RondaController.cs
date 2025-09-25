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
        public RondaController(
            IBaseBusiness<Ronda, RondaDto> business,
            ILogger<GenericController<RondaDto, Ronda>> logger
        ) : base(business, logger) { }

        protected override int GetEntityId(RondaDto dto) => dto.Id;

        // ===================== LECTURAS =====================
        [HttpGet("partida/{partidaId}")]
        public async Task<IActionResult> GetRondasByPartida(int partidaId)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var rondasByPartida = entities
                    .Where(r => r.IdPartida == partidaId)
                    .OrderBy(r => r.NumeroRonda)
                    .ToList();
                return Ok(rondasByPartida);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener rondas por partida {partidaId}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("partida/{partidaId}/actual")]
        public async Task<IActionResult> GetRondaActual(int partidaId)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var rondaActual = entities
                    .Where(r => r.IdPartida == partidaId)
                    .OrderByDescending(r => r.NumeroRonda)
                    .ThenByDescending(r => r.Id) // empate por número
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

        // ===================== COMANDOS =====================
        // 1) Fijar atributo y poner EnProgreso
        public class SetAtributoRequest { public string? Atributo { get; set; } }

        [HttpPut("{id}/atributo")]
        public async Task<IActionResult> SetAtributoCompetido(int id, [FromBody] SetAtributoRequest req)
        {
            try
            {
                var ronda = await _business.GetByIdAsync(id);
                if (ronda == null) return NotFound($"Ronda {id} no encontrada");

                var attr = (req?.Atributo ?? string.Empty).Trim().ToLower();
                if (string.IsNullOrWhiteSpace(attr))
                    return BadRequest("Atributo requerido");

                // normaliza “defenza”
                if (attr == "defenza") attr = "defensa";

                ronda.AtributoCompetido = attr;
                ronda.Estado = "EnProgreso";

                var updated = await _business.UpdateAsync(ronda);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al fijar atributo en ronda {id}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // 2) Finalizar ronda (ganador + fecha fin)
        public class FinalizarRondaRequest
        {
            public int? IdGanador { get; set; }
            public int? IdCartaJugadorGanadora { get; set; }
            public int? ValorAtributoGanador { get; set; }
        }

        [HttpPut("{id}/finalizar")]
        public async Task<IActionResult> FinalizarRonda(int id, [FromBody] FinalizarRondaRequest req)
        {
            try
            {
                var ronda = await _business.GetByIdAsync(id);
                if (ronda == null) return NotFound($"Ronda {id} no encontrada");

                ronda.IdGanador = req?.IdGanador;
                ronda.Estado = "Finalizada";
                ronda.FechaFin = DateTime.UtcNow;

                var updated = await _business.UpdateAsync(ronda);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al finalizar ronda {id}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        // ===================== (Opcional) POST que devuelve Id =====================
        // Si tu GenericController ya devuelve el DTO con Id, no hace falta este override.
        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] RondaDto dto)
        {
            try
            {
                var created = await _business.CreateAsync(dto);
                // aseguramos que vuelve con Id y un 201 Created
                return Created($"/api/Ronda/{created.Id}", created);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al crear ronda: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
