CREATE DATABASE prueba;
-- Tabla de Roles
CREATE TABLE Rol (
    Id_rol INT PRIMARY KEY AUTO_INCREMENT,
    Nombre_rol VARCHAR(15) NOT NULL
);

-- Tabla de Usuarios
CREATE TABLE Usuario (
    Id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    Id_rol INT NOT NULL,
    Imagen VARCHAR(255),
    Nombre VARCHAR(15) NOT NULL,
    Activo BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (Id_rol) REFERENCES Rol(Id_rol)
);

-- Tabla de Configuración de Sala
CREATE TABLE Configuracion_sala (
    Id_configuracion_sala INT PRIMARY KEY AUTO_INCREMENT,
    Codigo_sala INT UNIQUE,
    Tiempo_inicio DATETIME,
    Tiempo_final DATETIME,
    Jugadores_max INT,
    Cantidad_cartas INT,
    Cantidad_rondas INT,
    Activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabla de Partidas
CREATE TABLE Partida_sala (
    Id_partida_sala INT PRIMARY KEY AUTO_INCREMENT,
    Id_usuario INT NOT NULL,
    Id_configuracion_sala INT NOT NULL,
    Fondo_url VARCHAR(255),
    Tiempo_reparto TIME NOT NULL,
    Modo_espera BOOLEAN NOT NULL DEFAULT TRUE,
    Activo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (Id_usuario) REFERENCES Usuario(Id_usuario),
    FOREIGN KEY (Id_configuracion_sala) REFERENCES Configuracion_sala(Id_configuracion_sala)
);

-- Tabla de Atributos
CREATE TABLE Atributos (
    Id_atributo INT PRIMARY KEY AUTO_INCREMENT,
    Vida INT NOT NULL,
    Ataque INT NOT NULL,
    Defensa INT NOT NULL,
    Terror INT NOT NULL,
    Velocidad INT NOT NULL,
    Poder INT NOT NULL
);

-- Tabla de Poder
CREATE TABLE Poder (
    Id_atributo INT PRIMARY KEY AUTO_INCREMENT,
    Vida BOOLEAN,
    Ataque BOOLEAN,
    Defensa BOOLEAN,
    Terror BOOLEAN,
    Velocidad BOOLEAN,
    Poder BOOLEAN
);

-- Tabla de Tarjetas
CREATE TABLE Tarjetas (
    Id_tarjeta INT PRIMARY KEY AUTO_INCREMENT,
    Id_atributo INT NOT NULL,
    Id_poder INT NOT NULL,
    Tarjeta_categoria CHAR(2) NOT NULL UNIQUE,
    Nombre_tarjeta VARCHAR(30) NOT NULL,
    Tipo ENUM('comun','rara','especial') NOT NULL,
    Imagen_carta VARCHAR(255) NOT NULL,
    Puntaje_unico INT NOT NULL,
    FOREIGN KEY (Id_atributo) REFERENCES Atributos(Id_atributo),
    FOREIGN KEY (Id_poder) REFERENCES Poder(Id_atributo)
);

-- Tabla de Reparto de Cartas
CREATE TABLE Reparto_cartas (
    Id_reparto_cartas INT PRIMARY KEY AUTO_INCREMENT,
    Id_partida_sala INT NOT NULL,
    Id_tarjeta INT NOT NULL,
    Activo_repartir BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (Id_partida_sala) REFERENCES Partida_sala(Id_partida_sala),
    FOREIGN KEY (Id_tarjeta) REFERENCES Tarjetas(Id_tarjeta)
);

-- Tabla de Rondas
CREATE TABLE Ronda (
    Id_ronda INT PRIMARY KEY AUTO_INCREMENT,
    Id_partida_sala INT NOT NULL,
    Id_tarjetas INT NOT NULL,
    Turno BOOLEAN NOT NULL DEFAULT FALSE,
    Cantidad_rondas INT,
    FOREIGN KEY (Id_partida_sala) REFERENCES Partida_sala(Id_partida_sala),
    FOREIGN KEY (Id_tarjetas) REFERENCES Tarjetas(Id_tarjeta)
);

-- Tabla de Resultados
CREATE TABLE Resultado (
    Id_resultado INT PRIMARY KEY AUTO_INCREMENT,
    Id_ronda INT NOT NULL,
    Puntaje_total INT NOT NULL,
    FOREIGN KEY (Id_ronda) REFERENCES Ronda(Id_ronda)
);

-- Consultas de Prueba
INSERT INTO Rol (Nombre_rol) VALUES ('Administrador'), ('Jugador');

INSERT INTO Usuario (Id_rol, Imagen, Nombre, Activo) VALUES 
(1, 'admin.png', 'Admin', TRUE),
(2, 'user.png', 'Player1', TRUE);

INSERT INTO Configuracion_sala (Codigo_sala, Tiempo_inicio, Tiempo_final, Jugadores_max, Cantidad_cartas, Cantidad_rondas) VALUES 
(1234, '2023-10-01 10:00:00', '2023-10-01 12:00:00', 4, 5, 3);

INSERT INTO Partida_sala (Id_usuario, Id_configuracion_sala, Fondo_url, Tiempo_reparto, Modo_espera) VALUES 
(1, 1, 'background.jpg', '00:05:00', TRUE);

INSERT INTO Atributos (Vida, Ataque, Defensa, Terror, Velocidad, Poder) VALUES 
(100, 50, 30, 20, 40, 10);

--Consulta de 