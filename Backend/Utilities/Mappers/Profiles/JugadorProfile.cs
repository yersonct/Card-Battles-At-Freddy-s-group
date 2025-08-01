using AutoMapper;
using Entity.Model;
using Entity.Dto;

namespace Utilities.Mappers.Profiles
{
    public class JugadorProfile : Profile
    {
        public JugadorProfile()
        {
            // Jugador
            CreateMap<Jugador, JugadorDto>().ReverseMap();
        }
    }
}
