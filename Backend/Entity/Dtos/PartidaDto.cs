using System;
using System.Collections.Generic;
using Entity.Dto.Base;
namespace Entity.Dto
{
    /// <summary>
    /// Clase base para los DTOs que contiene los de su entidad.
    /// Esta clase hereda de BaseDto para incluir propiedades comunes a todos los DTOs.
    /// </summary>
    public abstract class PartidaDto : BaseDto
    {
        public DateTime FechaInicio { get; set; } // Fecha de inicio de la partida
        public DateTime TiempoPartida { get; set; } // Tiempo de la partida
        public bool Estado { get; set; }  // Ejemplo de estado: "true", "false".
        public int RondasJugadas { get; set; } // Número de rondas jugadas en la partida

    }
}