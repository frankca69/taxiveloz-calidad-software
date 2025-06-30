//Frank
const pool = require('./pg');
const bcrypt = require('bcrypt');

const createUser = async (username, password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const query = `
    INSERT INTO users (username, password, role)
    VALUES ($1, $2, 'admin')
    RETURNING id;
  `;
  const result = await pool.query(query, [username, hashedPassword]);
  return result.rows[0].id;
};

const createAdmin = async ({ userId, nombre, apellido, dni, telefono, email }) => {
  const query = `
    INSERT INTO admins (user_id, nombre, apellido, dni, telefono, email, estado)
    VALUES ($1, $2, $3, $4, $5, $6, 'activo');
  `;
  const values = [userId, nombre, apellido, dni, telefono, email];
  await pool.query(query, values);
};

const getAll = async (estado = 'activo') => {
  const result = await pool.query(`
    SELECT a.*, u.username
    FROM admins a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.estado = $1
    ORDER BY a.id;
  `, [estado]);
  return result.rows;
};

const getById = async (id) => {
  const result = await pool.query(`SELECT * FROM admins WHERE id = $1`, [id]);
  return result.rows[0];
};

const updateAdmin = async (id, { nombre, apellido, dni, telefono, email }) => {
  const query = `
    UPDATE admins
    SET nombre = $1, apellido = $2, dni = $3, telefono = $4, email = $5
    WHERE id = $6;
  `;
  const values = [nombre, apellido, dni, telefono, email, id];
  await pool.query(query, values);
};

const changeEstado = async (id, estado) => {
  const query = `UPDATE admins SET estado = $1 WHERE id = $2;`;
  await pool.query(query, [estado, id]);
};

module.exports = {
  createUser,
  createAdmin,
  getAll,
  getById,
  updateAdmin,
  changeEstado,
  updatePassword: async (adminId, currentPassword, newPassword) => {
    try {
      // Obtener el user_id del admin
      const adminQuery = await pool.query('SELECT user_id FROM admins WHERE id = $1', [adminId]);
      if (adminQuery.rows.length === 0) {
        console.error("Admin no encontrado para actualizar contraseña.");
        return false;
      }
      const userId = adminQuery.rows[0].user_id;

      // Obtener la contraseña actual hasheada del usuario
      const userQuery = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
      if (userQuery.rows.length === 0) {
        console.error("Usuario no encontrado para actualizar contraseña.");
        return false;
      }
      const hashedPassword = userQuery.rows[0].password;

      // Verificar la contraseña actual
      const match = await bcrypt.compare(currentPassword, hashedPassword);
      if (!match) {
        console.log("La contraseña actual no coincide para el adminId:", adminId);
        return false; // La contraseña actual no coincide
      }

      // Hashear la nueva contraseña
      const saltRounds = 10;
      const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar la contraseña en la tabla users
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newHashedPassword, userId]);
      return true;
    } catch (error) {
      console.error("Error al actualizar la contraseña del admin:", error);
      throw error; // O retornar false si se prefiere no lanzar el error
    }
  }
};
