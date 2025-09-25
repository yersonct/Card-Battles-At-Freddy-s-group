using System.Text;
using System.Text.Json;
using Business.Implements;
using Business.Interfaces;
using Data.Implements.BaseData;
using Data.Interfaces;
using Entity.Context;
using FluentValidation;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Web.ServiceExtension;
using Entity.Model;
using Utilities.Mappers.Profiles;  // <- debe coincidir con el namespace del perfil
using Microsoft.Extensions.DependencyInjection; // para que aparezcan las extension methods
using AutoMapper; // no imprescindible, pero ayuda

var builder = WebApplication.CreateBuilder(args);

// Configurar Kestrel para aceptar conexiones de cualquier IP
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(7147); // HTTP en puerto 7147
    // También configurar para HTTPS en desarrollo
    if (builder.Environment.IsDevelopment())
    {
        serverOptions.ListenAnyIP(7148, listenOptions =>
        {
            listenOptions.UseHttps(); // HTTPS en puerto 7148
        });
    }
});

// Add controllers
builder.Services.AddControllers().AddNewtonsoftJson(); // Añadir soporte para JsonPatch
builder.Services.AddApplicationServices(builder.Configuration);

builder.Services.AddValidatorsFromAssemblyContaining(typeof(Program));

// Swagger
builder.Services.AddSwaggerDocumentation();

// Configuración de base de datos dinámica
var databaseProvider = builder.Configuration.GetValue<string>("DatabaseProvider") ?? "MySql";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    switch (databaseProvider.ToLower())
    {
        case "mysql":
            var mysqlConnection = builder.Configuration.GetConnectionString("MySqlConnection") 
                ?? builder.Configuration.GetConnectionString("DefaultConnection");
            options.UseMySql(mysqlConnection, ServerVersion.AutoDetect(mysqlConnection), mySql => mySql.MigrationsAssembly("Entity")); // 👈);
            
            break;
        
        case "sqlserver":
            var sqlServerConnection = builder.Configuration.GetConnectionString("SqlServerConnection");
            options.UseSqlServer(sqlServerConnection);
            break;
        
        default:
            // Por defecto usar MySQL con Pomelo
            var defaultConnection = builder.Configuration.GetConnectionString("DefaultConnection");
            options.UseMySql(defaultConnection, ServerVersion.AutoDetect(defaultConnection));
            break;
    }
});

// Register generic repositories and business logic
builder.Services.AddScoped(typeof(IBaseModelData<>), typeof(BaseModelData<>));
builder.Services.AddScoped(typeof(IBaseBusiness<,>), typeof(BaseBusiness<,>));

// Registrar servicios específicos de Business
builder.Services.AddScoped<IPartidaBusiness, PartidaBusiness>();

// Registrar logging
builder.Services.AddLogging();
// AutoMapper: registra tus perfiles
// AutoMapper
builder.Services.AddAutoMapper(cfg => { }, typeof(Utilities.Mappers.Profiles.RondaProfile).Assembly);



var app = builder.Build();

// Swagger (solo en desarrollo)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API sistema de juego");
        c.RoutePrefix = string.Empty;
    });
}

app.UseCors("AllowAll");

// Autenticación y autorización
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// --- Inicializar la base de datos y ejecutar la aplicación ---
await app.InitializeDatabaseAsync();
app.Run();


