using FluentValidation;
using System.Reflection;
using Utilities.Mappers.Profiles;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using AutoMapper;

namespace Web.ServiceExtension
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Registra validadores
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            // Configura CORS
            services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigins", builder =>
                {
                    var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ??
                                       new string[] { "http://localhost:3000", "http://localhost:5173" };

                    builder.WithOrigins(allowedOrigins)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                });

                // Política completamente abierta para desarrollo
                options.AddPolicy("AllowAll", builder =>
                {
                    builder.SetIsOriginAllowed(origin => true) // Permite cualquier origen incluyendo file://
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                });
            });

            // Registra AutoMapper
            services.AddAutoMapper(cfg => 
            {
                cfg.AddMaps(typeof(PartidaProfile).Assembly); // se pone asi por la version de la libreria
            });

            return services;
        }
    }
}