using AutoMapper;
using Entity.Model;
using Entity.Dto;

namespace Utilities.Mappers.Profiles
{
    public class RondaProfile : Profile
    {
        public RondaProfile()
        {
            // Ronda
            CreateMap<Ronda, RondaDto>().ReverseMap();
        }
    }
}
