using System;
using System.Collections.Generic;
using Entity.Dto.Base;
namespace Entity.Dto
{
    /// <summary>
    /// Clase base para los DTOs que contiene los de su entidad.
    /// Esta clase hereda de BaseDto para incluir propiedades comunes a todos los DTOs.
    /// </summary>
    public abstract class CartaJugadorDto : BaseDto
    {
        public int IdJugador { get; set; } // ID del jugador que posee la carta
        public int IdCarta { get; set; } // ID de la carta
        public bool Usada { get; set; } // Indica si la carta ha sido usada en la partida
    }
}
