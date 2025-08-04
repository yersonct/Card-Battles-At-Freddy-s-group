using System;
using System.ComponentModel.DataAnnotations;
using Entity.Model.Base;

namespace Entity.Model
{
    public class Jugada : BaseModel
    {
        public int IdRonda { get; set; } // ID de la ronda a la que pertenece la jugada
        public int IdJugador { get; set; } // ID del jugador que realiza la jugada
        public int IdCartaJugador { get; set; } // ID de la carta del jugador
        public int ValorAtributo { get; set; } // El valor del atributo de la carta jugada
        public DateTime FechaJugada { get; set; } = DateTime.Now;

        // Navegación
        public Ronda Ronda { get; set; } = null!;
        public Jugador Jugador { get; set; } = null!;
        public CartaJugador CartaJugador { get; set; } = null!;
    }
}