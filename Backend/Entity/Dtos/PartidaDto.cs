using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Entity.Dto.Base;

namespace Entity.Dto
{
    /// <summary>
    /// Clase base para los DTOs que contiene los de su entidad.
    /// Esta clase hereda de BaseDto para incluir propiedades comunes a todos los DTOs.
    /// </summary>
    public class PartidaDto : BaseDto
    {
        public string Codigo { get; set; } = null!; // Código único de 6 caracteres para identificar la partida
        public DateTime FechaInicio { get; set; } = DateTime.Now;
        public DateTime? FechaFin { get; set; }
        public string Estado { get; set; } = "Esperando"; // Esperando, EnJuego, Finalizada
        public int RondaActual { get; set; } = 0;
        public int TurnoActual { get; set; } = 1;
        public int? JugadorQueElige { get; set; }
        public string? AtributoElegido { get; set; }
        public int NumeroJugadores { get; set; } = 0;
        public int MaximoRondas { get; set; } = 8;
    }

    public class CrearPartidaDto
    {
        [Required]
        [MinLength(2)]
        [MaxLength(7)]
        public List<JugadorRegistroDto> Jugadores { get; set; } = new List<JugadorRegistroDto>();
    }

    public class CrearPartidaResponseDto
    {
        public int PartidaId { get; set; }
        public string Codigo { get; set; } = null!;
        public string Mensaje { get; set; } = null!;
    }

    public class JugadorRegistroDto
    {
        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = null!;
        
        [Required]
        [MaxLength(100)]
        public string Avatar { get; set; } = null!;
    }

    public class PartidaEstadoDto
    {
        public int Id { get; set; }
        public string Estado { get; set; } = null!;
        public int RondaActual { get; set; }
        public int TurnoActual { get; set; }
        public string? AtributoElegido { get; set; }
        public List<JugadorDto> Jugadores { get; set; } = new List<JugadorDto>();
        public RondaDto? RondaEnCurso { get; set; }
    }

    public class ElegirAtributoDto
    {
        [Required]
        public int PartidaId { get; set; }
        
        [Required]
        public int JugadorId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Atributo { get; set; } = null!; // "Vida", "Ataque", "Defensa", "Velocidad", "Poder", "Terror"
    }

    public class JugarCartaDto
    {
        [Required]
        public int PartidaId { get; set; }
        
        [Required]
        public int JugadorId { get; set; }
        
        [Required]
        public int CartaJugadorId { get; set; }
    }

    public class RankingPartidaDto
    {
        public int Posicion { get; set; }
        public string NombreJugador { get; set; } = null!;
        public int PuntosObtenidos { get; set; }
    }

    public class ResultadoRondaDto
    {
        public int RondaId { get; set; }
        public int NumeroRonda { get; set; }
        public string AtributoCompetido { get; set; } = null!;
        public int GanadorId { get; set; }
        public string NombreGanador { get; set; } = null!;
        public List<JugadaResultadoDto> Jugadas { get; set; } = new List<JugadaResultadoDto>();
    }

    public class JugadaResultadoDto
    {
        public int JugadorId { get; set; }
        public string NombreJugador { get; set; } = null!;
        public string NombreCarta { get; set; } = null!;
        public int ValorAtributo { get; set; }
    }
}