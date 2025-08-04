using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Entity.Model.Base;

namespace Entity.Model
{
    public class Jugador : BaseModel
    {
        public int IdPartida { get; set; } // ID de la partida a la que pertenece el jugador
        
        [MaxLength(100)]
        public string Nombre { get; set; } = null!; // Nombre del jugador
        
        [MaxLength(100)]
        public string Avatar { get; set; } = null!; // Avatar del jugador
        
        public int PosicionTurno { get; set; } // Posición del jugador en el turno (1, 2, 3, etc.)
        public int PuntosAcumulados { get; set; } = 0; // Puntos acumulados por el jugador

        // Navegación
        public Partida Partida { get; set; } = null!;
        public ICollection<CartaJugador> CartasJugador { get; set; } = new List<CartaJugador>();
        public ICollection<Ronda> RondasGanadas { get; set; } = new List<Ronda>();
        public ICollection<Ronda> RondasQueElige { get; set; } = new List<Ronda>();
        public ICollection<Jugada> Jugadas { get; set; } = new List<Jugada>();
    }
}
