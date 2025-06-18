const pool = require('./pg');
const bcrypt = require('bcrypt');

const findUserByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
};

const isDniTaken = async (dni) => {
  const result = await pool.query('SELECT id FROM clientes WHERE dni = $1', [dni]);
  return result.rows.length > 0;
};

const createUser = async (username, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id',
    [username, hashedPassword, 'cliente']
  );
  return result.rows[0].id;
};

const createCliente = async (userId, nombre, apellido, dni, telefono, email) => {
  await pool.query(
    `INSERT INTO clientes (user_id, nombre, apellido, dni, telefono, email)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, nombre, apellido, dni, telefono, email]
  );
};

const validateUserCredentials = async (username, password) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  return user;
};

// Session.js
const findClienteByDni = async (dni) => {
  const query = 'SELECT * FROM clientes WHERE dni = $1';
  const result = await pool.query(query, [dni]);
  return result.rows[0];
};

const updateClienteWithUser = async (clienteId, userId, datos) => {
  const { nombre, apellido, telefono, email } = datos;
  const query = `
    UPDATE clientes
    SET user_id = $1, nombre = $2, apellido = $3, telefono = $4, email = $5
    WHERE id = $6
  `;
  const values = [userId, nombre, apellido, telefono, email, clienteId];
  await pool.query(query, values);
};


module.exports = {
  findUserByUsername,
  isDniTaken,
  createUser,
  createCliente,
  validateUserCredentials,
  findClienteByDni,
  updateClienteWithUser
};

