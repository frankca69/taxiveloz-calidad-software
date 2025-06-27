// src/controllers/reserva.controller.js

/**
 * Controller for handling reservation-related requests.
 * This file will contain the logic for creating, retrieving, updating, and deleting reservations.
 */

// const pool = require('../models/pg'); // Import the pg pool - No longer needed
const Reserva = require('../models/Reserva.js'); // Import the Reserva model
const Cliente = require('../models/Cliente.js'); // Import Cliente model
const Chofer = require('../models/Chofer.js'); // Import Chofer model

// Function to display the form for creating a new reservation
const showCreateForm = async (req, res) => {
  try {
    const clientes = await Cliente.getAllActivos(); // Fetch active clients
    const choferesRaw = await Chofer.getAllActivosConVehiculo(); // Fetch active choferes with vehicles

    // Format choferes for display: "Placa - Modelo - Nombre Apellido"
    const choferesDisplay = choferesRaw.map(ch => ({ // Usar choferesRaw aquí
      id: ch.chofer_id,
      display_name: `${ch.vehiculo_placa} - ${ch.vehiculo_modelo} - ${ch.chofer_nombre} ${ch.chofer_apellido}`
    }));

    // Format clientes for display: "DNI - Nombre Apellido"
    const clientesDisplay = clientes.map(cl => ({
      id: cl.id,
      display_name: `${cl.dni} - ${cl.nombre} ${cl.apellido}`
    }));

    res.render('reservas/create', {
      clientes: clientesDisplay,
      choferes: choferesDisplay,
      error: null,
      oldInput: {} // For repopulating form in case of error
    });
  } catch (error) {
    console.error("Error fetching data for create reservation form:", error);
    // It might be better to render an error page or redirect with an error message
    res.render('reservas/create', {
      clientes: [],
      choferes: [],
      error: 'Error al cargar datos para el formulario de reserva.',
      oldInput: {}
    });
  }
};

