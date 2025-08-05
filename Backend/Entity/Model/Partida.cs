using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Entity.Model.Base;

namespace Entity.Model
{
    public class Partida : BaseModel
    {
        [MaxLength(10)]
        public string Codigo { get; set; } = GenerarCodigo(); // Código único de 6 caracteres para identificar la partida

        public DateTime FechaInicio { get; set; } = DateTime.Now;
        public DateTime? FechaFin { get; set; }
        
        [MaxLength(50)]
        public string Estado { get; set; } = "Esperando"; // Esperando, EnJuego, Finalizada
        
        public int RondaActual { get; set; } = 0;
        public int TurnoActual { get; set; } = 1; // Posición del jugador que tiene el turno
        public int? JugadorQueElige { get; set; } // ID del jugador que elige el atributo
        
        [MaxLength(100)]
        public string? AtributoElegido { get; set; } // Atributo elegido para la ronda actual
        
        public int NumeroJugadores { get; set; } = 0;
        public int MaximoRondas { get; set; } = 8; // Cada jugador tiene 8 cartas

        // Navegación
        public ICollection<Jugador> Jugadores { get; set; } = new List<Jugador>();
        public ICollection<Ronda> Rondas { get; set; } = new List<Ronda>();

        // Método estático para generar código único
        private static string GenerarCodigo()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var codigo = new char[6];
            
            for (int i = 0; i < 6; i++)
            {
                codigo[i] = chars[random.Next(chars.Length)];
            }
            
            return new string(codigo);
        }
    }
}