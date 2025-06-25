const pool = require("./pg");

const createVehiculo = async (chofer_id, modelo, placa) => {
  const query = `
    INSERT INTO vehiculos (chofer_id, modelo, placa, estado)
    VALUES ($1, $2, $3, 'operativo')
    RETURNING *;
  `;
  const values = [chofer_id, modelo, placa];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getVehiculoByChoferId = async (chofer_id) => {
  const query = `SELECT * FROM vehiculos WHERE chofer_id = $1;`;
  const values = [chofer_id];
  const result = await pool.query(query, values);
  return result.rows[0]; // A driver should only have one vehicle
};

const getVehiculoById = async (id) => {
  const query = `SELECT * FROM vehiculos WHERE id = $1;`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateVehiculoEstado = async (id, estado) => {
  const query = `UPDATE vehiculos SET estado = $1 WHERE id = $2 RETURNING *;`;
  const values = [estado, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteVehiculo = async (id) => {
  const query = `DELETE FROM vehiculos WHERE id = $1 RETURNING *;`;
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllVehiculosConChofer = async () => {
  const query = `
    SELECT
        v.id AS vehiculo_id,
        v.modelo AS vehiculo_modelo,
        v.placa AS vehiculo_placa,
        v.estado AS vehiculo_estado,
        c.nombre AS chofer_nombre,
        c.apellido AS chofer_apellido
    FROM vehiculos v
    LEFT JOIN choferes c ON v.chofer_id = c.id
    ORDER BY c.apellido, c.nombre, v.modelo;
  `;
  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Error al obtener todos los vehículos con información del chofer:', error);
    throw error;
  }
};

module.exports = {
  createVehiculo,
  getVehiculoByChoferId,
  getVehiculoById,
  updateVehiculoEstado,
  deleteVehiculo,
  getAllVehiculosConChofer,
};
