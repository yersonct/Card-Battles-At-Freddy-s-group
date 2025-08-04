using System;
using System.Collections.Generic;
using Entity.Dto.Base;
namespace Entity.Dto
{
    /// <summary>
    /// Clase base para los DTOs que contiene los de su entidad.
    /// Esta clase hereda de BaseDto para incluir propiedades comunes a todos los DTOs.
    /// </summary>
    public class RondaDto : BaseDto
    {
        public int IdPartida { get; set; } // ID de la partida a la que pertenece la ronda
        public int IdJugada { get; set; } // ID de la jugada a la que pertenece la ronda
        public int IdJugador { get; set; } // ID del jugador que realiza la ronda
        public int NumeroRonda { get; set; } // Número de la ronda
        public string AtributoCompetido { get; set; } = string.Empty; // Ejemplo: "Ataque", "Defensa", etc.
        public string Estado { get; set; } = "Esperando"; // Esperando, EnProgreso, Finalizada

    }
}