
const pool = require('./pg');
const bcrypt = require('bcrypt');

const createUser = async (username, password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const query = `
    INSERT INTO users (username, password, role)
    VALUES ($1, $2, 'gerente')
    RETURNING id;
  `;
  const result = await pool.query(query, [username, hashedPassword]);
  return result.rows[0].id;
};

const createGerente = async ({ userId, nombre, apellido, dni, telefono, email }) => {
  const query = `
    INSERT INTO gerentes (user_id, nombre, apellido, dni, telefono, email, estado)
    VALUES ($1, $2, $3, $4, $5, $6, 'activo');
  `;
  const values = [userId, nombre, apellido, dni, telefono, email];
  await pool.query(query, values);
};

const getAll = async (estado = 'activo') => {
  const result = await pool.query(`
    SELECT a.*, u.username
    FROM gerentes a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.estado = $1
    ORDER BY a.id;
  `, [estado]);
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query(`SELECT * FROM gerentes WHERE id = $1`, [id]);
  return result.rows[0];
};

const updateGerente = async (id, { nombre, apellido, dni, telefono, email }) => {
  const query = `
    UPDATE gerentes
    SET nombre = $1, apellido = $2, dni = $3, telefono = $4, email = $5
    WHERE id = $6;
  `;
  const values = [nombre, apellido, dni, telefono, email, id];
  await pool.query(query, values);
};

const changeEstado = async (id, estado) => {
  const query = `UPDATE gerentes SET estado = $1 WHERE id = $2;`;
  await pool.query(query, [estado, id]);
};

module.exports = {
  createUser,
  createGerente,
  getAll,
  getById,
  updateGerente,
  changeEstado,
};
