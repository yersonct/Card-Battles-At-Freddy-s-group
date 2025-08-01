using Dapper;
using Entity.Model;
using Entity.Model.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Reflection;

namespace Entity.Context
{
    /// <summary>
    /// Representa el contexto de la base de datos de la aplicación, proporcionando configuraciones y métodos
    /// para la gestión de entidades y consultas personalizadas con Dapper.
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        /// <summary>
        /// Configuración de la aplicación.
        /// </summary>
        protected readonly IConfiguration _configuration;

        /// <summary>
        /// Constructor del contexto de la base de datos.
        /// </summary>
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IConfiguration configuration)
        : base(options)
        {
            _configuration = configuration;
        }

        ///
        /// DB SETS
        ///
        public DbSet<Partida> Partidas { get; set; } = null!;
        public DbSet<Ronda> Rondas { get; set; } = null!;
        public DbSet<Jugada> Jugadas { get; set; } = null!;
        public DbSet<Jugador> Jugadores { get; set; } = null!;
        public DbSet<Carta> Cartas { get; set; } = null!;
        public DbSet<CartaJugador> CartaJugadores { get; set; } = null!;

        /// <summary>
        /// Configura los modelos de la base de datos aplicando configuraciones desde ensamblados.
        /// </summary>
        /// <param name="modelBuilder">Constructor del modelo de base de datos.</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // configura los modelos de la base de datos
            // configuracion de carta
            modelBuilder.Entity<Carta>(
                entity =>
                {
                    // es varchar(100) y no nulo
                    entity.Property(e => e.Nombre)
                        .HasColumnType("varchar(100)");

                    // es varchar(100) y unico
                    entity.Property(e => e.Categoria)
                        .HasColumnType("varchar(100)")
                        .IsRequired();
                    entity.HasIndex(e => e.Categoria).IsUnique();
                }

            );
            // configuracion de carta jugador
            modelBuilder.Entity<Jugador>(
                entity =>
                {
                    // es varchar(100) y no nulo
                    entity.Property(e => e.Nombre)
                        .HasColumnType("varchar(100)")
                        .IsRequired();
                    // es varchar(100) y no nulo
                    entity.Property(e => e.Avatar)
                        .HasColumnType("varchar(100)")
                        .IsRequired();
                    
                }
            );
            // configuracion de ronda
            modelBuilder.Entity<Ronda>(
                entity =>
                {
                    // es varchar(100) y no nulo
                    entity.Property(e => e.AtributoCompetido)
                        .HasColumnType("varchar(100)")
                        .IsRequired();

                    entity.HasOne(e => e.Partida)
                        .WithMany(e => e.Ronda)
                        .HasForeignKey(e => e.IdPartida);

                    entity.HasOne(e => e.Jugador)
                        .WithMany(e => e.Ronda)
                        .HasForeignKey(e => e.IdJugador);

                    entity.HasOne(e => e.Jugador)
                        .WithMany(e => e.Ronda)
                        .HasForeignKey(e => e.IdGanador);
                }
            );

            // configuracion de jugada
            modelBuilder.Entity<Jugada>(
                entity =>
                {
                    entity.HasOne(e => e.Ronda)
                        .WithMany(e => e.Jugada)
                        .HasForeignKey(e => e.IdRonda);

                    entity.HasOne(e => e.Jugador)
                        .WithMany(e => e.Jugada)
                        .HasForeignKey(e => e.IdJugador);

                    entity.HasOne(e => e.CartaJugador)
                        .WithMany(e => e.Jugada)
                        .HasForeignKey(e => e.IdCartaJugador);
                }
            );

            // configuracion de CartaJugador
            modelBuilder.Entity<CartaJugador>(
                entity =>
                {
                    entity.HasOne(e => e.Jugador)
                        .WithMany(e => e.CartaJugador)
                        .HasForeignKey(e => e.IdJugador);
                        
                    entity.HasOne(e => e.Carta)
                        .WithMany(e => e.CartaJugador)
                        .HasForeignKey(e => e.IdCarta);
                }
            );
        }

        /// <summary>
        /// Configura opciones adicionales del contexto, como el registro de datos sensibles.
        /// </summary>
        /// <param name="optionsBuilder">Constructor de opciones de configuración del contexto.</param>
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.EnableSensitiveDataLogging();
            // Otras configuraciones adicionales pueden ir aquí
        }

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            configurationBuilder.Properties<decimal>().HavePrecision(18, 2);
        }
        /// Guarda los cambios en la base de datos, asegurando la auditoría antes de persistir los datos.
        /// <returns>Número de filas afectadas.</returns>
        public override int SaveChanges()
        {
            EnsureAudit();
            return base.SaveChanges();
        }
        /// <summary>
        /// Guarda los cambios en la base de datos de manera asíncrona, asegurando la auditoría antes de la persistencia.
        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            EnsureAudit();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        /// <summary>
        /// Ejecuta una consulta SQL utilizando Dapper y devuelve una colección de resultados de tipo genérico.
        /// </summary>
        public async Task<IEnumerable<T>> QueryAsync<T>(string text, object parameters = null, int? timeout = null, CommandType? type = null)
        {
            using var command = new DapperEFCoreCommand(this, text, parameters, timeout, type, CancellationToken.None);
            var connection = this.Database.GetDbConnection();
            return await connection.QueryAsync<T>(command.Definition);
        }

        /// <summary>
        /// Ejecuta una consulta SQL utilizando Dapper y devuelve un solo resultado o el valor predeterminado si no hay resultados.
        /// </summary>
        public async Task<T> QueryFirstOrDefaultAsync<T>(string text, object parameters = null, int? timeout = null, CommandType? type = null)
        {
            using var command = new DapperEFCoreCommand(this, text, parameters, timeout, type, CancellationToken.None);
            var connection = this.Database.GetDbConnection();
            return await connection.QueryFirstOrDefaultAsync<T>(command.Definition);
        }

        public async Task<int> ExecuteAsync(String text, object parametres = null, int? timeout = null, CommandType? type = null)
        {
            using var command = new DapperEFCoreCommand(this, text, parametres, timeout, type, CancellationToken.None);
            var connection = this.Database.GetDbConnection();
            return await connection.ExecuteAsync(command.Definition);
        }

        //Devolver Objeto
        public async Task<T> ExecuteScalarAsync<T>(string query, object parameters = null, int? timeout = null, CommandType? type = null)
        {
            using var command = new DapperEFCoreCommand(this, query, parameters, timeout, type, CancellationToken.None);
            var connection = this.Database.GetDbConnection();
            return await connection.ExecuteScalarAsync<T>(command.Definition);
        }

        /// <summary>
        /// Método interno para garantizar la auditoría de los cambios en las entidades.
        /// </summary>
        private void EnsureAudit()
        {
            ChangeTracker.DetectChanges();
        }

        /// <summary>
        /// Estructura para ejecutar comandos SQL con Dapper en Entity Framework Core.
        /// </summary>
        public readonly struct DapperEFCoreCommand : IDisposable
        {
            /// <summary>
            /// Constructor del comando Dapper.
            /// </summary>
            public DapperEFCoreCommand(DbContext context, string text, object parameters, int? timeout, CommandType? type, CancellationToken ct)
            {
                var transaction = context.Database.CurrentTransaction?.GetDbTransaction();
                var commandType = type ?? CommandType.Text;
                var commandTimeout = timeout ?? context.Database.GetCommandTimeout() ?? 30;

                Definition = new CommandDefinition(
                    text,
                    parameters,
                    transaction,
                    commandTimeout,
                    commandType,
                    cancellationToken: ct
                );
            }

            /// <summary>
            /// Define los parámetros del comando SQL.
            /// </summary>
            public CommandDefinition Definition { get; }

            /// <summary>
            /// Método para liberar los recursos.
            /// </summary>
            public void Dispose()
            {
            }
        }
    }
}