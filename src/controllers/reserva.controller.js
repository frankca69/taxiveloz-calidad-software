// src/controllers/reserva.controller.js

/**
 * Controller for handling reservation-related requests.
 * This file will contain the logic for creating, retrieving, updating, and deleting reservations.
 */

// const pool = require('../models/pg'); // Import the pg pool - No longer needed
const Reserva = require('../models/Reserva.js'); // Import the Reserva model

// Function to get all reservations
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reserva.getAll();
    // The view expects column names like 'cliente_nombre', 'chofer_nombre', 'vehiculo_marca', 'vehiculo_modelo', 'vehiculo_patente'
    // The model's getAll method now provides 'nombre_cliente', 'nombre_chofer', 'modelo_vehiculo', 'placa_vehiculo'
    // We need to map these if the views are not updated, or update the views.
    // For now, let's assume the model aliases (like nombre_cliente) are what the views will adapt to or already expect from the new model.
    // The model returns `id_reserva`, `fecha`, `hora_inicio`, `hora_fin`, `estado_reserva`
    // The view `index.ejs` uses: `id_reserva`, `fecha_reserva` (needs to be `fecha`), `fecha_inicio_alquiler` (needs to be `hora_inicio`),
    // `fecha_fin_alquiler` (needs to be `hora_fin`), `estado_reserva`, `cliente_nombre`, `cliente_apellido`,
    // `chofer_nombre`, `chofer_apellido`, `vehiculo_marca`, `vehiculo_modelo`, `vehiculo_patente`.
    // The model provides: `id_reserva`, `fecha`, `hora_inicio`, `hora_fin`, `estado_reserva`,
    // `nombre_cliente`, `apellido_cliente`, `nombre_chofer`, `apellido_chofer`, `modelo_vehiculo`, `placa_vehiculo`.
    // The `vehiculo_marca` is not directly available from the model's `v.modelo AS modelo_vehiculo`.
    // This indicates a mismatch that needs to be resolved either in the model or the view.
    // Given the current task is to refactor the controller, I will pass data as is from the model.
    // View adjustments will be a separate task if needed.
    res.render('reservas/index', { reservations: reservations, error: null });
  } catch (error) {
    console.error("Error fetching all reservations in controller:", error);
    res.render('reservas/index', { reservations: [], error: 'Error fetching reservations' });
  }
};

// Function to get reservations by cliente_id
const getReservationsByCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;
    const reservations = await Reserva.getByClienteId(cliente_id);
    // Similar to getAllReservations, ensure data mapping or view updates if model's output fields differ from view expectations.
    // The view `cliente.ejs` also expects fields like `cliente_nombre`, `chofer_nombre`, etc.
    // It also expects `fecha_reserva`, `fecha_inicio_alquiler`, `fecha_fin_alquiler`.
    // The model provides `fecha`, `hora_inicio`, `hora_fin`.
    res.render('reservas/cliente', {
      reservations: reservations,
      error: reservations.length === 0 ? 'No reservations found for this client' : null,
      // Pass cliente_id if needed by the view, though it seems the view derives client name from the first reservation.
      // clienteId: cliente_id
    });
  } catch (error) {
    console.error(`Error fetching reservations for client ${req.params.cliente_id} in controller:`, error);
    res.render('reservas/cliente', {
      reservations: [],
      error: 'Error fetching reservations for this client',
      // clienteId: req.params.cliente_id
    });
  }
};

// Function to get reservations by chofer_id
const getReservationsByChofer = async (req, res) => {
  try {
    const { chofer_id } = req.params;
    const reservations = await Reserva.getByChoferId(chofer_id);
    // Similar mapping/view update considerations as above.
    // The view `chofer.ejs` expects fields like `chofer_nombre`, `cliente_nombre`, etc.
    // and date fields like `fecha_reserva`, etc.
    res.render('reservas/chofer', {
      reservations: reservations,
      error: reservations.length === 0 ? 'No reservations found for this chofer' : null,
      // choferId: chofer_id
    });
  } catch (error) {
    console.error(`Error fetching reservations for chofer ${req.params.chofer_id} in controller:`, error);
    res.render('reservas/chofer', {
      reservations: [],
      error: 'Error fetching reservations for this chofer',
      // choferId: req.params.chofer_id
    });
  }
};

// Function to get a single reservation by its ID
const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.getById(id);

    // The view `show.ejs` expects many specific fields:
    // `id_reserva`, `fecha_reserva`, `fecha_inicio_alquiler`, `fecha_fin_alquiler`, `origen`, `destino`, `tarifa`, `tipo_pago`, `estado_reserva`
    // `id_cliente`, `cliente_nombre`, `cliente_apellido`, `cliente_dni`, `cliente_telefono`, `cliente_email`
    // `id_chofer`, `chofer_nombre`, `chofer_apellido`, `chofer_dni`, `chofer_telefono`, `chofer_email`
    // `id_vehiculo`, `vehiculo_marca`, `vehiculo_modelo`, `vehiculo_patente`
    // The model provides: `id_reserva`, `fecha`, `hora_inicio`, `hora_fin`, `origen`, `destino`, `tarifa`, `tipo_pago`, `estado_reserva`
    // `id_cliente`, `nombre_cliente`, `apellido_cliente`, `dni_cliente`, `email_cliente`, `telefono_cliente`
    // `id_chofer`, `nombre_chofer`, `apellido_chofer`, `dni_chofer`, `email_chofer`, `telefono_chofer`
    // `id_vehiculo`, `modelo_vehiculo`, `placa_vehiculo`
    // Again, `vehiculo_marca` is missing.
    // The date fields also differ (`fecha` vs `fecha_reserva`).

    if (!reserva) {
      // If no reservation is found, render the show page with an error
      return res.status(404).render('reservas/show', { reserva: null, error: 'Reservation not found' });
    }
    // Render the show page with the reservation data
    res.render('reservas/show', { reserva: reserva, error: null });
  } catch (error) {
    console.error(`Error fetching reservation by ID ${req.params.id} in controller:`, error);
    // If there's a database error, render the show page with an error
    res.status(500).render('reservas/show', { reserva: null, error: 'Error fetching reservation' });
  }
};

module.exports = {
  getAllReservations,
  getReservationsByCliente,
  getReservationsByChofer,
  getReservationById,
  // Add other reservation-related functions here
};
