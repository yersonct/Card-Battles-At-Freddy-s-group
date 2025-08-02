using System;
using System.Collections.Generic;
using Entity.Dto.Base;
namespace Entity.Dto
{
    /// <summary>
    /// Clase base para los DTOs que contiene los de su entidad.
    /// Esta clase hereda de BaseDto para incluir propiedades comunes a todos los DTOs.
    /// </summary>
    public class JugadorDto : BaseDto
    {
        public int IdPartida { get; set; } // ID de la partida a la que pertenece el jugador
        public string Nombre { get; set; } = null!; // Nombre del jugador
        public string Avatar { get; set; } = null!; // Avatar del jugador
        public int PosicionTurno { get; set; } // Posición del jugador en el turno
        public int PuntosAcumulados { get; set; } // Puntos acumulados por el jugador

    }
}

 