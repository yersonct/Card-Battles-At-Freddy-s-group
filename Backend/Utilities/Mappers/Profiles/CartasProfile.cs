using AutoMapper;
using Entity.Model;
using Entity.Dto;

namespace Utilities.Mappers.Profiles
{
    public class CartasProfile : Profile
    {
        public CartasProfile()
        {
            // Carta
            CreateMap<Carta, CartaDto>().ReverseMap();
        }
    }
}
