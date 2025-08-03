using System;
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
            migrationBuilder.CreateTable(
                name: "Cartas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Imagen = table.Column<byte[]>(type: "varbinary(max)", nullable: false),
                    Nombre = table.Column<string>(type: "varchar(100)", nullable: false),
                    Categoria = table.Column<string>(type: "varchar(100)", nullable: false),
                    Vida = table.Column<int>(type: "int", nullable: false),
                    Defensa = table.Column<int>(type: "int", nullable: false),
                    Velocidad = table.Column<int>(type: "int", nullable: false),
                    Ataque = table.Column<int>(type: "int", nullable: false),
                    Terror = table.Column<int>(type: "int", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cartas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Partidas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TiempoPartida = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Estado = table.Column<bool>(type: "bit", nullable: false),
                    RondasJugadas = table.Column<int>(type: "int", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partidas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Jugadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdPartida = table.Column<int>(type: "int", nullable: false),
                    Nombre = table.Column<string>(type: "varchar(100)", nullable: false),
                    Avatar = table.Column<string>(type: "varchar(100)", nullable: false),
                    PosicionTurno = table.Column<int>(type: "int", nullable: false),
                    PuntosAcumulados = table.Column<int>(type: "int", nullable: false),
                    PartidaId = table.Column<int>(type: "int", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jugadores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Jugadores_Partidas_PartidaId",
                        column: x => x.PartidaId,
                        principalTable: "Partidas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CartaJugadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdJugador = table.Column<int>(type: "int", nullable: false),
                    IdJugada = table.Column<int>(type: "int", nullable: false),
                    IdCarta = table.Column<int>(type: "int", nullable: false),
                    Usada = table.Column<bool>(type: "bit", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false)
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
                });

            migrationBuilder.CreateTable(
                name: "Rondas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdJugada = table.Column<int>(type: "int", nullable: false),
                    IdJugador = table.Column<int>(type: "int", nullable: false),
                    IdGanador = table.Column<int>(type: "int", nullable: false),
                    NumeroRonda = table.Column<int>(type: "int", nullable: false),
                    AtributoCompetido = table.Column<string>(type: "varchar(100)", nullable: false),
                    IdPartida = table.Column<int>(type: "int", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false)
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
                        name: "FK_Rondas_Partidas_IdPartida",
                        column: x => x.IdPartida,
                        principalTable: "Partidas",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Jugadas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdRonda = table.Column<int>(type: "int", nullable: false),
                    IdJugador = table.Column<int>(type: "int", nullable: false),
                    IdCartaJugador = table.Column<int>(type: "int", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jugadas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Jugadas_CartaJugadores_IdCartaJugador",
                        column: x => x.IdCartaJugador,
                        principalTable: "CartaJugadores",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Jugadas_Jugadores_IdJugador",
                        column: x => x.IdJugador,
                        principalTable: "Jugadores",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Jugadas_Rondas_IdRonda",
                        column: x => x.IdRonda,
                        principalTable: "Rondas",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CartaJugadores_IdCarta",
                table: "CartaJugadores",
                column: "IdCarta");

            migrationBuilder.CreateIndex(
                name: "IX_CartaJugadores_IdJugador",
                table: "CartaJugadores",
                column: "IdJugador");

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
                name: "IX_Jugadas_IdRonda",
                table: "Jugadas",
                column: "IdRonda");

            migrationBuilder.CreateIndex(
                name: "IX_Jugadores_PartidaId",
                table: "Jugadores",
                column: "PartidaId");

            migrationBuilder.CreateIndex(
                name: "IX_Rondas_IdGanador",
                table: "Rondas",
                column: "IdGanador");

            migrationBuilder.CreateIndex(
                name: "IX_Rondas_IdPartida",
                table: "Rondas",
                column: "IdPartida");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Jugadas");

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
