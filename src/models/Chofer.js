const pool = require("./pg");
const bcrypt = require('bcrypt');

const createUser = async (username, password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const query = `INSERT INTO users (username, password, role) VALUES ($1, $2, 'chofer') RETURNING id;`;
  const values = [username, hashedPassword];
  const result = await pool.query(query, values);
  return result.rows[0].id;
};

const createChofer = async ({ userId, nombre, apellido, dni, telefono, email }) => {
  const query = `INSERT INTO choferes (user_id, nombre, apellido, dni, telefono, email, estado) VALUES ($1, $2, $3, $4, $5, $6, 'activo');`;
  const values = [userId, nombre, apellido, dni, telefono, email];
  await pool.query(query, values);
};

const getAll = async () => {
  const query = `SELECT c.*, u.username FROM choferes c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.id;`;
  const result = await pool.query(query);
  return result.rows;
};

const getByEstado = async (estado) => {
  const query = `SELECT c.*, u.username FROM choferes c LEFT JOIN users u ON c.user_id = u.id WHERE c.estado = $1 ORDER BY c.id;`;
  const result = await pool.query(query, [estado]);
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query(`SELECT * FROM choferes WHERE id = $1`, [id]);
  return result.rows[0];
};

const updateChofer = async (id, { nombre, apellido, dni, telefono, email }) => {
  const query = `UPDATE choferes SET nombre = $1, apellido = $2, dni = $3, telefono = $4, email = $5 WHERE id = $6;`;
  const values = [nombre, apellido, dni, telefono, email, id];
  await pool.query(query, values);
};

const updateEstado = async (id, estado) => {
  const query = `UPDATE choferes SET estado = $1 WHERE id = $2;`;
  await pool.query(query, [estado, id]);
};

module.exports = {
  createUser,
  createChofer,
  getAll,
  getByEstado,
  getById,
  updateChofer,
  updateEstado,
  getAllActivosConVehiculo // Exportar la nueva función
};

//Frank

// Nueva función para obtener todos los choferes activos con vehículo
const getAllActivosConVehiculo = async () => {
  const query = `
    SELECT
        ch.id AS chofer_id,
        ch.nombre AS chofer_nombre,
        ch.apellido AS chofer_apellido,
        v.placa AS vehiculo_placa,
        v.modelo AS vehiculo_modelo
    FROM choferes ch
    JOIN vehiculos v ON ch.id = v.chofer_id
    WHERE ch.estado = 'activo' AND v.estado = 'operativo'
    ORDER BY ch.nombre, ch.apellido;
  `;
  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Error al obtener choferes activos con vehículo:', error);
    throw error;
  }
};