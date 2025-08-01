using AutoMapper;
using Entity.Model;
using Entity.Dto;

namespace Utilities.Mappers.Profiles
{
    public class JugadaProfile : Profile
    {
        public JugadaProfile()
        {
            // Jugada
            CreateMap<Jugada, JugadaDto>().ReverseMap();
        }
    }
}
