using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Entity.Model.Base;

namespace Entity.Model
{
    public class CartaJugador : BaseModel
    {
        public int IdJugador { get; set; } // ID del jugador que posee la carta
        public int IdCarta { get; set; } // ID de la carta
        public int PosicionEnMazo { get; set; } // Posición de la carta en el mazo (1-8)
        public bool Usada { get; set; } = false; // Indica si la carta ha sido usada en la partida
        public int? RondaUsada { get; set; } // En qué ronda fue usada

        // Navegación
        public Carta Carta { get; set; } = null!;
        public Jugador Jugador { get; set; } = null!;
        public ICollection<Jugada> Jugadas { get; set; } = new List<Jugada>();
    }
}