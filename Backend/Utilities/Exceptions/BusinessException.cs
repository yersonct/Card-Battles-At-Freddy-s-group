using System;

namespace Utilities.Exceptions
{

    /// <summary>
    /// Excepción base para todos los errores relacionados con la lógica de negocio.
    /// </summary>
    public class BusinessException : Exception
    {
        /// <summary>
        /// Inicializa una nueva instancia de <see cref="BusinessException"/> con un mensaje de error.
        /// </summary>
        /// <param name="message">El mensaje que describe el error.</param>
        /// </summary>
        /// <param name="message">El mensaje que describe el error.</param>
        public BusinessException(string message) : base(message)
        {
        }

        /// <summary>
        /// Inicializa una nueva instancia de <see cref="BusinessException"/> con un mensaje de error y una excepción interna.
        /// </summary>
        /// <param name="message">El mensaje que describe el error.</param>
        /// <param name="innerException">La excepción que es la causa del error actual.</param>
        public BusinessException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
