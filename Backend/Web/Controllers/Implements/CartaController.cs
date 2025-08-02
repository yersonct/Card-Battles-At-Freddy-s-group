using Microsoft.AspNetCore.Mvc;
using Business.Interfaces;
using Entity.Model;
using Entity.Dto;

namespace Web.Controllers.Implements
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartaController : GenericController<CartaDto, Carta>
    {
        public CartaController(IBaseBusiness<Carta, CartaDto> business, ILogger<GenericController<CartaDto, Carta>> logger)
            : base(business, logger)
        {
        }

        protected override int GetEntityId(CartaDto dto)
        {
            return dto.Id;
        }

        

        /// <summary>
        /// Obtiene cartas por categoría
        /// </summary>
        /// <param name="categoria">Categoría de las cartas a buscar</param>
        /// <returns>Lista de cartas de la categoría especificada</returns>
        [HttpGet("categoria/{categoria}")]
        public async Task<IActionResult> GetCartasByCategoria(string categoria)
        {
            try
            {
                var entities = await _business.GetAllAsync();
                var cartasByCategoria = entities.Where(c => c.Categoria.ToLower() == categoria.ToLower()).ToList();
                return Ok(cartasByCategoria);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener cartas por categoría {categoria}: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
