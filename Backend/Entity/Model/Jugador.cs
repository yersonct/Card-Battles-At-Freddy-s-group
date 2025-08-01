using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Entity.Context;
using Entity.Model.Base;
using Microsoft.EntityFrameworkCore;

namespace Entity.Model
{
    public class Jugador : BaseModel
    {
        public int IdPartida { get; set; } // ID de la partida a la que pertenece el jugador
        public string Nombre { get; set; } = null!; // Nombre del jugador
        public string Avatar { get; set; } = null!; // Avatar del jugador
        public int PosicionTurno { get; set; } // Posición del jugador en el turno
        public int PuntosAcumulados { get; set; } // Puntos acumulados por el jugador

        // relaciones entre tablas
        public Partida Partida { get; set; } // Relación con Partida
        public ICollection<CartaJugador> CartaJugador { get; set; } // Relación con CartaJugador
        public ICollection<Ronda> Ronda { get; set; } // Relación con Ronda
        public ICollection<Jugada> Jugada { get; set; } // Relación con Jugada
    }
}
