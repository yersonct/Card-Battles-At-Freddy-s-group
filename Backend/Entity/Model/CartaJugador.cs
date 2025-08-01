using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Entity.Context;
using Entity.Model.Base;
using Microsoft.EntityFrameworkCore;

namespace Entity.Model
{
    public class CartaJugador : BaseModel
    {
        public int IdJugador { get; set; } // ID del jugador que posee la carta
        public int IdCarta { get; set; } // ID de la carta
        public bool Usada { get; set; } // Indica si la carta ha sido usada en la partida

        // relaciones entre tablas
        public ICollection<Jugada> Jugada { get; set; } // Relación con Jugada
        public Carta Carta { get; set; } // Relación con Carta
        public Jugador Jugador { get; set; } // Relación con Jugador
    }
}