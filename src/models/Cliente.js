const pool = require("./pg");

const store = async ({ nombre, apellido, dni, telefono, correo }) => {
  const query = `
    INSERT INTO clientes (nombre, apellido, dni, telefono, email)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [nombre, apellido, dni, telefono, correo];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Devuelve el cliente insertado
  } catch (error) {
    console.error('Error al insertar cliente:', error);
    throw error;
  }
};

const existsDNI = async (dni) => {
  const query = `SELECT id FROM clientes WHERE dni = $1`;
  const values = [dni];

  try {
    const result = await pool.query(query, values);
    return result.rows.length > 0; // true si existe
  } catch (error) {
    throw error;
  }
};

const getAll = async () => {
  try {
    const result = await pool.query(
      "SELECT * FROM clientes WHERE estado = 'activo' ORDER BY id"
    );
    return result.rows;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
};

const getById = async (id) => {
  try {
    const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    throw error;
  }
};

const updateCliente = async (id, { nombre, apellido, dni, telefono, correo }) => {
  const query = `
    UPDATE clientes
    SET nombre = $1, apellido = $2, dni = $3, telefono = $4, email = $5
    WHERE id = $6
  `;
  const values = [nombre, apellido, dni, telefono, correo, id];

  try {
    await pool.query(query, values);
  } catch (error) {
    throw error;
  }
};



const softDelete = async (id) => {
  const query = `UPDATE clientes SET estado = 'eliminado' WHERE id = $1`;
  const values = [id];

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error("Error al cambiar estado a eliminado:", error);
    throw error;
  }
};

// Nueva función para obtener todos los clientes activos con campos específicos
// Definición de getAllActivos
const getAllActivos = async () => {
  const query = `
    SELECT id, dni, nombre, apellido
    FROM clientes
    WHERE estado = 'activo'
    ORDER BY nombre, apellido;
  `;
  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Error al obtener clientes activos:', error);
    throw error;
  }
};

module.exports = {
  store,
  getAll,
  getById,
  updateCliente,
  existsDNI,
  getAllActivos, // Make sure it's exported
  softDelete,
  updatePassword: async (userId, currentPassword, newPassword) => {
    // Este método asume que el userId es el ID de la tabla 'users'
    // Los clientes pueden o no tener un user_id si se registran o son creados por un admin
    // El controlador debe asegurarse de pasar el user_id correcto.
    const bcrypt = require('bcrypt'); // Asegúrate de tener bcrypt aquí si no está global
    try {
      const userQuery = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
      if (userQuery.rows.length === 0) {
        console.error("Usuario no encontrado para actualizar contraseña (Cliente). UserID:", userId);
        return false;
      }
      const hashedPassword = userQuery.rows[0].password;

      const match = await bcrypt.compare(currentPassword, hashedPassword);
      if (!match) {
         console.log("La contraseña actual no coincide para el UserID (Cliente):", userId);
        return false;
      }

      const saltRounds = 10;
      const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newHashedPassword, userId]);
      return true;
    } catch (error) {
      console.error("Error al actualizar la contraseña del cliente (usuario):", error);
      throw error;
    }
  }
};