using Business.Interfaces;
using Data.Interfaces;
using Entity.Context;
using Entity.Dto;
using Entity.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Business.Implements
{
    public class PartidaBusiness : IPartidaBusiness
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PartidaBusiness> _logger;

        public PartidaBusiness(ApplicationDbContext context, ILogger<PartidaBusiness> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<CrearPartidaResponseDto> CrearPartidaAsync(CrearPartidaDto crearPartidaDto)
        {
            try
            {
                // Validar número de jugadores
                if (crearPartidaDto.Jugadores.Count < 2 || crearPartidaDto.Jugadores.Count > 7)
                {
                    throw new ArgumentException("El número de jugadores debe ser entre 2 y 7");
                }

                // Generar código único para la partida
                string codigoUnico;
                do
                {
                    codigoUnico = GenerarCodigoUnico();
                } while (await _context.Partidas.AnyAsync(p => p.Codigo == codigoUnico));

                // Crear la partida
                var partida = new Partida
                {
                    Codigo = codigoUnico,
                    FechaInicio = DateTime.Now,
                    Estado = "Esperando",
                    NumeroJugadores = crearPartidaDto.Jugadores.Count,
                    TurnoActual = 1
                };

                _context.Partidas.Add(partida);
                await _context.SaveChangesAsync();

                // Crear los jugadores
                var jugadores = new List<Jugador>();
                for (int i = 0; i < crearPartidaDto.Jugadores.Count; i++)
                {
                    var jugadorDto = crearPartidaDto.Jugadores[i];
                    var jugador = new Jugador
                    {
                        IdPartida = partida.Id,
                        Nombre = jugadorDto.Nombre,
                        Avatar = jugadorDto.Avatar,
                        PosicionTurno = i + 1,
                        PuntosAcumulados = 0
                    };
                    jugadores.Add(jugador);
                }

                _context.Jugadores.AddRange(jugadores);
                await _context.SaveChangesAsync();

                // Asignar mazos a cada jugador
                await AsignarMazosAsync(jugadores);

                // Cambiar estado de la partida a "EnJuego"
                partida.Estado = "EnJuego";
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Partida {partida.Id} (Código: {partida.Codigo}) creada con {jugadores.Count} jugadores");
                
                return new CrearPartidaResponseDto
                {
                    PartidaId = partida.Id,
                    Codigo = partida.Codigo,
                    Mensaje = "Partida creada exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear partida");
                throw;
            }
        }

        private string GenerarCodigoUnico()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var codigo = new char[6];
            
            for (int i = 0; i < 6; i++)
            {
                codigo[i] = chars[random.Next(chars.Length)];
            }
            
            return new string(codigo);
        }

        private async Task AsignarMazosAsync(List<Jugador> jugadores)
        {
            // Obtener todas las cartas disponibles
            var todasLasCartas = await _context.Cartas
                .Where(c => c.Active)
                .ToListAsync();

            if (todasLasCartas.Count < 8)
            {
                throw new InvalidOperationException("No hay suficientes cartas para crear mazos");
            }

            var random = new Random();

            foreach (var jugador in jugadores)
            {
                // Seleccionar 8 cartas aleatorias para el jugador
                var cartasDelJugador = todasLasCartas
                    .OrderBy(x => random.Next())
                    .Take(8)
                    .ToList();

                for (int i = 0; i < cartasDelJugador.Count; i++)
                {
                    var cartaJugador = new CartaJugador
                    {
                        IdJugador = jugador.Id,
                        IdCarta = cartasDelJugador[i].Id,
                        PosicionEnMazo = i + 1,
                        Usada = false
                    };
                    _context.CartaJugadores.Add(cartaJugador);
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<PartidaEstadoDto> ObtenerEstadoPartidaAsync(int partidaId)
        {
            var partida = await _context.Partidas
                .Include(p => p.Jugadores)
                .Include(p => p.Rondas)
                .FirstOrDefaultAsync(p => p.Id == partidaId && p.Active);

            if (partida == null)
            {
                throw new ArgumentException("Partida no encontrada");
            }

            var rondaActual = await _context.Rondas
                .Include(r => r.Jugadas)
                .FirstOrDefaultAsync(r => r.IdPartida == partidaId && r.NumeroRonda == partida.RondaActual);

            return new PartidaEstadoDto
            {
                Id = partida.Id,
                Estado = partida.Estado,
                RondaActual = partida.RondaActual,
                TurnoActual = partida.TurnoActual,
                AtributoElegido = partida.AtributoElegido,
                Jugadores = partida.Jugadores.Select(j => new JugadorDto
                {
                    Id = j.Id,
                    Nombre = j.Nombre,
                    Avatar = j.Avatar,
                    PosicionTurno = j.PosicionTurno,
                    PuntosAcumulados = j.PuntosAcumulados
                }).ToList(),
                RondaEnCurso = rondaActual != null ? new RondaDto
                {
                    Id = rondaActual.Id,
                    NumeroRonda = rondaActual.NumeroRonda,
                    AtributoCompetido = rondaActual.AtributoCompetido,
                    Estado = rondaActual.Estado
                } : null
            };
        }

        public async Task<PartidaDto?> ObtenerPartidaPorCodigoAsync(string codigo)
        {
            try
            {
                var partida = await _context.Partidas
                    .Include(p => p.Jugadores)
                    .FirstOrDefaultAsync(p => p.Codigo == codigo && p.Active);

                if (partida == null)
                {
                    return null;
                }

                return new PartidaDto
                {
                    Id = partida.Id,
                    Codigo = partida.Codigo,
                    FechaInicio = partida.FechaInicio,
                    FechaFin = partida.FechaFin,
                    Estado = partida.Estado,
                    RondaActual = partida.RondaActual,
                    TurnoActual = partida.TurnoActual,
                    JugadorQueElige = partida.JugadorQueElige,
                    AtributoElegido = partida.AtributoElegido,
                    NumeroJugadores = partida.NumeroJugadores,
                    MaximoRondas = partida.MaximoRondas
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al buscar partida por código: {Codigo}", codigo);
                throw;
            }
        }

        public async Task<bool> ElegirAtributoAsync(ElegirAtributoDto elegirAtributoDto)
        {
            var partida = await _context.Partidas
                .Include(p => p.Jugadores)
                .FirstOrDefaultAsync(p => p.Id == elegirAtributoDto.PartidaId && p.Active);

            if (partida == null || partida.Estado != "EnJuego")
            {
                return false;
            }

            // Verificar que es el turno del jugador
            var jugadorActual = partida.Jugadores
                .FirstOrDefault(j => j.PosicionTurno == partida.TurnoActual && j.Id == elegirAtributoDto.JugadorId);

            if (jugadorActual == null)
            {
                return false;
            }

            // Crear nueva ronda
            partida.RondaActual++;
            var nuevaRonda = new Ronda
            {
                IdPartida = partida.Id,
                NumeroRonda = partida.RondaActual,
                AtributoCompetido = elegirAtributoDto.Atributo,
                IdJugadorQueElige = elegirAtributoDto.JugadorId,
                Estado = "EnProgreso",
                FechaInicio = DateTime.Now
            };

            partida.AtributoElegido = elegirAtributoDto.Atributo;
            partida.JugadorQueElige = elegirAtributoDto.JugadorId;

            _context.Rondas.Add(nuevaRonda);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> JugarCartaAsync(JugarCartaDto jugarCartaDto)
        {
            var partida = await _context.Partidas
                .Include(p => p.Jugadores)
                .FirstOrDefaultAsync(p => p.Id == jugarCartaDto.PartidaId && p.Active);

            if (partida == null || partida.Estado != "EnJuego")
            {
                return false;
            }

            var rondaActual = await _context.Rondas
                .FirstOrDefaultAsync(r => r.IdPartida == jugarCartaDto.PartidaId && r.NumeroRonda == partida.RondaActual);

            if (rondaActual == null || rondaActual.Estado != "EnProgreso")
            {
                return false;
            }

            // Verificar que la carta pertenece al jugador y no ha sido usada
            var cartaJugador = await _context.CartaJugadores
                .Include(cj => cj.Carta)
                .FirstOrDefaultAsync(cj => cj.Id == jugarCartaDto.CartaJugadorId && 
                                          cj.IdJugador == jugarCartaDto.JugadorId && 
                                          !cj.Usada);

            if (cartaJugador == null)
            {
                return false;
            }

            // Verificar que el jugador no ha jugado ya en esta ronda
            var yaJugo = await _context.Jugadas
                .AnyAsync(j => j.IdRonda == rondaActual.Id && j.IdJugador == jugarCartaDto.JugadorId);

            if (yaJugo)
            {
                return false;
            }

            // Obtener el valor del atributo de la carta
            var valorAtributo = ObtenerValorAtributo(cartaJugador.Carta, rondaActual.AtributoCompetido);

            // Crear la jugada
            var jugada = new Jugada
            {
                IdRonda = rondaActual.Id,
                IdJugador = jugarCartaDto.JugadorId,
                IdCartaJugador = jugarCartaDto.CartaJugadorId,
                ValorAtributo = valorAtributo,
                FechaJugada = DateTime.Now
            };

            // Marcar la carta como usada
            cartaJugador.Usada = true;
            cartaJugador.RondaUsada = rondaActual.NumeroRonda;

            _context.Jugadas.Add(jugada);
            await _context.SaveChangesAsync();

            return true;
        }

        private int ObtenerValorAtributo(Carta carta, string atributo)
        {
            return atributo switch
            {
                "Vida" => carta.Vida,
                "Ataque" => carta.Ataque,
                "Defensa" => carta.Defensa,
                "Velocidad" => carta.Velocidad,
                "Poder" => carta.Poder,
                "Terror" => carta.Terror,
                _ => 0
            };
        }

        public async Task<ResultadoRondaDto?> VerificarFinRondaAsync(int partidaId)
        {
            var partida = await _context.Partidas
                .Include(p => p.Jugadores)
                .FirstOrDefaultAsync(p => p.Id == partidaId && p.Active);

            if (partida == null)
            {
                return null;
            }

            var rondaActual = await _context.Rondas
                .Include(r => r.Jugadas)
                    .ThenInclude(j => j.Jugador)
                .Include(r => r.Jugadas)
                    .ThenInclude(j => j.CartaJugador)
                        .ThenInclude(cj => cj.Carta)
                .FirstOrDefaultAsync(r => r.IdPartida == partidaId && r.NumeroRonda == partida.RondaActual);

            if (rondaActual == null)
            {
                return null;
            }

            // Verificar si todos los jugadores han jugado
            var jugadasEnRonda = rondaActual.Jugadas.Count;
            var numeroJugadores = partida.NumeroJugadores;

            if (jugadasEnRonda < numeroJugadores)
            {
                return null; // La ronda aún no ha terminado
            }

            // Determinar el ganador
            var jugadaGanadora = rondaActual.Jugadas
                .OrderByDescending(j => j.ValorAtributo)
                .First();

            // Actualizar la ronda
            rondaActual.IdGanador = jugadaGanadora.IdJugador;
            rondaActual.Estado = "Finalizada";
            rondaActual.FechaFin = DateTime.Now;

            // Actualizar puntos del jugador ganador
            var jugadorGanador = await _context.Jugadores
                .FirstAsync(j => j.Id == jugadaGanadora.IdJugador);
            
            jugadorGanador.PuntosAcumulados++;

            await _context.SaveChangesAsync();

            // Crear resultado
            var resultado = new ResultadoRondaDto
            {
                RondaId = rondaActual.Id,
                NumeroRonda = rondaActual.NumeroRonda,
                AtributoCompetido = rondaActual.AtributoCompetido,
                GanadorId = jugadorGanador.Id,
                NombreGanador = jugadorGanador.Nombre,
                Jugadas = rondaActual.Jugadas.Select(j => new JugadaResultadoDto
                {
                    JugadorId = j.IdJugador,
                    NombreJugador = j.Jugador.Nombre,
                    NombreCarta = j.CartaJugador.Carta.Nombre,
                    ValorAtributo = j.ValorAtributo
                }).ToList()
            };

            return resultado;
        }

        public async Task<bool> AvanzarSiguienteRondaAsync(int partidaId)
        {
            var partida = await _context.Partidas
                .Include(p => p.Jugadores)
                .FirstOrDefaultAsync(p => p.Id == partidaId && p.Active);

            if (partida == null)
            {
                return false;
            }

            // Verificar si la partida ha terminado (todas las cartas usadas)
            if (partida.RondaActual >= partida.MaximoRondas)
            {
                await FinalizarPartidaAsync(partidaId);
                return true;
            }

            // Pasar el turno al siguiente jugador
            partida.TurnoActual = (partida.TurnoActual % partida.NumeroJugadores) + 1;
            partida.AtributoElegido = null;
            partida.JugadorQueElige = null;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<RankingPartidaDto>> ObtenerRankingFinalAsync(int partidaId)
        {
            var jugadores = await _context.Jugadores
                .Where(j => j.IdPartida == partidaId)
                .OrderByDescending(j => j.PuntosAcumulados)
                .ToListAsync();

            var ranking = new List<RankingPartidaDto>();
            for (int i = 0; i < jugadores.Count; i++)
            {
                ranking.Add(new RankingPartidaDto
                {
                    Posicion = i + 1,
                    NombreJugador = jugadores[i].Nombre,
                    PuntosObtenidos = jugadores[i].PuntosAcumulados
                });
            }

            // Guardar el ranking en la tabla de historia
            var partida = await _context.Partidas.FirstAsync(p => p.Id == partidaId);
            foreach (var item in ranking)
            {
                var jugador = jugadores.First(j => j.Nombre == item.NombreJugador);
                var rankingPartida = new RankingPartida
                {
                    IdPartida = partidaId,
                    IdJugador = jugador.Id,
                    NombreJugador = jugador.Nombre,
                    PuntosObtenidos = jugador.PuntosAcumulados,
                    Posicion = item.Posicion,
                    FechaPartida = partida.FechaInicio
                };
                _context.RankingPartidas.Add(rankingPartida);
            }

            await _context.SaveChangesAsync();
            return ranking;
        }

        public async Task<bool> FinalizarPartidaAsync(int partidaId)
        {
            var partida = await _context.Partidas
                .FirstOrDefaultAsync(p => p.Id == partidaId && p.Active);

            if (partida == null)
            {
                return false;
            }

            // Actualizar estado de la partida
            partida.Estado = "Finalizada";
            partida.FechaFin = DateTime.Now;

            await _context.SaveChangesAsync();

            // Opcional: Limpiar datos después de un tiempo o mantenerlos por un período
            // await LimpiarDatosPartidaAsync(partidaId);

            return true;
        }

        private async Task LimpiarDatosPartidaAsync(int partidaId)
        {
            // Eliminar en orden para respetar las foreign keys
            var jugadas = await _context.Jugadas
                .Include(j => j.Ronda)
                .Where(j => j.Ronda.IdPartida == partidaId)
                .ToListAsync();
            _context.Jugadas.RemoveRange(jugadas);

            var cartasJugador = await _context.CartaJugadores
                .Include(cj => cj.Jugador)
                .Where(cj => cj.Jugador.IdPartida == partidaId)
                .ToListAsync();
            _context.CartaJugadores.RemoveRange(cartasJugador);

            var rondas = await _context.Rondas
                .Where(r => r.IdPartida == partidaId)
                .ToListAsync();
            _context.Rondas.RemoveRange(rondas);

            var jugadores = await _context.Jugadores
                .Where(j => j.IdPartida == partidaId)
                .ToListAsync();
            _context.Jugadores.RemoveRange(jugadores);

            var partida = await _context.Partidas
                .FirstAsync(p => p.Id == partidaId);
            _context.Partidas.Remove(partida);

            await _context.SaveChangesAsync();
        }

        public async Task<List<CartaJugadorDto>> ObtenerCartasDisponiblesAsync(int partidaId, int jugadorId)
        {
            var cartas = await _context.CartaJugadores
                .Include(cj => cj.Carta)
                .Where(cj => cj.Jugador.IdPartida == partidaId && 
                            cj.IdJugador == jugadorId && 
                            !cj.Usada)
                .Select(cj => new CartaJugadorDto
                {
                    Id = cj.Id,
                    IdCarta = cj.IdCarta,
                    PosicionEnMazo = cj.PosicionEnMazo,
                    Usada = cj.Usada
                })
                .ToListAsync();

            return cartas;
        }

        public async Task<bool> EsTurnoJugadorAsync(int partidaId, int jugadorId)
        {
            var partida = await _context.Partidas
                .Include(p => p.Jugadores)
                .FirstOrDefaultAsync(p => p.Id == partidaId && p.Active);

            if (partida == null)
            {
                return false;
            }

            var jugador = partida.Jugadores
                .FirstOrDefault(j => j.Id == jugadorId);

            return jugador?.PosicionTurno == partida.TurnoActual;
        }
    }
}
