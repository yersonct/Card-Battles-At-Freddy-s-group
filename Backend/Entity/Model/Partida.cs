using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Entity.Context;
using Entity.Model.Base;
using Microsoft.EntityFrameworkCore;

namespace Entity.Model
{
    public class Partida : BaseModel
    {
        public DateTime FechaInicio { get; set; } // Fecha de inicio de la partida
        public DateTime TiempoPartida { get; set; } // Tiempo de la partida
        public bool Estado { get; set; }  // Ejemplo de estado: "true", "false".
        public int RondasJugadas { get; set; } // Número de rondas jugadas en la partida

        
        public ICollection<Ronda> Ronda { get; set; } // Relación con Ronda
    }
}