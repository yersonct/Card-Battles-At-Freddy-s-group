using System;
using System.Reflection;
using AutoMapper;
using Data.Interfaces;
using Entity.Dto.Base;
using Entity.Model.Base;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.JsonPatch;

namespace Business.Implements
{
    /// <summary>
    /// Clase base que implementa la lógica de negocio común para operaciones CRUD genéricas.
    /// Proporciona implementaciones estándar para crear, leer, actualizar y eliminar entidades,
    /// incluyendo validación, mapeo automático entre DTOs y entidades, y logging.
    /// </summary>
    /// <typeparam name="T">Tipo de la entidad de dominio que representa el modelo de datos</typeparam>
    /// <typeparam name="D">Tipo del objeto de transferencia de datos (DTO) utilizado para comunicación con capas superiores</typeparam>
    public class BaseBusiness<T, D> : ABaseBusiness<T, D>
        where T : BaseModel
        where D : BaseDto
    {
        /// <summary>
        /// Instancia de AutoMapper para realizar el mapeo entre DTOs y entidades.
        /// </summary>
        protected readonly IMapper _mapper;
        protected readonly IBaseModelData<T> _data;
        protected readonly ILogger<BaseBusiness<T, D>> _logger;


        /// <summary>
        /// Inicializa una nueva instancia de la clase BaseBusiness.
        /// </summary>
        /// <param name="data">Repositorio de datos para operaciones de persistencia</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo entre DTOs y entidades</param>
        /// <param name="logger">Logger para registrar eventos y errores durante las operaciones</param>
        public BaseBusiness(IBaseModelData<T> data, IMapper mapper, ILogger<BaseBusiness<T, D>> logger) : base()
        {
            _data = data ?? throw new ArgumentNullException(nameof(data));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Valida un DTO utilizando FluentValidation.
        /// </summary>
        /// <param name="dto">DTO a validar</param>
        /// <returns>Tarea que representa la validación asíncrona</returns>
        /// <exception cref="ArgumentException">Si la validación falla</exception>


        /// <inheritdoc />
        public override async Task<List<D>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation($"Obteniendo todos los registros de {typeof(T).Name}");
                var entities = await _data.GetAllAsync();
                return _mapper.Map<IList<D>>(entities).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener registros de {typeof(T).Name}");
                throw;
            }
        }

        /// <inheritdoc />
        public override async Task<D> GetByIdAsync(int id)
        {
            try
            {
                _logger.LogInformation($"Obteniendo registro de {typeof(T).Name} con ID {id}");
                var entity = await _data.GetByIdAsync(id);
                return _mapper.Map<D>(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener registro de {typeof(T).Name} con ID {id}");
                throw;
            }
        }

        /// <inheritdoc />
        public override async Task<D> CreateAsync(D dto)
        {
            try
            {
                _logger.LogInformation($"Creando nuevo registro de {typeof(T).Name}");
                var entity = _mapper.Map<T>(dto);
                var createdEntity = await _data.CreateAsync(entity);
                return _mapper.Map<D>(createdEntity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al crear registro de {typeof(T).Name}");
                throw;
            }
        }

        /// <inheritdoc />
        public override async Task<D> UpdateAsync(D dto)
        {
            try
            {
                _logger.LogInformation($"Actualizando registro de {typeof(T).Name}");
                var entity = _mapper.Map<T>(dto);
                var updatedEntity = await _data.UpdateAsync(entity);
                return _mapper.Map<D>(updatedEntity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar registro de {typeof(T).Name}");
                throw;
            }
        }

        /// <inheritdoc />
        public override async Task<bool> DeleteAsync(int id)
        {
            try
            {
                _logger.LogInformation($"Eliminando registro de {typeof(T).Name} con ID {id}");
                return await _data.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar registro de {typeof(T).Name} con ID {id}");
                throw;
            }
        }


        public override async Task<bool> SoftDeleteAsync(int id)
        {
            try
            {
                _logger.LogInformation($"Eliminando registro de {typeof(T).Name} con ID {id}");
                return await _data.SoftDeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar registro de {typeof(T).Name} con ID {id}");
                throw;
            }
        }

       public override async Task<D> MergePatchAsync(int id, D partialDto)
        {
            try
            {
                _logger.LogInformation($"Aplicando merge patch al registro con ID {id} de {typeof(T).Name}");

                // 1. Obtener la entidad existente de la base de datos
                var existingEntity = await _data.GetByIdAsync(id);
                if (existingEntity == null)
                    throw new KeyNotFoundException($"Registro con ID {id} no encontrado");

                // 2. Convertir la entidad existente a DTO
                var existingDto = _mapper.Map<D>(existingEntity);

                // 3. Obtener todas las propiedades del DTO (excluyendo Id y Active)
                var properties = typeof(D).GetProperties()
                    .Where(p => p.CanWrite && p.Name != "Id" && p.Name != "Active");

                // 4. Actualizar solo las propiedades que NO son valores por defecto
                foreach (var property in properties)
                {
                    var newValue = property.GetValue(partialDto);
                    var currentValue = property.GetValue(existingDto);
                    
                    // Solo actualizar si el valor no es el valor por defecto del tipo
                    if (newValue != null && !IsDefaultValue(newValue, property.PropertyType))
                    {
                        // Solo cambiar si realmente es diferente
                        if (!Equals(currentValue, newValue))
                        {
                            property.SetValue(existingDto, newValue);
                            _logger.LogInformation($"Actualizando campo {property.Name} de '{currentValue}' a '{newValue}'");
                        }
                    }
                    else if (newValue != null && property.PropertyType == typeof(string))
                    {
                        // Para strings, permitir strings vacíos si no son null
                        if (!string.IsNullOrEmpty(newValue.ToString()) && !Equals(currentValue, newValue))
                        {
                            property.SetValue(existingDto, newValue);
                            _logger.LogInformation($"Actualizando campo string {property.Name} de '{currentValue}' a '{newValue}'");
                        }
                    }
                }

                // 5. Convertir de vuelta a entidad y guardar
                var entityToUpdate = _mapper.Map<T>(existingDto);
                var updatedEntity = await _data.MergePatchAsync(id, entityToUpdate);

                return _mapper.Map<D>(updatedEntity);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al aplicar merge patch: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Verifica si un valor es el valor por defecto de su tipo
        /// </summary>
        private bool IsDefaultValue(object value, Type type)
        {
            if (value == null) return true;
            
            if (type.IsValueType)
            {
                var defaultValue = Activator.CreateInstance(type);
                return value.Equals(defaultValue);
            }
            
            if (type == typeof(string))
            {
                return string.IsNullOrEmpty(value.ToString());
            }
            
            return false;
        }
    }
}
