using Microsoft.AspNetCore.Mvc;
using Business.Interfaces;
using Entity.Model;
using Entity.Dto;
using System.Text.Json;
using System.Text.Json.Serialization;

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

        /// <summary>
        /// Inserta las cartas predefinidas desde el JSON con sus imágenes
        /// </summary>
        /// <returns>Resultado de la operación</returns>
        [HttpPost("insertar-cartas-predefinidas")]
        public async Task<IActionResult> InsertarCartasPredefinidas()
        {
            try
            {
                // Ruta al archivo JSON de cartas
                var jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "CartasCompletas.json");
                var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

                // Verificar si el archivo existe
                if (!System.IO.File.Exists(jsonPath))
                {
                    return BadRequest("El archivo de cartas JSON no fue encontrado");
                }

                // Leer el archivo JSON
                var jsonContent = await System.IO.File.ReadAllTextAsync(jsonPath);
                var cartasJson = JsonSerializer.Deserialize<List<CartaJson>>(jsonContent);

                if (cartasJson == null || !cartasJson.Any())
                {
                    return BadRequest("No se pudieron cargar las cartas del archivo JSON");
                }

                var cartasInsertadas = 0;

                foreach (var cartaJson in cartasJson)
                {
                    try
                    {
                        // Verificar si la carta ya existe
                        var entities = await _business.GetAllAsync();
                        var cartaExistente = entities.FirstOrDefault(c => 
                            c.Categoria == cartaJson.NumeroCart && 
                            c.Nombre == cartaJson.NombreCarta);

                        if (cartaExistente != null)
                        {
                            _logger.LogInformation($"La carta {cartaJson.NombreCarta} ya existe, omitiendo...");
                            continue;
                        }

                        // Cargar imagen
                        byte[]? imagenBytes = null;
                        var imageFullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", 
                            cartaJson.ImagenPersonaje.Replace("../", "").Replace("/", "\\"));

                        if (System.IO.File.Exists(imageFullPath))
                        {
                            imagenBytes = await System.IO.File.ReadAllBytesAsync(imageFullPath);
                        }
                        else
                        {
                            _logger.LogWarning($"Imagen no encontrada para {cartaJson.NombreCarta}: {imageFullPath}");
                            // Crear una imagen placeholder o continuar sin imagen
                            imagenBytes = new byte[0];
                        }

                        // Crear el DTO de la carta
                        var cartaDto = new CartaDto
                        {
                            Nombre = cartaJson.NombreCarta,
                            Categoria = cartaJson.NumeroCart,
                            Imagen = imagenBytes ?? new byte[0],
                            Vida = int.Parse(cartaJson.EtiquetaEstadistica[0].Vida),
                            Ataque = int.Parse(cartaJson.EtiquetaEstadistica[0].Ataque),
                            Defensa = int.Parse(cartaJson.EtiquetaEstadistica[0].Defensa),
                            Velocidad = int.Parse(cartaJson.EtiquetaEstadistica[0].Velocidad),
                            Terror = int.Parse(cartaJson.EtiquetaEstadistica[0].Terror)
                        };

                        // Insertar en la base de datos
                        await _business.CreateAsync(cartaDto);
                        cartasInsertadas++;
                        
                        _logger.LogInformation($"Carta insertada: {cartaDto.Nombre}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Error al insertar carta {cartaJson.NombreCarta}: {ex.Message}");
                    }
                }

                return Ok(new { 
                    mensaje = $"Proceso completado. {cartasInsertadas} cartas insertadas.",
                    cartasInsertadas = cartasInsertadas,
                    totalCartas = cartasJson.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al insertar cartas predefinidas: {ex.Message}");
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }

    // Clases auxiliares para deserializar el JSON
    public class CartaJson
    {
        [JsonPropertyName("numero-carta")]
        public string NumeroCart { get; set; } = "";
        
        [JsonPropertyName("nombre-carta")]
        public string NombreCarta { get; set; } = "";
        
        [JsonPropertyName("imagen-personaje")]
        public string ImagenPersonaje { get; set; } = "";
        
        [JsonPropertyName("etiqueta-estadistica")]
        public List<EstadisticasJson> EtiquetaEstadistica { get; set; } = new();
        
        [JsonPropertyName("texto-trasero")]
        public string TextoTrasero { get; set; } = "";
    }

    public class EstadisticasJson
    {
        [JsonPropertyName("VIDA")]
        public string Vida { get; set; } = "0";
        
        [JsonPropertyName("ATAQUE")]
        public string Ataque { get; set; } = "0";
        
        [JsonPropertyName("DEFENSA")]
        public string Defensa { get; set; } = "0";
        
        [JsonPropertyName("VELOCIDAD")]
        public string Velocidad { get; set; } = "0";
        
        [JsonPropertyName("PODER")]
        public string Poder { get; set; } = "0";
        
        [JsonPropertyName("TERROR")]
        public string Terror { get; set; } = "0";
    }
}
