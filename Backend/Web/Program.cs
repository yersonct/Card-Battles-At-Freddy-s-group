using System.Text;
using Microsoft.EntityFrameworkCore;
using Data.Interfaces;
using Business.Interfaces;
using Business.Implements;
using Web.ServiceExtension;
using FluentValidation;
using Data.Implements.BaseData;
using Entity.Context;

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
            options.UseMySql(mysqlConnection, ServerVersion.AutoDetect(mysqlConnection));
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

// Registrar servicios específicos de Data


// Registrar servicios específicos de Business

// Registrar logging
builder.Services.AddLogging();

// AutoMapper

var app = builder.Build();

// Swagger (solo en desarrollo)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API sitema de juego");
        c.RoutePrefix = string.Empty;
    });
}

// Usa la política de CORS completamente abierta en desarrollo
app.UseCors("AllowAll");

// Deshabilitar HTTPS redirection para desarrollo local
// app.UseHttpsRedirection();

// Autenticación y autorización
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Inicializar base de datos y aplicar migraciones
await InitializeDatabaseAsync(app.Services);

app.Run();

/// <summary>
/// Inicializa la base de datos de manera segura, eliminando y recreando si hay conflictos
/// </summary>
static async Task InitializeDatabaseAsync(IServiceProvider serviceProvider)
{
    using var scope = serviceProvider.CreateScope();
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var configuration = services.GetRequiredService<IConfiguration>();
    
    try
    {
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        var databaseProvider = configuration.GetValue<string>("DatabaseProvider") ?? "MySql";
        
        logger.LogInformation($"Inicializando base de datos con proveedor: {databaseProvider}");
        
        // Verificar si existen migraciones pendientes
        var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
        var appliedMigrations = await dbContext.Database.GetAppliedMigrationsAsync();
        
        logger.LogInformation($"Migraciones aplicadas: {appliedMigrations.Count()}");
        logger.LogInformation($"Migraciones pendientes: {pendingMigrations.Count()}");
        
        if (pendingMigrations.Any())
        {
            logger.LogInformation("Hay migraciones pendientes. Verificando estado de la base de datos...");
            
            try
            {
                // Intentar aplicar migraciones normalmente
                await dbContext.Database.MigrateAsync();
                logger.LogInformation("Migraciones aplicadas exitosamente.");
            }
            catch (Exception migrationEx)
            {
                logger.LogWarning($"Error al aplicar migraciones: {migrationEx.Message}");
                logger.LogInformation("Eliminando y recreando la base de datos...");
                
                // Si hay error, eliminar y recrear la base de datos
                await dbContext.Database.EnsureDeletedAsync();
                logger.LogInformation("Base de datos eliminada.");
                
                await dbContext.Database.MigrateAsync();
                logger.LogInformation("Base de datos recreada con éxito.");
            }
        }
        else
        {
            logger.LogInformation("No hay migraciones pendientes. Base de datos actualizada.");
        }
        
        // Verificar conectividad
        if (await dbContext.Database.CanConnectAsync())
        {
            logger.LogInformation($"Conexión a la base de datos {databaseProvider} verificada exitosamente.");
        }
        else
        {
            logger.LogError($"No se pudo conectar a la base de datos {databaseProvider}.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error crítico durante la inicialización de la base de datos.");
        throw; // Re-lanzar para detener la aplicación si no se puede inicializar la BD
    }
}
