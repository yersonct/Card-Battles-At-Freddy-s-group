using Entity.Model.Base;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Dapper.SqlMapper;

namespace Data.Interfaces

{
    /// <summary>
    /// Interfaz que me define los métodos generales
    /// </summary>
    /// <typeparam name="T"></typeparam>

    public interface IBaseModelData<T> where T : BaseModel
    {
        /// <summary>
        /// Método para obtener una entidad por su ID
        /// </summary>
        Task<T> GetByIdAsync(int id);

        /// <summary>
        /// Método para obtener todos las entidades
        /// </summary>
        Task<List<T>> GetAllAsync();

        /// <summary>
        /// Crea una entidad
        /// </summary>
        Task<T> CreateAsync(T entity);

        /// <summary>
        /// Actualiza todos los valores de una entidad
        /// </summary>
        Task<T> UpdateAsync(T entity);


        /// <summary>
        /// Eliminación concreta o absoluta
        /// </summary>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Eliminación lógica (cambio de estado a inactivo)
        /// </summary>
        Task<bool> SoftDeleteAsync(int id);

        /// <summary>
        /// Actualiza parcialmente una entidad
        /// </summary>
        Task<T> MergePatchAsync(int id, T partialEntity);

    }
}
