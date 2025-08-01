using Entity.Dto.Base;
using Entity.Model.Base;

namespace Business.Interfaces
{
    public interface IBaseBusiness<T, D> where T : BaseModel where D : BaseDto
       
    {
        /// <summary>
        /// Obtiene todas las entidades desde la base de datos.
        /// </summary>
        /// 
        Task<List<D>> GetAllAsync();

        /// <summary>
        /// Obtiene todos los datos en forma de DTO.
        /// </summary>
        Task<D> GetByIdAsync(int id);

        /// <summary>
        /// Obtiene un DTO específico por su ID.
        /// </summary>
        Task<D> CreateAsync(D dto);

        /// <summary>
        /// Actualiza un registro existente a partir de un DTO.
        /// </summary>
        Task<D> UpdateAsync(D dto);

        ///<summary>
        /// Elimina permanentemente un registro del sistema.
        ///</summary>
        Task<bool> DeleteAsync(int id);



        /// <summary>
        /// Elimina lógicamente un registro del sistema (cambio de estado a inactivo)
        /// </summary>
        Task<bool> SoftDeleteAsync(int id);
    }
}