using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Entity.Context;
using Entity.Model.Base;
using Microsoft.EntityFrameworkCore;

namespace Entity.Model
{
    public class Jugada : BaseModel
    {
        public int IdRonda { get; set; } // ID de la ronda a la que pertenece la jugada
        public int IdJugador { get; set; } // ID del jugador que realiza la jugada
        public int IdCartaJugador { get; set; } // ID de la carta del jugador

        //Relaciones entre tablas
        public Ronda Ronda { get; set; } // Relación con Ronda
        public Jugador Jugador { get; set; } // Relación con Jugador
        public CartaJugador CartaJugador { get; set; } // Relación con CartaJugador
    }
}