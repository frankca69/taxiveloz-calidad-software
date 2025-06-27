// src/models/Reserva.js
const pool = require('./pg'); // pg.js is in the same directory

class Reserva {
    /**
     * Fetches all reservations with detailed information from related tables.
     * @returns {Promise<Array>} A promise that resolves to an array of reservation objects.
     * @throws {Error} Throws an error if the database query fails.
     */
    static async getAll() {
        const query = `
            SELECT
                r.id AS id_reserva,
                r.fecha,
                r.hora_inicio,
                r.hora_fin,
                r.origen,
                r.destino,
                r.tarifa,
                r.tipo_pago,
                r.estado AS estado_reserva,
                c.id AS id_cliente,
                c.nombre AS nombre_cliente,
                c.apellido AS apellido_cliente,
                c.dni AS dni_cliente,
                c.email AS email_cliente,
                c.telefono AS telefono_cliente,
                ch.id AS id_chofer,
                ch.nombre AS nombre_chofer,
                ch.apellido AS apellido_chofer,
                ch.dni AS dni_chofer,
                ch.email AS email_chofer,
                ch.telefono AS telefono_chofer,
                v.id AS id_vehiculo,
                v.modelo AS modelo_vehiculo,
                v.placa AS placa_vehiculo
            FROM reservas r
            LEFT JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN choferes ch ON r.chofer_id = ch.id
            LEFT JOIN vehiculos v ON ch.id = v.chofer_id;
        `;
        // Note: The vehicle join is now ch.id = v.chofer_id as per subtask requirement
        try {
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('Error fetching all reservations from Reserva.js model:', error);
            throw error;
        }
    }

