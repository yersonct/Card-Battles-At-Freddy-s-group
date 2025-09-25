using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Api.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace Api.Data
{
    public class DataSeeder
    {
        private readonly IWebHostEnvironment _webHostEnvironment;

        public DataSeeder(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task SeedAsync(DataContext context, ILoggerFactory loggerFactory)
        {
            try
            {
                // Seed Cartas from JSON
                if (!context.Cartas.Any())
                {
                    var rootPath = _webHostEnvironment.WebRootPath;
                    var jsonPath = Path.Combine(rootPath, "data", "CartasCompletas.json");
                    var cartasData = await File.ReadAllTextAsync(jsonPath);

                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var cartas = JsonSerializer.Deserialize<List<Carta>>(cartasData, options);

                    if (cartas != null)
                    {
                        await context.Cartas.AddRangeAsync(cartas);
                        await context.SaveChangesAsync();
                    }
                }
            }
            catch (System.Exception ex)
            {
                var logger = loggerFactory.CreateLogger<DataSeeder>();
                logger.LogError(ex, "Ocurrió un error durante la inserción de datos (seeding).");
            }
        }
    }
}
