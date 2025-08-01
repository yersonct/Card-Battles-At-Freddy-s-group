using AutoMapper;
using Entity.Model;
using Entity.Dto;

namespace Utilities.Mappers.Profiles
{
    public class CartaJugadorProfile : Profile
    {
        public CartaJugadorProfile()
        {
            // Jugador
            CreateMap<CartaJugador, CartaJugadorDto>().ReverseMap();
        }
    }
}