    /**
     * Fetches a single reservation by its ID with detailed information.
     * @param {number|string} id - The ID of the reservation to fetch.
     * @returns {Promise<Object|null>} A promise that resolves to the reservation object or null if not found.
     * @throws {Error} Throws an error if the database query fails.
     */
    static async getById(id) {
        const query = `
            SELECT
                r.id AS id_reserva,
                r.fecha,
                r.hora_inicio,
                r.hora_fin,
                r.origen,
                r.destino,
                r.tarifa,
                r.tipo_pago,
                r.estado AS estado_reserva,
                c.id AS id_cliente,
                c.nombre AS nombre_cliente,
                c.apellido AS apellido_cliente,
                c.dni AS dni_cliente,
                c.email AS email_cliente,
                c.telefono AS telefono_cliente,
                ch.id AS id_chofer,
                ch.nombre AS nombre_chofer,
                ch.apellido AS apellido_chofer,
                ch.dni AS dni_chofer,
                ch.email AS email_chofer,
                ch.telefono AS telefono_chofer,
                v.id AS id_vehiculo,
                v.modelo AS modelo_vehiculo,
                v.placa AS placa_vehiculo
            FROM reservas r
            LEFT JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN choferes ch ON r.chofer_id = ch.id
            LEFT JOIN vehiculos v ON ch.id = v.chofer_id
            WHERE r.id = $1;
        `;
        // Note: The vehicle join is now ch.id = v.chofer_id and filter is r.id = $1
        try {
            const { rows } = await pool.query(query, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error fetching reservation by ID ${id} from Reserva.js model:`, error);
            throw error;
        }
    }

    /**
     * Fetches all reservations for a specific client with detailed information.
     * @param {number|string} clienteId - The ID of the client.
     * @returns {Promise<Array>} A promise that resolves to an array of reservation objects.
     * @throws {Error} Throws an error if the database query fails.
     */
    static async getByClienteId(clienteId) {
        const query = `
            SELECT
                r.id AS id_reserva,
                r.fecha,
                r.hora_inicio,
                r.hora_fin,
                r.origen,
                r.destino,
                r.tarifa,
                r.tipo_pago,
                r.estado AS estado_reserva,
                c.id AS id_cliente,
                c.nombre AS nombre_cliente,
                c.apellido AS apellido_cliente,
                c.dni AS dni_cliente,
                c.email AS email_cliente,
                c.telefono AS telefono_cliente,
                ch.id AS id_chofer,
                ch.nombre AS nombre_chofer,
                ch.apellido AS apellido_chofer,
                ch.dni AS dni_chofer,
                ch.email AS email_chofer,
                ch.telefono AS telefono_chofer,
                v.id AS id_vehiculo,
                v.modelo AS modelo_vehiculo,
                v.placa AS placa_vehiculo
            FROM reservas r
            LEFT JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN choferes ch ON r.chofer_id = ch.id
            LEFT JOIN vehiculos v ON ch.id = v.chofer_id
            WHERE r.cliente_id = $1;
        `;
        // Note: The vehicle join is now ch.id = v.chofer_id and filter is r.cliente_id = $1
        try {
            const { rows } = await pool.query(query, [clienteId]);
            return rows;
        } catch (error) {
            console.error(`Error fetching reservations by client ID ${clienteId} from Reserva.js model:`, error);
            throw error;
        }
    }

    /**
     * Fetches all reservations for a specific chofer (driver) with detailed information.
     * @param {number|string} choferId - The ID of the chofer.
     * @returns {Promise<Array>} A promise that resolves to an array of reservation objects.
     * @throws {Error} Throws an error if the database query fails.
     */
    static async getByChoferId(choferId) {
        const query = `
            SELECT
                r.id AS id_reserva,
                r.fecha,
                r.hora_inicio,
                r.hora_fin,
                r.origen,
                r.destino,
                r.tarifa,
                r.tipo_pago,
                r.estado AS estado_reserva,
                c.id AS id_cliente,
                c.nombre AS nombre_cliente,
                c.apellido AS apellido_cliente,
                c.dni AS dni_cliente,
                c.email AS email_cliente,
                c.telefono AS telefono_cliente,
                ch.id AS id_chofer,
                ch.nombre AS nombre_chofer,
                ch.apellido AS apellido_chofer,
                ch.dni AS dni_chofer,
                ch.email AS email_chofer,
                ch.telefono AS telefono_chofer,
                v.id AS id_vehiculo,
                v.modelo AS modelo_vehiculo,
                v.placa AS placa_vehiculo
            FROM reservas r
            LEFT JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN choferes ch ON r.chofer_id = ch.id
            LEFT JOIN vehiculos v ON ch.id = v.chofer_id
            WHERE r.chofer_id = $1;
        `;
        // Note: The vehicle join is now ch.id = v.chofer_id and filter is r.chofer_id = $1
        try {
            const { rows } = await pool.query(query, [choferId]);
            return rows;
        } catch (error) {
            console.error(`Error fetching reservations by chofer ID ${choferId} from Reserva.js model:`, error);
            throw error;
        }
    }

    /**
     * Creates a new reservation in the database.
     * @param {Object} reservaData - An object containing the reservation details.
     * @param {number} reservaData.cliente_id - The ID of the client.
     * @param {number} reservaData.chofer_id - The ID of the chofer.
     * @param {string} reservaData.fecha - The date of the reservation (YYYY-MM-DD).
     * @param {string} [reservaData.hora_inicio] - The start time of the reservation (HH:MM:SS).
     * @param {string} [reservaData.hora_fin] - The end time of the reservation (HH:MM:SS).
     * @param {string} [reservaData.origen] - The origin of the trip.
     * @param {string} [reservaData.destino] - The destination of the trip.
     * @param {number} [reservaData.tarifa] - The fare for the trip.
     * @param {string} [reservaData.tipo_pago] - The payment type ('efectivo', 'virtual').
     * @returns {Promise<Object>} A promise that resolves to the newly created reservation object.
     * @throws {Error} Throws an error if the database query fails.
     */
    static async create(reservaData) {
        const {
            cliente_id,
            chofer_id,
            fecha,
            hora_inicio,
            hora_fin,
            origen,
            destino,
            tarifa,
            tipo_pago
        } = reservaData;

        // The 'estado' defaults to 'espera' as per the table definition.
        const query = `
            INSERT INTO reservas (
                cliente_id,
                chofer_id,
                fecha,
                hora_inicio,
                hora_fin,
                origen,
                destino,
                tarifa,
                tipo_pago
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        // RETURNING * will return all columns of the newly inserted row.

        try {
            const { rows } = await pool.query(query, [
                cliente_id,
                chofer_id,
                fecha,
                hora_inicio,
                hora_fin,
                origen,
                destino,
                tarifa,
                tipo_pago
            ]);
            return rows[0]; // Return the newly created reservation
        } catch (error) {
            console.error('Error creating reservation in Reserva.js model:', error);
            throw error;
        }
    }

    /**
     * Updates the state of a reservation to 'confirmada'.
     * @param {number|string} id - The ID of the reservation to confirm.
     * @returns {Promise<Object|null>} A promise that resolves to the updated reservation object or null if not found.
     * @throws {Error} Throws an error if the database query fails.
     */
    static async confirmarReserva(id) {
        const query = `
            UPDATE reservas
            SET estado = 'confirmada'
            WHERE id = $1
            RETURNING *;
        `;
        try {
            const { rows } = await pool.query(query, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error confirming reservation with ID ${id} in Reserva.js model:`, error);
            throw error;
        }
    }

    /**
     * Updates the state of a reservation to 'finalizada'.
     * @param {number|string} id - The ID of the reservation to finalize.
     * @returns {Promise<Object|null>} A promise that resolves to the updated reservation object or null if not found.
     * @throws {Error} Throws an error if the database query fails.
     */
    static async finalizarReserva(id) {
        const query = `
            UPDATE reservas
            SET estado = 'finalizada'
            WHERE id = $1
            RETURNING *;
        `;
        try {
            const { rows } = await pool.query(query, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error finalizing reservation with ID ${id} in Reserva.js model:`, error);
            throw error;
        }
    }
}

module.exports = Reserva;
