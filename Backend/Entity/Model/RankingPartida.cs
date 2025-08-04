using System;
using System.ComponentModel.DataAnnotations;

namespace Entity.Model
{
    public class RankingPartida
    {
        public int Id { get; set; }
        public int IdPartida { get; set; }
        public int IdJugador { get; set; }
        
        [MaxLength(100)]
        public string NombreJugador { get; set; } = null!;
        
        public int PuntosObtenidos { get; set; }
        public int Posicion { get; set; }
        public DateTime FechaPartida { get; set; }
    }
}
