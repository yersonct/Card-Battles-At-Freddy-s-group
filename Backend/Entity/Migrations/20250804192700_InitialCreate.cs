using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Entity.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Cartas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Imagen = table.Column<byte[]>(type: "longblob", nullable: false),
                    Nombre = table.Column<string>(type: "varchar(100)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Rareza = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Categoria = table.Column<string>(type: "varchar(100)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Vida = table.Column<int>(type: "int", nullable: false),
                    Defensa = table.Column<int>(type: "int", nullable: false),
                    Velocidad = table.Column<int>(type: "int", nullable: false),
                    Ataque = table.Column<int>(type: "int", nullable: false),
                    Poder = table.Column<int>(type: "int", nullable: false),
                    Terror = table.Column<int>(type: "int", nullable: false),
                    Active = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cartas", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Partidas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    FechaInicio = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Estado = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false, defaultValue: "Esperando")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RondaActual = table.Column<int>(type: "int", nullable: false),
                    TurnoActual = table.Column<int>(type: "int", nullable: false),
                    JugadorQueElige = table.Column<int>(type: "int", nullable: true),
                    AtributoElegido = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NumeroJugadores = table.Column<int>(type: "int", nullable: false),
                    MaximoRondas = table.Column<int>(type: "int", nullable: false),
                    Active = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partidas", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "RankingPartidas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    IdPartida = table.Column<int>(type: "int", nullable: false),
                    IdJugador = table.Column<int>(type: "int", nullable: false),
                    NombreJugador = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PuntosObtenidos = table.Column<int>(type: "int", nullable: false),
                    Posicion = table.Column<int>(type: "int", nullable: false),
                    FechaPartida = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RankingPartidas", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Jugadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    IdPartida = table.Column<int>(type: "int", nullable: false),
                    Nombre = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Avatar = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PosicionTurno = table.Column<int>(type: "int", nullable: false),
                    PuntosAcumulados = table.Column<int>(type: "int", nullable: false),
                    Active = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jugadores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Jugadores_Partidas_IdPartida",
                        column: x => x.IdPartida,
                        principalTable: "Partidas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CartaJugadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    IdJugador = table.Column<int>(type: "int", nullable: false),
                    IdCarta = table.Column<int>(type: "int", nullable: false),
                    PosicionEnMazo = table.Column<int>(type: "int", nullable: false),
                    Usada = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    RondaUsada = table.Column<int>(type: "int", nullable: true),
                    Active = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartaJugadores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CartaJugadores_Cartas_IdCarta",
                        column: x => x.IdCarta,
                        principalTable: "Cartas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CartaJugadores_Jugadores_IdJugador",
                        column: x => x.IdJugador,
                        principalTable: "Jugadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Rondas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    IdPartida = table.Column<int>(type: "int", nullable: false),
                    NumeroRonda = table.Column<int>(type: "int", nullable: false),
                    AtributoCompetido = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IdJugadorQueElige = table.Column<int>(type: "int", nullable: false),
                    IdGanador = table.Column<int>(type: "int", nullable: true),
                    Estado = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false, defaultValue: "Esperando")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FechaInicio = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    FechaFin = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Active = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rondas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rondas_Jugadores_IdGanador",
                        column: x => x.IdGanador,
                        principalTable: "Jugadores",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Rondas_Jugadores_IdJugadorQueElige",
                        column: x => x.IdJugadorQueElige,
                        principalTable: "Jugadores",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Rondas_Partidas_IdPartida",
                        column: x => x.IdPartida,
                        principalTable: "Partidas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Jugadas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    IdRonda = table.Column<int>(type: "int", nullable: false),
                    IdJugador = table.Column<int>(type: "int", nullable: false),
                    IdCartaJugador = table.Column<int>(type: "int", nullable: false),
                    ValorAtributo = table.Column<int>(type: "int", nullable: false),
                    FechaJugada = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Active = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jugadas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Jugadas_CartaJugadores_IdCartaJugador",
                        column: x => x.IdCartaJugador,
                        principalTable: "CartaJugadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Jugadas_Jugadores_IdJugador",
                        column: x => x.IdJugador,
                        principalTable: "Jugadores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Jugadas_Rondas_IdRonda",
                        column: x => x.IdRonda,
                        principalTable: "Rondas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_CartaJugadores_IdCarta",
                table: "CartaJugadores",
                column: "IdCarta");

            migrationBuilder.CreateIndex(
                name: "IX_CartaJugadores_IdJugador_PosicionEnMazo",
                table: "CartaJugadores",
                columns: new[] { "IdJugador", "PosicionEnMazo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cartas_Categoria",
                table: "Cartas",
                column: "Categoria",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Jugadas_IdCartaJugador",
                table: "Jugadas",
                column: "IdCartaJugador");

            migrationBuilder.CreateIndex(
                name: "IX_Jugadas_IdJugador",
                table: "Jugadas",
                column: "IdJugador");

            migrationBuilder.CreateIndex(
                name: "IX_Jugadas_IdRonda_IdJugador",
                table: "Jugadas",
                columns: new[] { "IdRonda", "IdJugador" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Jugadores_IdPartida",
                table: "Jugadores",
                column: "IdPartida");

            migrationBuilder.CreateIndex(
                name: "IX_RankingPartidas_IdJugador",
                table: "RankingPartidas",
                column: "IdJugador");

            migrationBuilder.CreateIndex(
                name: "IX_RankingPartidas_IdPartida",
                table: "RankingPartidas",
                column: "IdPartida");

            migrationBuilder.CreateIndex(
                name: "IX_Rondas_IdGanador",
                table: "Rondas",
                column: "IdGanador");

            migrationBuilder.CreateIndex(
                name: "IX_Rondas_IdJugadorQueElige",
                table: "Rondas",
                column: "IdJugadorQueElige");

            migrationBuilder.CreateIndex(
                name: "IX_Rondas_IdPartida_NumeroRonda",
                table: "Rondas",
                columns: new[] { "IdPartida", "NumeroRonda" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Jugadas");

            migrationBuilder.DropTable(
                name: "RankingPartidas");

            migrationBuilder.DropTable(
                name: "CartaJugadores");

            migrationBuilder.DropTable(
                name: "Rondas");

            migrationBuilder.DropTable(
                name: "Cartas");

            migrationBuilder.DropTable(
                name: "Jugadores");

            migrationBuilder.DropTable(
                name: "Partidas");
        }
    }
}
