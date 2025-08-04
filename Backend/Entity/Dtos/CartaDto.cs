using System;
using System.Collections.Generic;
using Entity.Dto.Base;
namespace Entity.Dto
{
    /// <summary>
    /// Clase base para los DTOs que contiene los de su entidad.
    /// Esta clase hereda de BaseDto para incluir propiedades comunes a todos los DTOs.
    /// </summary>
    public class CartaDto : BaseDto
    {
        public byte[] Imagen { get; set; } = null!; // Imagen de la carta
        public string Nombre { get; set; } = string.Empty; // Nombre de la carta
        public string Rareza { get; set; } = string.Empty; // Rareza de la carta (ejemplo: "Común", "Rara", "Épica", "Legendaria")
        public string Categoria { get; set; } = string.Empty; // Categoría de la carta (ejemplo: "1A", "1B", etc.)
        public int Vida { get; set; } // Vida de la carta

        public int Poder { get; set; } // Poder de la carta
        public int Defensa { get; set; } // Defensa de la carta
        public int Velocidad { get; set; } // Velocidad de la carta
        public int Ataque { get; set; } // Ataque de la carta
        public int Terror { get; set; } // Terror de la carta
    }
}
