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

module.exports = {
  createVehiculo,
  getVehiculoByChoferId,
  getVehiculoById,
  updateVehiculoEstado,
  deleteVehiculo,
};
