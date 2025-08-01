using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Entity.Context;
using Entity.Model.Base;
using Microsoft.EntityFrameworkCore;

namespace Entity.Model
{
    public class Ronda : BaseModel
    {
        public int IdJugada { get; set; } // ID de la jugada a la que pertenece la ronda
        public int IdJugador { get; set; } // ID del jugador que realiza la ronda
        public int IdGanador { get; set; } // ID del jugador ganador de la ronda
        public int NumeroRonda { get; set; } // Número de la ronda
        public string AtributoCompetido { get; set; } // Ejemplo: "Ataque", "Defensa", etc.

        // relaciones entre tablas
        public int IdPartida { get; set; } // ID de la partida a la que pertenece la rond
        public Partida Partida { get; set; } // Relación con Partida
        public ICollection<Jugada> Jugada { get; set; } // Relación con Jugada
        public Jugador Jugador { get; set; } // Relación con Jugador
    }
}