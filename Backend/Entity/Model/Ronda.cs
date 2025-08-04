using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Entity.Model.Base;

namespace Entity.Model
{
    public class Ronda : BaseModel
    {
        public int IdPartida { get; set; } // ID de la partida a la que pertenece la ronda
        public int NumeroRonda { get; set; } // Número de la ronda
        
        [MaxLength(100)]
        public string AtributoCompetido { get; set; } = null!; // Ejemplo: "Ataque", "Defensa", etc.
        
        public int IdJugadorQueElige { get; set; } // Jugador que eligió el atributo
        public int? IdGanador { get; set; } // ID del jugador ganador de la ronda
        
        [MaxLength(50)]
        public string Estado { get; set; } = "Esperando"; // Esperando, EnProgreso, Finalizada
        
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }

        // Navegación
        public Partida Partida { get; set; } = null!;
        public Jugador JugadorQueElige { get; set; } = null!;
        public Jugador? Ganador { get; set; }
        public ICollection<Jugada> Jugadas { get; set; } = new List<Jugada>();
    }
}