-- Tabla base de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('gerente', 'cliente', 'admin', 'chofer'))
);

-- Tabla de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni CHAR(8) NOT NULL UNIQUE,
    telefono CHAR(9),
    email VARCHAR(100) UNIQUE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'eliminado'))
);

-- Tabla de gerentes
CREATE TABLE gerentes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni CHAR(8) NOT NULL UNIQUE,
    telefono CHAR(9),
    email VARCHAR(100) UNIQUE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'eliminado'))
);

-- Tabla de administradores
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni CHAR(8) NOT NULL UNIQUE,
    telefono CHAR(9),
    email VARCHAR(100) UNIQUE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'eliminado'))
);

-- Tabla de choferes
CREATE TABLE choferes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni CHAR(8) NOT NULL UNIQUE,
    telefono CHAR(9),
    email VARCHAR(100) UNIQUE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'eliminado'))
);

-- Tabla de vehículos
CREATE TABLE vehiculos (
    id SERIAL PRIMARY KEY,
    chofer_id INT NOT NULL REFERENCES choferes(id) ON DELETE CASCADE,
    modelo VARCHAR(50) NOT NULL,
    placa CHAR(7) NOT NULL UNIQUE,
    estado VARCHAR(20) DEFAULT 'operativo' CHECK (estado IN ('operativo', 'inoperativo'))
);

-- Tabla de reservas
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    chofer_id INT NOT NULL REFERENCES choferes(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    origen VARCHAR(100),
    destino VARCHAR(100),
    tarifa NUMERIC(10, 2),
    tipo_pago VARCHAR(20) CHECK (tipo_pago IN ('efectivo', 'virtual')),
    estado VARCHAR(20) DEFAULT 'espera' CHECK (estado IN ('espera', 'confirmada', 'notificada', 'finalizada', 'eliminada'))
);