/// <summary>
/// Clase de extensión para encapsular la lógica de inicialización de la base de datos.
/// </summary>
public static class DatabaseInitializer
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<Program>>();
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        var env = services.GetRequiredService<IWebHostEnvironment>();

        try
        {
            logger.LogInformation("Iniciando inicialización de la base de datos...");

            if (env.IsDevelopment())
            {
                // En desarrollo, siempre borramos y volvemos a crear la base de datos
                // para asegurar un estado limpio en cada ejecución.
                logger.LogInformation("Entorno de desarrollo detectado. Recreando la base de datos...");
                // await dbContext.Database.EnsureDeletedAsync();
                await dbContext.Database.MigrateAsync();
                logger.LogInformation("Base de datos recreada y migrada con éxito.");
            }
            else
            {
                // En producción, solo aplicamos migraciones pendientes.
                if ((await dbContext.Database.GetPendingMigrationsAsync()).Any())
                {
                    logger.LogInformation("Aplicando migraciones pendientes...");
                    await dbContext.Database.MigrateAsync();
                    logger.LogInformation("Migraciones aplicadas exitosamente.");
                }
            }

            // Después de asegurar que la BD está en el estado correcto, cargamos los datos.
            await SeedDataAsync(services);

            logger.LogInformation("Inicialización de la base de datos completada.");
        }
        catch (Exception ex)
        {
            // Si algo falla aquí, es un error crítico.
            logger.LogCritical(ex, "Error crítico durante la inicialización de la base de datos. La aplicación se detendrá.");
            throw;
        }
    }

    private static async Task SeedDataAsync(IServiceProvider services)
    {
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        var webHostEnvironment = services.GetRequiredService<IWebHostEnvironment>();

        // Seeding de Cartas
        if (!await dbContext.Cartas.AnyAsync())
        {
            logger.LogInformation("Tabla 'Cartas' vacía. Iniciando carga de datos desde JSON...");
            var fileProvider = webHostEnvironment.WebRootFileProvider;
            var fileInfo = fileProvider.GetFileInfo("data/CartasCompletas.json");

            if (fileInfo.Exists)
            {
                logger.LogInformation($"Leyendo archivo de datos desde: {fileInfo.PhysicalPath ?? "memoria"}");
                try
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    
                    using var stream = fileInfo.CreateReadStream();
                    var cartasDto = await JsonSerializer.DeserializeAsync<List<CartaSeedDto>>(stream, options);

                    if (cartasDto != null && cartasDto.Any())
                    {
                        var nuevasCartas = new List<Carta>();
                        var processedIds = new HashSet<int>(); // Para rastrear IDs y evitar duplicados
                        foreach (var dto in cartasDto)
                        {
                            // Comprobar si el ID ya ha sido procesado para evitar errores de tracking
                            if (!processedIds.Add(dto.Id))
                            {
                                logger.LogWarning($"ID de carta duplicado encontrado en el archivo JSON: {dto.Id}. Se omitirá esta entrada.");
                                continue;
                            }

                            byte[]? imagenBytes = null;
                            if (!string.IsNullOrEmpty(dto.Imagen)) // Si el JSON tiene una ruta de imagen
                            {
                                // --- INICIO DE LA SOLUCIÓN ---
                                // Normalizar la ruta de la imagen para hacerla más robusta a errores comunes en el JSON.
                                // 1. Reemplazar barras invertidas (\) por barras normales (/).
                                // 2. Quitar cualquier barra inicial para asegurar que la ruta sea relativa a wwwroot.
                                var normalizedImagePath = dto.Imagen.Replace('\\', '/').TrimStart('/');

                                // Usar IFileProvider también para las imágenes, es más robusto.
                                var imageInfo = fileProvider.GetFileInfo(normalizedImagePath); // Usar la ruta normalizada
                                if (imageInfo.Exists)
                                {
                                    using var imageStream = imageInfo.CreateReadStream();
                                    using var memoryStream = new MemoryStream();
                                    await imageStream.CopyToAsync(memoryStream);
                                    imagenBytes = memoryStream.ToArray();
                                }
                                else
                                {
                                    // CAMBIO: Se convierte en una advertencia en lugar de un error. La carga continuará sin la imagen.
                                    logger.LogWarning($"IMAGEN NO ENCONTRADA para la carta '{dto.Nombre}' (ID: {dto.Id}). Ruta buscada: '{normalizedImagePath}'. La carta se agregará sin imagen.");
                                    // No se usa 'continue', se permite que la carta se agregue con imagenBytes = null.
                                }
                            }

                            // Validar que los campos requeridos no sean nulos antes de crear la entidad
                            if (string.IsNullOrEmpty(dto.Nombre) || string.IsNullOrEmpty(dto.Rareza) || string.IsNullOrEmpty(dto.Categoria))
                            {
                                logger.LogWarning($"Datos incompletos (Nombre, Rareza, Tipo/Categoria o Imagen) para la carta con ID {dto.Id} ('{dto.Nombre}'). La carta no será agregada.");
                                continue;
                            }

                            // Crear la entidad Carta solo con las propiedades que existen en la clase
                            nuevasCartas.Add(new Carta { Id = dto.Id, Nombre = dto.Nombre!, Ataque = dto.Ataque, Defensa = dto.Defensa, Categoria = dto.Categoria!, Rareza = dto.Rareza!, Imagen = imagenBytes, Vida = dto.Vida, Velocidad = dto.Velocidad ,Poder = dto.Poder, Terror = dto.Terror });
                        }

                        if (nuevasCartas.Any())
                        {
                            await dbContext.Cartas.AddRangeAsync(nuevasCartas);
                            await dbContext.SaveChangesAsync();
                            logger.LogInformation($"ÉXITO: Se han cargado los datos de {nuevasCartas.Count} de {cartasDto.Count} cartas a la base de datos. Revise las advertencias (warnings) si faltan imágenes.");
                        }
                        else
                        {
                            // CAMBIO: Se elimina el error crítico. Si no se carga nada, es porque todas las cartas tenían datos incompletos (Nombre, Rareza, etc.), lo cual se advierte arriba.
                            logger.LogWarning("No se preparó ninguna carta para la carga. Verifique las advertencias anteriores sobre datos incompletos (excluyendo imágenes).");
                        }
                    }
                    else
                    {
                        logger.LogWarning("El archivo JSON de cartas está vacío o no se pudo deserializar.");
                    }
                }
                catch (JsonException jsonEx)
                {
                    logger.LogError(jsonEx, "Error al deserializar el archivo JSON de cartas. Verifique el formato del archivo y la estructura de CartaSeedDto.");
                    throw;
                }
            }
            else
            {
                logger.LogWarning("El archivo de datos para el seeding 'data/CartasCompletas.json' no se encontró en wwwroot.");
            }
        }
        else
        {
            logger.LogInformation("La base de datos ya contiene cartas. No se necesita seeding.");
        }
    }

    // DTO para leer los datos de las cartas desde JSON, donde la imagen es una ruta (string)
    private class CartaSeedDto
    {
        public int Id { get; set; }
        public string? Nombre { get; set; }
        public string? Imagen { get; set; }
        public string? Descripcion { get; set; }
        public int Ataque { get; set; }
        public int Defensa { get; set; }
        public string? Categoria { get; set; } // Propiedad para mapear la categoría desde el JSON.
        public string? Rareza { get; set; }
        public int Vida { get; set; }
        public int Velocidad { get; set; }
        public int Poder { get; set; }
        public int Terror { get; set; }
    }
}
