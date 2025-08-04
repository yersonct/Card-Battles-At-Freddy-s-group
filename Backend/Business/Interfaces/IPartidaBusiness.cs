using Entity.Dto;
using Entity.Model;

namespace Business.Interfaces
{
    public interface IPartidaBusiness
    {
        /// <summary>
        /// Crea una nueva partida con los jugadores especificados y les asigna sus mazos
        /// </summary>
        Task<int> CrearPartidaAsync(CrearPartidaDto crearPartidaDto);

        /// <summary>
        /// Obtiene el estado actual de una partida
        /// </summary>
        Task<PartidaEstadoDto> ObtenerEstadoPartidaAsync(int partidaId);

        /// <summary>
        /// El jugador que tiene el turno elige el atributo para competir
        /// </summary>
        Task<bool> ElegirAtributoAsync(ElegirAtributoDto elegirAtributoDto);

        /// <summary>
        /// Un jugador juega una carta en la ronda actual
        /// </summary>
        Task<bool> JugarCartaAsync(JugarCartaDto jugarCartaDto);

        /// <summary>
        /// Verifica si la ronda actual ha terminado y determina el ganador
        /// </summary>
        Task<ResultadoRondaDto?> VerificarFinRondaAsync(int partidaId);

        /// <summary>
        /// Avanza a la siguiente ronda o termina la partida
        /// </summary>
        Task<bool> AvanzarSiguienteRondaAsync(int partidaId);

        /// <summary>
        /// Obtiene el ranking final cuando la partida termina
        /// </summary>
        Task<List<RankingPartidaDto>> ObtenerRankingFinalAsync(int partidaId);

        /// <summary>
        /// Finaliza la partida y limpia los datos temporales
        /// </summary>
        Task<bool> FinalizarPartidaAsync(int partidaId);

        /// <summary>
        /// Obtiene las cartas disponibles de un jugador en la partida actual
        /// </summary>
        Task<List<CartaJugadorDto>> ObtenerCartasDisponiblesAsync(int partidaId, int jugadorId);

        /// <summary>
        /// Verifica si es el turno de un jugador específico
        /// </summary>
        Task<bool> EsTurnoJugadorAsync(int partidaId, int jugadorId);
    }
}
