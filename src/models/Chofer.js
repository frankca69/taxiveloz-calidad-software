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

module.exports = {
  createUser,
  createChofer,
  getAll,
  getByEstado,
  getById,
  updateChofer,
  updateEstado,
  getAllActivosConVehiculo, // Exportar la nueva función

  /**
   * Finds available choferes for a given date and time range, excluding a specific reservation if provided.
   * @param {string} fecha - The date of the reservation (YYYY-MM-DD).
   * @param {string} hora_inicio - The start time of the reservation (HH:MM:SS or HH:MM).
   * @param {string} hora_fin - The end time of the reservation (HH:MM:SS or HH:MM).
   * @param {number|string|null} reserva_id_actual - The ID of the current reservation being edited, to exclude from conflict checks.
   * @param {Array<number|string>} choferes_a_excluir - An array of chofer IDs to exclude from the results.
   * @returns {Promise<Array>} A promise that resolves to an array of available chofer objects with vehicle info.
   */
  findAvailable: async (fecha, hora_inicio, hora_fin, reserva_id_actual = null, choferes_a_excluir = []) => {
    let query = `
      SELECT
          ch.id AS chofer_id,
          ch.nombre AS chofer_nombre,
          ch.apellido AS chofer_apellido,
          v.placa AS vehiculo_placa,
          v.modelo AS vehiculo_modelo
      FROM choferes ch
      JOIN vehiculos v ON ch.id = v.chofer_id
      WHERE ch.estado = 'activo' AND v.estado = 'operativo'
      AND ch.id NOT IN (
          SELECT r.chofer_id
          FROM reservas r
          WHERE r.fecha = $1
          AND r.estado NOT IN ('cancelada', 'finalizada', 'eliminada')
          AND (
              (r.hora_inicio < $3 AND r.hora_fin > $2) -- Solapamiento: la reserva existente se solapa con la nueva
          )
    `;

    const params = [fecha, hora_inicio, hora_fin];

    if (reserva_id_actual) {
      query += ` AND r.id <> $${params.length + 1}`; // Excluir la reserva actual del chequeo
      params.push(reserva_id_actual);
    }

    query += `
      )`; // Cierre del NOT IN subquery

    // Añadir exclusión de choferes específicos si el array tiene elementos
    if (choferes_a_excluir && choferes_a_excluir.length > 0) {
      // Crear placeholders para cada ID a excluir: $4, $5, etc.
      const placeholders = choferes_a_excluir.map((_, index) => `$${params.length + 1 + index}`).join(', ');
      query += ` AND ch.id NOT IN (${placeholders})`;
      params.push(...choferes_a_excluir);
    }

    query += `
      ORDER BY ch.nombre, ch.apellido;
    `;

    try {
      const { rows } = await pool.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error finding available choferes:', error);
      throw error;
    }
  },
  updatePassword: async (choferId, currentPassword, newPassword) => {
    try {
      const choferQuery = await pool.query('SELECT user_id FROM choferes WHERE id = $1', [choferId]);
      if (choferQuery.rows.length === 0) {
        console.error("Chofer no encontrado para actualizar contraseña.");
        return false;
      }
      const userId = choferQuery.rows[0].user_id;

      const userQuery = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
      if (userQuery.rows.length === 0) {
        console.error("Usuario no encontrado para actualizar contraseña.");
        return false;
      }
      const hashedPassword = userQuery.rows[0].password;

      const match = await bcrypt.compare(currentPassword, hashedPassword);
      if (!match) {
        console.log("La contraseña actual no coincide para el choferId:", choferId);
        return false;
      }

      const saltRounds = 10;
      const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newHashedPassword, userId]);
      return true;
    } catch (error) {
      console.error("Error al actualizar la contraseña del chofer:", error);
      throw error;
    }
  }
};