// Function to handle the creation of a new reservation
const createReservation = async (req, res) => {
  try {
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
    } = req.body;

    // Basic validation (more can be added)
    if (!cliente_id || !chofer_id || !fecha || !tarifa || !tipo_pago) {
      // If validation fails, re-render the form with an error message and old input
      const clientes = await Cliente.getAllActivos();
      const choferes = await Chofer.getAllActivosConVehiculo();
      const choferesDisplay = choferes.map(ch => ({
        id: ch.chofer_id,
        display_name: `${ch.vehiculo_placa} - ${ch.vehiculo_modelo} - ${ch.chofer_nombre} ${ch.chofer_apellido}`
      }));
      const clientesDisplay = clientes.map(cl => ({
        id: cl.id,
        display_name: `${cl.dni} - ${cl.nombre} ${cl.apellido}`
      }));

      return res.render('reservas/create', {
        clientes: clientesDisplay,
        choferes: choferesDisplay,
        error: 'Todos los campos marcados con * son obligatorios.',
        oldInput: req.body // Pass back the submitted data
      });
    }

    // Prepare data for Reserva.create
    const reservaData = {
      cliente_id: parseInt(cliente_id),
      chofer_id: parseInt(chofer_id),
      fecha,
      hora_inicio: hora_inicio || null, // Handle optional fields
      hora_fin: hora_fin || null,
      origen: origen || null,
      destino: destino || null,
      tarifa: parseFloat(tarifa),
      tipo_pago
    };

    const nuevaReserva = await Reserva.create(reservaData);
    // Redirect to the list of reservations or a success page
    // For now, redirecting to all reservations. A success flash message would be good.
    res.redirect('/reservas'); // Assuming '/reservas' lists all reservations

  } catch (error) {
    console.error("Error creating reservation:", error);
    // In case of error (e.g., database error), re-render form with error
    // It's important to also repopulate the form with previous input
    const clientes = await Cliente.getAllActivos();
    const choferes = await Chofer.getAllActivosConVehiculo();
    const choferesDisplay = choferes.map(ch => ({
        id: ch.chofer_id,
        display_name: `${ch.vehiculo_placa} - ${ch.vehiculo_modelo} - ${ch.chofer_nombre} ${ch.chofer_apellido}`
      }));
    const clientesDisplay = clientes.map(cl => ({
        id: cl.id,
        display_name: `${cl.dni} - ${cl.nombre} ${cl.apellido}`
      }));

    res.render('reservas/create', {
      clientes: clientesDisplay,
      choferes: choferesDisplay,
      error: 'Error al guardar la reserva. Inténtelo de nuevo.',
      oldInput: req.body
    });
  }
};


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
  showCreateForm, // Export new function
  createReservation, // Export new function

  // Function to confirm a reservation
  confirmarReserva: async (req, res) => {
    try {
      const { id } = req.params;
      const reservaActualizada = await Reserva.confirmarReserva(id);
      if (!reservaActualizada) {
        // Consider how to handle this: maybe a 404 or a specific error message
        // For now, redirecting back, a flash message would be good.
        return res.redirect('back'); // 'back' might not be ideal, consider a specific route
      }
      // Redirect to the chofer's reservations view, assuming the user is a chofer or admin viewing a chofer's page
      // This requires knowing the chofer_id from the updated reservation or passing it somehow.
      // For simplicity, if chofer_id is available on reservaActualizada, use it.
      // Otherwise, might need to redirect to a general page or handle differently.
      if (reservaActualizada.chofer_id) {
        res.redirect(`/reservas/chofer/${reservaActualizada.chofer_id}`);
      } else {
        res.redirect('/reservas'); // Fallback redirect
      }
    } catch (error) {
      console.error(`Error confirming reservation with ID ${req.params.id}:`, error);
      // Handle error, perhaps redirect back with an error message
      res.redirect('back'); // Or a more specific error handling page/route
    }
  },

  // Function to finalize a reservation
  finalizarReserva: async (req, res) => {
    try {
      const { id } = req.params;
      const reservaActualizada = await Reserva.finalizarReserva(id);
      if (!reservaActualizada) {
        return res.redirect('back');
      }
      if (reservaActualizada.chofer_id) {
        res.redirect(`/reservas/chofer/${reservaActualizada.chofer_id}`);
      } else {
        res.redirect('/reservas');
      }
    } catch (error) {
      console.error(`Error finalizing reservation with ID ${req.params.id}:`, error);
      res.redirect('back');
    }
  },

  // Function to notify a reservation
  notificarReserva: async (req, res) => {
    try {
      const { id } = req.params;
      const reservaActualizada = await Reserva.notificarReserva(id);
      if (!reservaActualizada) {
        // Consider specific error handling or flash message
        return res.redirect('/reservas?error=notfound');
      }
      res.redirect('/reservas?success=notified'); // Redirect to general reservations list
    } catch (error) {
      console.error(`Error notifying reservation with ID ${req.params.id}:`, error);
      res.redirect('/reservas?error=processing'); // Redirect with error
    }
  },

  // Function to delete (mark as eliminated) a reservation
  eliminarReserva: async (req, res) => {
    try {
      const { id } = req.params;
      const reservaActualizada = await Reserva.eliminarReserva(id);
      if (!reservaActualizada) {
        return res.redirect('/reservas?error=notfound');
      }
      res.redirect('/reservas?success=deleted');
    } catch (error) {
      console.error(`Error deleting reservation with ID ${req.params.id}:`, error);
      res.redirect('/reservas?error=processing');
    }
  },

  // Show form to edit a reservation
  showEditForm: async (req, res) => {
    try {
      const { id } = req.params;
      const reserva = await Reserva.getById(id);

      if (!reserva) {
        // Consider rendering an error page or redirecting with a message
        return res.status(404).send('Reserva no encontrada'); // Simple 404 for now
      }

      // Fetch clients and choferes for dropdowns, similar to showCreateForm
      const clientes = await Cliente.getAllActivos();
      const choferesRaw = await Chofer.getAllActivosConVehiculo();

      const choferesDisplay = choferesRaw.map(ch => ({
        id: ch.chofer_id,
        display_name: `${ch.vehiculo_placa} - ${ch.vehiculo_modelo} - ${ch.chofer_nombre} ${ch.chofer_apellido}`
      }));

      const clientesDisplay = clientes.map(cl => ({
        id: cl.id,
        display_name: `${cl.dni} - ${cl.nombre} ${cl.apellido}`
      }));

      res.render('reservas/edit', {
        reserva, // Pass the specific reservation data
        clientes: clientesDisplay,
        choferes: choferesDisplay,
        error: null
      });
    } catch (error) {
      console.error(`Error fetching reservation for edit with ID ${req.params.id}:`, error);
      // Consider a more user-friendly error page or redirect
      res.status(500).send('Error al cargar el formulario de edición de reserva.');
    }
  },

  // Update an existing reservation
  updateReservation: async (req, res) => {
    try {
      const { id } = req.params;
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
        estado // Added estado
      } = req.body;

      // Basic validation (can be expanded)
      if (!cliente_id || !chofer_id || !fecha || !tarifa || !tipo_pago || !estado) {
        // If validation fails, re-render form with error and existing data
        // This requires fetching reserva, clientes, choferes again, or passing them differently
        // For simplicity, redirecting back to edit form with a query param error might be easier
        // Or, better, re-render with all necessary data
        const reserva = await Reserva.getById(id); // Refetch current reserva data
        const clientes = await Cliente.getAllActivos();
        const choferesRaw = await Chofer.getAllActivosConVehiculo();
        const choferesDisplay = choferesRaw.map(ch => ({ /* ... */ }));
        const clientesDisplay = clientes.map(cl => ({ /* ... */ }));

        return res.render('reservas/edit', {
            reserva: { ...reserva, ...req.body }, // Merge original with attempted changes for repopulation
            clientes: clientesDisplay, // You'll need to re-fetch or pass these
            choferes: choferesDisplay, // Same as above
            error: 'Todos los campos marcados con * son obligatorios, incluyendo el estado.'
        });
      }

      const reservaData = {
        cliente_id: parseInt(cliente_id),
        chofer_id: parseInt(chofer_id),
        fecha,
        hora_inicio: hora_inicio || null,
        hora_fin: hora_fin || null,
        origen: origen || null,
        destino: destino || null,
        tarifa: parseFloat(tarifa),
        tipo_pago,
        estado // Include estado in the data to be updated
      };

      const reservaActualizada = await Reserva.update(id, reservaData);

      if (!reservaActualizada) {
        // Handle case where update failed (e.g., reservation not found)
        // This might involve re-rendering the edit form with an error
        return res.status(404).send('No se pudo actualizar la reserva. Reserva no encontrada.');
      }

      res.redirect(`/reservas/${id}?success=updated`); // Redirect to reservation details page
    } catch (error) {
      console.error(`Error updating reservation with ID ${req.params.id}:`, error);
      // Re-render edit form with error, requires fetching data again
      // For simplicity, redirecting or sending a generic error
      const { id } = req.params;
      // It's better to re-render the form with the error and old input
      // Fetching all data again for re-render:
      const reserva = await Reserva.getById(id); // Potentially stale if update partially succeeded then failed
      const clientes = await Cliente.getAllActivos();
      const choferesRaw = await Chofer.getAllActivosConVehiculo();
      const choferesDisplay = choferesRaw.map(ch => ({
        id: ch.chofer_id,
        display_name: `${ch.vehiculo_placa} - ${ch.vehiculo_modelo} - ${ch.chofer_nombre} ${ch.chofer_apellido}`
      }));
      const clientesDisplay = clientes.map(cl => ({
        id: cl.id,
        display_name: `${cl.dni} - ${cl.nombre} ${cl.apellido}`
      }));

      res.render('reservas/edit', {
        reserva: { ...req.body, id_reserva: id }, // Use submitted data for repopulation
        clientes: clientesDisplay,
        choferes: choferesDisplay,
        error: 'Error al actualizar la reserva. Verifique los datos e inténtelo de nuevo.'
      });
    }
  },

  // Get available choferes based on date and time
  getChoferesDisponibles: async (req, res) => {
    try {
      const { fecha, hora_inicio, hora_fin, reserva_id_actual } = req.query;

      if (!fecha || !hora_inicio || !hora_fin) {
        return res.status(400).json({ error: 'Fecha, hora de inicio y hora de fin son requeridas.' });
      }

      // Validar que hora_fin sea posterior a hora_inicio (también en backend)
      if (hora_fin <= hora_inicio) {
        return res.status(400).json({ error: 'Hora de fin debe ser posterior a hora de inicio.' });
      }

      // El modelo Chofer necesita ser importado si no lo está ya.
      // Asumiendo que Chofer model tiene el método findAvailable
      const choferesDisponiblesRaw = await Chofer.findAvailable(fecha, hora_inicio, hora_fin, reserva_id_actual);

      // Formatear para el display_name que espera el frontend
      const choferesDisplay = choferesDisponiblesRaw.map(ch => ({
        id: ch.chofer_id, // Asegurarse que el ID sea el correcto (chofer_id o id)
        display_name: `${ch.vehiculo_placa || 'N/A'} - ${ch.vehiculo_modelo || 'N/A'} - ${ch.chofer_nombre} ${ch.chofer_apellido}`
      }));

      res.json({ choferes: choferesDisplay });

    } catch (error) {
      console.error("Error fetching available choferes:", error);
      res.status(500).json({ error: 'Error al obtener los choferes disponibles.' });
    }
  },

  rechazarYReasignarReserva: async (req, res) => {
    const { id } = req.params; // ID de la reserva
    let originalChoferId;

    try {
      const reserva = await Reserva.getById(id);

      if (!reserva) {
        // req.flash('error', 'Reserva no encontrada.'); // Asumiendo que usas connect-flash
        return res.redirect('back'); // O una ruta específica de error
      }
      originalChoferId = reserva.id_chofer;

      if (reserva.estado_reserva !== 'espera') {
        // req.flash('error', 'Solo se pueden rechazar reservas en estado de espera.');
        return res.redirect(`/reservas/chofer/${originalChoferId}`);
      }

      // Encontrar un nuevo chofer disponible, excluyendo el actual
      const choferesDisponibles = await Chofer.findAvailable(
        reserva.fecha, // Asegúrate que el formato de fecha sea el esperado por findAvailable
        reserva.hora_inicio,
        reserva.hora_fin,
        reserva.id_reserva, // Para excluir esta misma reserva de los chequeos de conflicto del *nuevo* chofer
        [originalChoferId] // Array de choferes a excluir (el que rechaza)
      );

      if (choferesDisponibles && choferesDisponibles.length > 0) {
        const nuevoChofer = choferesDisponibles[0]; // Tomar el primer chofer disponible
        await Reserva.update(id, {
          ...reserva, // Mantener los datos existentes de la reserva
          cliente_id: reserva.id_cliente, // Asegurar que se pasan todos los campos necesarios para el update
          chofer_id: nuevoChofer.chofer_id, // Asignar el nuevo chofer
          estado: 'espera', // Mantener en espera para el nuevo chofer (o un nuevo estado 'reasignada')
          // Asegurar que los campos de fecha y hora se pasen correctamente si el método update los requiere
          // y no están ya en 'reserva' en el formato adecuado.
          fecha: reserva.fecha.toISOString().split('T')[0], // Formatear fecha si es necesario
          hora_inicio: reserva.hora_inicio,
          hora_fin: reserva.hora_fin,
          origen: reserva.origen,
          destino: reserva.destino,
          tarifa: reserva.tarifa,
          tipo_pago: reserva.tipo_pago
        });
        // req.flash('success', `Reserva ${id} rechazada y reasignada al chofer ${nuevoChofer.chofer_nombre}.`);
      } else {
        // No hay choferes disponibles, cambiar estado a 'requiere_atencion_manual' o similar
        await Reserva.update(id, {
          ...reserva, // Mantener los datos existentes
          cliente_id: reserva.id_cliente,
          chofer_id: reserva.id_chofer, // Podría mantenerse el chofer original o ponerse a null
          estado: 'sin_chofer_disponible', // Nuevo estado
          fecha: reserva.fecha.toISOString().split('T')[0],
          hora_inicio: reserva.hora_inicio,
          hora_fin: reserva.hora_fin,
          origen: reserva.origen,
          destino: reserva.destino,
          tarifa: reserva.tarifa,
          tipo_pago: reserva.tipo_pago
        });
        // req.flash('warning', `Reserva ${id} rechazada. No se encontraron choferes para reasignar. Requiere atención manual.`);
        // Aquí se podría enviar una notificación a un admin.
      }

      res.redirect(`/reservas/chofer/${originalChoferId}`); // Redirigir al dashboard del chofer que rechazó

    } catch (error) {
      console.error(`Error al rechazar y reasignar reserva ${id}:`, error);
      // req.flash('error', 'Ocurrió un error al procesar el rechazo de la reserva.');
      if (originalChoferId) {
        res.redirect(`/reservas/chofer/${originalChoferId}`);
      } else {
        res.redirect('/dashboard'); // O alguna otra página por defecto
      }
    }
  }
  // Add other reservation-related functions here
};
