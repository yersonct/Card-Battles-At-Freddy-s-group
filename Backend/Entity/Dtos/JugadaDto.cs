using System;
using System.Collections.Generic;
using Entity.Dto.Base;
namespace Entity.Dto
{
    /// <summary>
    /// Clase base para los DTOs que contiene los de su entidad.
    /// Esta clase hereda de BaseDto para incluir propiedades comunes a todos los DTOs.
    /// </summary>
    public abstract class JugadaDto : BaseDto
    {
        public int IdRonda { get; set; } // ID de la ronda a la que pertenece la jugada
        public int IdJugador { get; set; } // ID del jugador que realiza la jugada
        public int IdCartaJugador { get; set; } // ID de la carta del jugador

    }
}

 