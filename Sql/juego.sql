-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.8.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para fnaf
CREATE DATABASE IF NOT EXISTS `fnaf` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `fnaf`;

-- Volcando estructura para tabla fnaf.cartajugadores
CREATE TABLE IF NOT EXISTS `cartajugadores` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdJugador` int(11) NOT NULL,
  `IdCarta` int(11) NOT NULL,
  `PosicionEnMazo` int(11) NOT NULL, -- Posición de la carta en el mazo (1-8)
  `Usada` tinyint(1) NOT NULL DEFAULT 0,
  `RondaUsada` int(11) NULL, -- En qué ronda fue usada
  `Active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`Id`),
  KEY `IX_CartaJugadores_IdCarta` (`IdCarta`),
  KEY `IX_CartaJugadores_IdJugador` (`IdJugador`),
  UNIQUE KEY `UQ_CartaJugador_Posicion` (`IdJugador`, `PosicionEnMazo`),
  CONSTRAINT `FK_CartaJugadores_Cartas_IdCarta` FOREIGN KEY (`IdCarta`) REFERENCES `cartas` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_CartaJugadores_Jugadores_IdJugador` FOREIGN KEY (`IdJugador`) REFERENCES `jugadores` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla fnaf.cartas
CREATE TABLE IF NOT EXISTS `cartas` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Imagen` longblob NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Rareza` longtext NOT NULL,
  `Categoria` varchar(100) NOT NULL,
  `Vida` int(11) NOT NULL,
  `Defensa` int(11) NOT NULL,
  `Velocidad` int(11) NOT NULL,
  `Ataque` int(11) NOT NULL,
  `Poder` int(11) NOT NULL,
  `Terror` int(11) NOT NULL,
  `Active` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Cartas_Categoria` (`Categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla fnaf.jugadas
CREATE TABLE IF NOT EXISTS `jugadas` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdRonda` int(11) NOT NULL,
  `IdJugador` int(11) NOT NULL,
  `IdCartaJugador` int(11) NOT NULL,
  `ValorAtributo` int(11) NOT NULL, -- El valor del atributo de la carta jugada
  `FechaJugada` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `Active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`Id`),
  KEY `IX_Jugadas_IdCartaJugador` (`IdCartaJugador`),
  KEY `IX_Jugadas_IdJugador` (`IdJugador`),
  KEY `IX_Jugadas_IdRonda` (`IdRonda`),
  UNIQUE KEY `UQ_Jugada_Ronda_Jugador` (`IdRonda`, `IdJugador`),
  CONSTRAINT `FK_Jugadas_CartaJugadores_IdCartaJugador` FOREIGN KEY (`IdCartaJugador`) REFERENCES `cartajugadores` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Jugadas_Jugadores_IdJugador` FOREIGN KEY (`IdJugador`) REFERENCES `jugadores` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Jugadas_Rondas_IdRonda` FOREIGN KEY (`IdRonda`) REFERENCES `rondas` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla fnaf.jugadores
CREATE TABLE IF NOT EXISTS `jugadores` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdPartida` int(11) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Avatar` varchar(100) NOT NULL,
  `PosicionTurno` int(11) NOT NULL,
  `PuntosAcumulados` int(11) NOT NULL,
  `PartidaId` int(11) NOT NULL,
  `Active` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Jugadores_PartidaId` (`PartidaId`),
  CONSTRAINT `FK_Jugadores_Partidas_PartidaId` FOREIGN KEY (`PartidaId`) REFERENCES `partidas` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla fnaf.partidas
CREATE TABLE IF NOT EXISTS `partidas` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `FechaInicio` datetime(6) NOT NULL,
  `FechaFin` datetime(6) NULL,
  `Estado` varchar(50) NOT NULL DEFAULT 'Esperando', -- 'Esperando', 'EnJuego', 'Finalizada'
  `RondaActual` int(11) NOT NULL DEFAULT 0,
  `TurnoActual` int(11) NOT NULL DEFAULT 1, -- Posición del jugador que tiene el turno
  `JugadorQueElige` int(11) NULL, -- ID del jugador que elige el atributo
  `AtributoElegido` varchar(100) NULL, -- Atributo elegido para la ronda actual
  `NumeroJugadores` int(11) NOT NULL DEFAULT 0,
  `MaximoRondas` int(11) NOT NULL DEFAULT 8, -- Cada jugador tiene 8 cartas
  `Active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`Id`),
  INDEX `IX_Partidas_JugadorQueElige` (`JugadorQueElige`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla fnaf.rondas
CREATE TABLE IF NOT EXISTS `rondas` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdPartida` int(11) NOT NULL,
  `NumeroRonda` int(11) NOT NULL,
  `AtributoCompetido` varchar(100) NOT NULL, -- El atributo que se va a competir
  `IdJugadorQueElige` int(11) NOT NULL, -- Jugador que eligió el atributo
  `IdGanador` int(11) NULL, -- Ganador de la ronda (NULL mientras no termine)
  `Estado` varchar(50) NOT NULL DEFAULT 'Esperando', -- 'Esperando', 'EnProgreso', 'Finalizada'
  `FechaInicio` datetime(6) NULL,
  `FechaFin` datetime(6) NULL,
  `Active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`Id`),
  KEY `IX_Rondas_IdGanador` (`IdGanador`),
  KEY `IX_Rondas_IdPartida` (`IdPartida`),
  KEY `IX_Rondas_IdJugadorQueElige` (`IdJugadorQueElige`),
  UNIQUE KEY `UQ_Ronda_Partida_Numero` (`IdPartida`, `NumeroRonda`),
  CONSTRAINT `FK_Rondas_Jugadores_IdGanador` FOREIGN KEY (`IdGanador`) REFERENCES `jugadores` (`Id`),
  CONSTRAINT `FK_Rondas_Partidas_IdPartida` FOREIGN KEY (`IdPartida`) REFERENCES `partidas` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Rondas_Jugadores_IdJugadorQueElige` FOREIGN KEY (`IdJugadorQueElige`) REFERENCES `jugadores` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla fnaf.ranking_partidas
CREATE TABLE IF NOT EXISTS `ranking_partidas` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `IdPartida` int(11) NOT NULL,
  `IdJugador` int(11) NOT NULL,
  `NombreJugador` varchar(100) NOT NULL,
  `PuntosObtenidos` int(11) NOT NULL,
  `Posicion` int(11) NOT NULL,
  `FechaPartida` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_RankingPartidas_IdPartida` (`IdPartida`),
  KEY `IX_RankingPartidas_IdJugador` (`IdJugador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla fnaf.__efmigrationshistory
CREATE TABLE IF NOT EXISTS `__efmigrationshistory` (
  `MigrationId` varchar(150) NOT NULL,
  `ProductVersion` varchar(32) NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
