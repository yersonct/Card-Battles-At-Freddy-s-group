using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Entity.Context;
using Entity.Model.Base;
using Microsoft.EntityFrameworkCore;

namespace Entity.Model
{
    public class Carta : BaseModel
    {
        public byte[] Imagen { get; set; } = null!; // Imagen de la carta
        public string Nombre { get; set; } // Nombre de la carta
        public string Categoria { get; set; } // Categoría de la carta (ejemplo: "1A", "1B", etc.)
        public int Vida { get; set; } // Vida de la carta
        public int Defensa { get; set; } // Defensa de la carta
        public int Velocidad { get; set; } // Velocidad de la carta
        public int Ataque { get; set; } // Ataque de la carta
        public int Poder { get; set; } // Poder de la carta
        public int Terror { get; set; } // Terror de la carta

        public ICollection<CartaJugador> CartaJugador { get; set; } // Relación con CartaJugador
    }
}