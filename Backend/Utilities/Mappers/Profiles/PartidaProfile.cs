using AutoMapper;
using Entity.Model;
using Entity.Dto;

namespace Utilities.Mappers.Profiles
{
    public class PartidaProfile : Profile
    {
        public PartidaProfile()
        {
            // Partida
            CreateMap<Partida, PartidaDto>().ReverseMap();
        }
    }
}
