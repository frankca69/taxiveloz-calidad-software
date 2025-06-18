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



module.exports = {
  store,
  getAll,
  getById,
  updateCliente,
  existsDNI,
  softDelete
};
