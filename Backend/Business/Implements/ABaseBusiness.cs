using Business.Interfaces;
using Entity.Dtos.Base;
using Entity.Model.Base;

namespace Business.Implements
{

    public abstract class ABaseBusiness<T, D> : IBaseBusiness<T, D> where T : BaseModel where D : BaseDto
    {

        public abstract Task<List<D>> GetAllAsync();
        public abstract Task<D> GetByIdAsync(int id);
        public abstract Task<D> CreateAsync(D dto);
        public abstract Task<D> UpdateAsync(D dto);
        public abstract Task<bool> DeleteAsync(int id);
        public abstract Task<bool> SoftDeleteAsync(int id);
    }
}