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
        public DbSet<RankingPartida> RankingPartidas { get; set; } = null!;

        /// <summary>
        /// Configura los modelos de la base de datos aplicando configuraciones desde ensamblados.
        /// </summary>
        /// <param name="modelBuilder">Constructor del modelo de base de datos.</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuración de Carta
            modelBuilder.Entity<Carta>(entity =>
            {
                entity.Property(e => e.Nombre)
                    .HasColumnType("varchar(100)");

                entity.Property(e => e.Categoria)
                    .HasColumnType("varchar(100)")
                    .IsRequired();
                entity.HasIndex(e => e.Categoria).IsUnique();
            });

            // Configuración de Partida
            modelBuilder.Entity<Partida>(entity =>
            {
                entity.Property(e => e.Estado)
                    .HasColumnType("varchar(50)")
                    .HasDefaultValue("Esperando");

                entity.Property(e => e.AtributoElegido)
                    .HasColumnType("varchar(100)");
            });

            // Configuración de Jugador
            modelBuilder.Entity<Jugador>(entity =>
            {
                entity.Property(e => e.Nombre)
                    .HasColumnType("varchar(100)")
                    .IsRequired();
                
                entity.Property(e => e.Avatar)
                    .HasColumnType("varchar(100)")
                    .IsRequired();

                // Relación con Partida
                entity.HasOne(e => e.Partida)
                    .WithMany(e => e.Jugadores)
                    .HasForeignKey(e => e.IdPartida)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuración de CartaJugador
            modelBuilder.Entity<CartaJugador>(entity =>
            {
                // Índice único para evitar duplicados de posición por jugador
                entity.HasIndex(e => new { e.IdJugador, e.PosicionEnMazo })
                    .IsUnique();

                entity.HasOne(e => e.Jugador)
                    .WithMany(e => e.CartasJugador)
                    .HasForeignKey(e => e.IdJugador)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(e => e.Carta)
                    .WithMany(e => e.CartaJugador)
                    .HasForeignKey(e => e.IdCarta)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuración de Ronda
            modelBuilder.Entity<Ronda>(entity =>
            {
                entity.Property(e => e.AtributoCompetido)
                    .HasColumnType("varchar(100)")
                    .IsRequired();

                entity.Property(e => e.Estado)
                    .HasColumnType("varchar(50)")
                    .HasDefaultValue("Esperando");

                // Índice único para evitar duplicados de número de ronda por partida
                entity.HasIndex(e => new { e.IdPartida, e.NumeroRonda })
                    .IsUnique();

                // Relación con Partida
                entity.HasOne(e => e.Partida)
                    .WithMany(e => e.Rondas)
                    .HasForeignKey(e => e.IdPartida)
                    .OnDelete(DeleteBehavior.Cascade);

                // Relación con JugadorQueElige
                entity.HasOne(e => e.JugadorQueElige)
                    .WithMany(e => e.RondasQueElige)
                    .HasForeignKey(e => e.IdJugadorQueElige)
                    .OnDelete(DeleteBehavior.NoAction);

                // Relación con Ganador
                entity.HasOne(e => e.Ganador)
                    .WithMany(e => e.RondasGanadas)
                    .HasForeignKey(e => e.IdGanador)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // Configuración de Jugada
            modelBuilder.Entity<Jugada>(entity =>
            {
                // Índice único para evitar que un jugador juegue más de una vez por ronda
                entity.HasIndex(e => new { e.IdRonda, e.IdJugador })
                    .IsUnique();

                entity.HasOne(e => e.Ronda)
                    .WithMany(e => e.Jugadas)
                    .HasForeignKey(e => e.IdRonda)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Jugador)
                    .WithMany(e => e.Jugadas)
                    .HasForeignKey(e => e.IdJugador)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.CartaJugador)
                    .WithMany(e => e.Jugadas)
                    .HasForeignKey(e => e.IdCartaJugador)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuración de RankingPartida
            modelBuilder.Entity<RankingPartida>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.NombreJugador)
                    .HasColumnType("varchar(100)")
                    .IsRequired();

                entity.HasIndex(e => e.IdPartida);
                entity.HasIndex(e => e.IdJugador);
            });
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