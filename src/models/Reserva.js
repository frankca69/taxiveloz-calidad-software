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
                r.distancia_km,
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
            WHERE r.estado <> 'eliminada';
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
                r.distancia_km,
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
                r.distancia_km,
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
            WHERE r.cliente_id = $1 AND r.estado <> 'eliminada';
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
                r.distancia_km,
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
            WHERE r.chofer_id = $1 AND r.estado <> 'eliminada';
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
            tipo_pago,
            distancia_km // Nuevo campo
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
                tipo_pago,
                distancia_km
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
                tipo_pago,
                distancia_km // Añadir a los parámetros de la consulta
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

    /**
     * Updates the state of a reservation to 'notificada'.
     * @param {number|string} id - The ID of the reservation to notify.
     * @returns {Promise<Object|null>} A promise that resolves to the updated reservation object or null if not found.
     * @throws {Error} Throws an error if the database query fails.
     */
    static async notificarReserva(id) {
        const query = `
            UPDATE reservas
            SET estado = 'notificada'
            WHERE id = $1
            RETURNING *;
        `;
        try {
            const { rows } = await pool.query(query, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error notifying reservation with ID ${id} in Reserva.js model:`, error);
            throw error;
        }
    }

    /**
     * Updates the state of a reservation to 'eliminada'.
     * @param {number|string} id - The ID of the reservation to delete.
     * @returns {Promise<Object|null>} A promise that resolves to the updated reservation object or null if not found.
     * @throws {Error} Throws an error if the database query fails.
     */
    static async eliminarReserva(id) {
        const query = `
            UPDATE reservas
            SET estado = 'eliminada'
            WHERE id = $1
            RETURNING *;
        `;
        try {
            const { rows } = await pool.query(query, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error deleting reservation with ID ${id} in Reserva.js model:`, error);
            throw error;
        }
    }

    /**
     * Updates an existing reservation in the database.
     * @param {number|string} id - The ID of the reservation to update.
     * @param {Object} reservaData - An object containing the reservation details to update.
     * @returns {Promise<Object|null>} A promise that resolves to the updated reservation object or null if not found.
     * @throws {Error} Throws an error if the database query fails.
     */
    static async update(id, reservaData) {
        const {
            cliente_id,
            chofer_id,
            fecha,
            hora_inicio,
            hora_fin,
            origen,
            destino,
            tarifa,
            tipo_pago,
            estado, // Added estado
            distancia_km // Nuevo campo
        } = reservaData;

        const query = `
            UPDATE reservas
            SET
                cliente_id = $1,
                chofer_id = $2,
                fecha = $3,
                hora_inicio = $4,
                hora_fin = $5,
                origen = $6,
                destino = $7,
                tarifa = $8,
                tipo_pago = $9,
                estado = $10,
                distancia_km = $11
            WHERE id = $12
            RETURNING *;
        `;

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
                tipo_pago,
                estado,
                distancia_km, // Añadir a los parámetros de la consulta
                id
            ]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error updating reservation with ID ${id} in Reserva.js model:`, error);
            throw error;
        }
    }

    static async getAllPaginated(limit, offset, estado = '', sortBy = 'fecha', sortOrder = 'desc') {
        let queryParams = [limit, offset];
        let countQueryParams = [];

        let whereClause = "WHERE r.estado <> 'eliminada'";
        if (estado) {
            whereClause += ` AND r.estado = $${queryParams.length + 1}`;
            queryParams.push(estado);
            countQueryParams.push(estado); // Mismo estado para la consulta de conteo
        }

        // Validación de sortBy para evitar inyección SQL
        const allowedSortBy = {
            'fecha': 'r.fecha',
            'tarifa': 'r.tarifa',
            'estado': 'r.estado', // Asumiendo que quieres ordenar por el string del estado
            'cliente': 'nombre_cliente', // Ordenar por nombre de cliente
            'chofer': 'nombre_chofer' // Ordenar por nombre de chofer
        };
        const orderByColumn = allowedSortBy[sortBy.toLowerCase()] || 'r.fecha'; // Default a r.fecha si no es válido

        // Validación de sortOrder
        const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        const query = `
            SELECT
                r.id AS id_reserva, r.fecha, r.hora_inicio, r.hora_fin, r.origen, r.destino,
                r.tarifa, r.tipo_pago, r.estado AS estado_reserva, r.distancia_km,
                c.id AS id_cliente, c.nombre AS nombre_cliente, c.apellido AS apellido_cliente,
                c.dni AS dni_cliente, c.email AS email_cliente, c.telefono AS telefono_cliente,
                ch.id AS id_chofer, ch.nombre AS nombre_chofer, ch.apellido AS apellido_chofer,
                ch.dni AS dni_chofer, ch.email AS email_chofer, ch.telefono AS telefono_chofer,
                v.id AS id_vehiculo, v.modelo AS modelo_vehiculo, v.placa AS placa_vehiculo
            FROM reservas r
            LEFT JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN choferes ch ON r.chofer_id = ch.id
            LEFT JOIN vehiculos v ON ch.id = v.chofer_id
            ${whereClause}
            ORDER BY ${orderByColumn} ${orderDirection}, r.hora_inicio ${orderDirection}
            LIMIT $1 OFFSET $2;
        `;

        let countQueryBase = "SELECT COUNT(*) FROM reservas r "; // Alias r para consistencia con whereClause si se usa
        let countQuery = countQueryBase + whereClause.replace(/r\.estado = \$[0-9]+/g, (match) => {
            // Ajustar el índice del placeholder para countQueryParams
            // Si estado es $3 en queryParams (limit=$1, offset=$2, estado=$3)
            // será $1 en countQueryParams
            const paramIndex = queryParams.indexOf(estado); // Encuentra el índice de 'estado' en queryParams
            if (paramIndex !== -1) { // Si 'estado' está en queryParams
                 // El índice en countQueryParams es +1 porque los placeholders son 1-based
                return `r.estado = $${countQueryParams.indexOf(queryParams[paramIndex]) + 1}`;
            }
            return match; // No debería llegar aquí si el estado está presente
        });


        try {
            const { rows } = await pool.query(query, queryParams);
            const countResult = await pool.query(countQuery, countQueryParams);
            const totalItems = parseInt(countResult.rows[0].count, 10);
            return { rows, totalItems };
        } catch (error) {
            console.error('Error fetching all paginated reservations from Reserva.js model:', error);
            throw error;
        }
    }

    static async getByClienteIdPaginated(clienteId, limit, offset, estado = '', sortBy = 'fecha', sortOrder = 'desc') {
        let queryParams = [clienteId, limit, offset];
        let countQueryParams = [clienteId];

        let whereClause = "WHERE r.cliente_id = $1 AND r.estado <> 'eliminada'";
        if (estado) {
            whereClause += ` AND r.estado = $${queryParams.length + 1}`; // Será $4
            queryParams.push(estado);
            countQueryParams.push(estado); // Será $2
        }

        const allowedSortBy = {
            'fecha': 'r.fecha',
            'tarifa': 'r.tarifa',
            'estado': 'r.estado',
            'chofer': 'nombre_chofer'
        };
        const orderByColumn = allowedSortBy[sortBy.toLowerCase()] || 'r.fecha';
        const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        const query = `
            SELECT
                r.id AS id_reserva, r.fecha, r.hora_inicio, r.hora_fin, r.origen, r.destino,
                r.tarifa, r.tipo_pago, r.estado AS estado_reserva, r.distancia_km,
                c.id AS id_cliente, c.nombre AS nombre_cliente, c.apellido AS apellido_cliente,
                ch.id AS id_chofer, ch.nombre AS nombre_chofer, ch.apellido AS apellido_chofer,
                v.modelo AS modelo_vehiculo, v.placa AS placa_vehiculo
            FROM reservas r
            LEFT JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN choferes ch ON r.chofer_id = ch.id
            LEFT JOIN vehiculos v ON ch.id = v.chofer_id
            ${whereClause}
            ORDER BY ${orderByColumn} ${orderDirection}, r.hora_inicio ${orderDirection}
            LIMIT $2 OFFSET $3;
        `;
        // Ajuste para countQuery: r.cliente_id = $1, y si hay estado, r.estado = $2
        let countQuery = `SELECT COUNT(*) FROM reservas r WHERE r.cliente_id = $1 AND r.estado <> 'eliminada'`;
        if (estado) {
            countQuery += ` AND r.estado = $2`;
        }

        try {
            const { rows } = await pool.query(query, queryParams);
            const countResult = await pool.query(countQuery, countQueryParams);
            const totalItems = parseInt(countResult.rows[0].count, 10);
            return { rows, totalItems };
        } catch (error) {
            console.error(`Error fetching paginated reservations for client ID ${clienteId}:`, error);
            throw error;
        }
    }

    static async getByChoferIdPaginated(choferId, limit, offset, estado = '', sortBy = 'fecha', sortOrder = 'desc') {
        let queryParams = [choferId, limit, offset];
        let countQueryParams = [choferId];

        let whereClause = "WHERE r.chofer_id = $1 AND r.estado <> 'eliminada'";
        if (estado) {
            whereClause += ` AND r.estado = $${queryParams.length + 1}`; // Será $4
            queryParams.push(estado);
            countQueryParams.push(estado); // Será $2
        }

        const allowedSortBy = {
            'fecha': 'r.fecha',
            'tarifa': 'r.tarifa',
            'estado': 'r.estado',
            'cliente': 'nombre_cliente'
        };
        const orderByColumn = allowedSortBy[sortBy.toLowerCase()] || 'r.fecha';
        const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        const query = `
            SELECT
                r.id AS id_reserva, r.fecha, r.hora_inicio, r.hora_fin, r.origen, r.destino,
                r.tarifa, r.tipo_pago, r.estado AS estado_reserva, r.distancia_km,
                c.id AS id_cliente, c.nombre AS nombre_cliente, c.apellido AS apellido_cliente,
                ch.id AS id_chofer, ch.nombre AS nombre_chofer, ch.apellido AS apellido_chofer,
                v.modelo AS modelo_vehiculo, v.placa AS placa_vehiculo
            FROM reservas r
            LEFT JOIN clientes c ON r.cliente_id = c.id
            LEFT JOIN choferes ch ON r.chofer_id = ch.id
            LEFT JOIN vehiculos v ON ch.id = v.chofer_id
            ${whereClause}
            ORDER BY ${orderByColumn} ${orderDirection}, r.hora_inicio ${orderDirection}
            LIMIT $2 OFFSET $3;
        `;

        let countQuery = `SELECT COUNT(*) FROM reservas r WHERE r.chofer_id = $1 AND r.estado <> 'eliminada'`;
        if (estado) {
            countQuery += ` AND r.estado = $2`;
        }

        try {
            const { rows } = await pool.query(query, queryParams);
            const countResult = await pool.query(countQuery, countQueryParams);
            const totalItems = parseInt(countResult.rows[0].count, 10);
            return { rows, totalItems };
        } catch (error) {
            console.error(`Error fetching paginated reservations for chofer ID ${choferId}:`, error);
            throw error;
        }
    }
}

module.exports = Reserva;
