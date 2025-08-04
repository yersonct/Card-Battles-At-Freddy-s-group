using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Entity.Model.Base;

namespace Entity.Model
{
    public class Partida : BaseModel
    {
        public DateTime FechaInicio { get; set; } = DateTime.Now;
        public DateTime? FechaFin { get; set; }
        
        [MaxLength(50)]
        public string Estado { get; set; } = "Esperando"; // Esperando, EnJuego, Finalizada
        
        public int RondaActual { get; set; } = 0;
        public int TurnoActual { get; set; } = 1; // Posición del jugador que tiene el turno
        public int? JugadorQueElige { get; set; } // ID del jugador que elige el atributo
        
        [MaxLength(100)]
        public string? AtributoElegido { get; set; } // Atributo elegido para la ronda actual
        
        public int NumeroJugadores { get; set; } = 0;
        public int MaximoRondas { get; set; } = 8; // Cada jugador tiene 8 cartas

        // Navegación
        public ICollection<Jugador> Jugadores { get; set; } = new List<Jugador>();
        public ICollection<Ronda> Rondas { get; set; } = new List<Ronda>();
    }
}