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
      // tarifa, // La tarifa ya no se toma directamente del body, se recalcula.
      tipo_pago,
      distancia_km
    } = req.body;

    // Validación: La tarifa ya no se valida aquí porque se calcula en el backend.
    // Se valida que los campos principales estén presentes.
    if (!cliente_id || !chofer_id || !fecha || !hora_inicio || !hora_fin || !origen || !destino || !tipo_pago) {
      const clientes = await Cliente.getAllActivos();
      const clientesDisplay = clientes.map(cl => ({
        id: cl.id,
        display_name: `${cl.dni} - ${cl.nombre} ${cl.apellido}`
      }));
      // No es necesario cargar choferesDisplay aquí ya que se cargan dinámicamente en el frontend.

      return res.render('reservas/create', {
        clientes: clientesDisplay,
        choferes: [], // El frontend se encarga de esto
        error: 'Todos los campos marcados con * son obligatorios (excepto tarifa que es automática).',
        oldInput: req.body
      });
    }

    // Calcular tarifa en el backend de forma segura
    const tarifaBase = 5;
    const costoPorKm = 2;
    let distanciaNumericaValidada = distancia_km ? parseFloat(distancia_km) : 0;
    if (isNaN(distanciaNumericaValidada) || distanciaNumericaValidada < 0) {
        distanciaNumericaValidada = 0; // Asegurar que la distancia sea válida para el cálculo
    }
    const tarifaCalculada = tarifaBase + (costoPorKm * distanciaNumericaValidada);

    // Prepare data for Reserva.create
    const reservaData = {
      cliente_id: parseInt(cliente_id),
      chofer_id: parseInt(chofer_id),
      fecha,
      hora_inicio: hora_inicio,
      hora_fin: hora_fin,
      origen: origen,
      destino: destino,
      tarifa: parseFloat(tarifaCalculada.toFixed(2)), // Usar la tarifa calculada en el backend
      tipo_pago,
      distancia_km: distanciaNumericaValidada // Usar la distancia ya validada y parseada, puede ser 0
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
    // Similar al bloque de validación, no es estrictamente necesario recargar choferes
    // si el frontend los maneja dinámicamente.
    const clientesDisplay = clientes.map(cl => ({
        id: cl.id,
        display_name: `${cl.dni} - ${cl.nombre} ${cl.apellido}`
      }));

    res.render('reservas/create', {
      clientes: clientesDisplay,
      choferes: [], // Pasar array vacío, el frontend se encarga de buscar disponibles
      error: 'Error al guardar la reserva. Inténtelo de nuevo.',
      oldInput: req.body
    });
  }
};


// Function to get all reservations
const getAllReservations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Nuevos parámetros para filtro y orden
    const estado = req.query.estado || ''; // '' o null para 'todos'
    const sortBy = req.query.sortBy || 'fecha'; // Columna por defecto para ordenar
    const sortOrder = req.query.sortOrder || 'desc'; // Orden por defecto

    const result = await Reserva.getAllPaginated(limit, offset, estado, sortBy, sortOrder);
    const reservations = result.rows;
    const totalItems = result.totalItems;
    const totalPages = Math.ceil(totalItems / limit);

    res.render('reservas/index', {
      reservations,
      error: null,
      currentPage: page,
      totalPages,
      totalItems,
      currentEstado: estado, // Pasar el estado actual a la vista
      currentSortBy: sortBy,
      currentSortOrder: sortOrder,
      queryParams: req.query // Para ayudar a construir enlaces en la vista
    });
  } catch (error) {
    console.error("Error fetching all reservations in controller:", error);
    res.render('reservas/index', {
      reservations: [],
      error: 'Error fetching reservations',
      currentPage: 1,
      totalPages: 0,
      totalItems: 0
    });
  }
};

// Function to get reservations by cliente_id
const getReservationsByCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const estado = req.query.estado || '';
    const sortBy = req.query.sortBy || 'fecha';
    const sortOrder = req.query.sortOrder || 'desc';

    const result = await Reserva.getByClienteIdPaginated(cliente_id, limit, offset, estado, sortBy, sortOrder);
    const reservations = result.rows;
    const totalItems = result.totalItems;
    const totalPages = Math.ceil(totalItems / limit);

    // Para obtener el nombre del cliente para el título de la página, si es necesario
    // Esto podría hacerse de forma más eficiente, quizás el modelo ya lo devuelve o se hace una pequeña consulta adicional.
    // Por ahora, si las reservas devuelven el nombre del cliente, se puede tomar de la primera.
    const clienteNombre = reservations.length > 0 ? `${reservations[0].nombre_cliente} ${reservations[0].apellido_cliente}` : 'Cliente';


    res.render('reservas/cliente', {
      reservations,
      error: reservations.length === 0 && page === 1 ? 'No reservations found for this client' : null,
      currentPage: page,
      totalPages,
      totalItems,
      clienteId: cliente_id,
      clienteNombre,
      currentEstado: estado,
      currentSortBy: sortBy,
      currentSortOrder: sortOrder,
      queryParams: req.query
    });
  } catch (error) {
    console.error(`Error fetching reservations for client ${req.params.cliente_id} in controller:`, error);
    res.render('reservas/cliente', {
      reservations: [],
      error: 'Error fetching reservations for this client',
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      clienteId: req.params.cliente_id,
      clienteNombre: 'Cliente'
    });
  }
};

// Function to get reservations by chofer_id
const getReservationsByChofer = async (req, res) => {
  try {
    const { chofer_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const estado = req.query.estado || '';
    const sortBy = req.query.sortBy || 'fecha';
    const sortOrder = req.query.sortOrder || 'desc';

    const result = await Reserva.getByChoferIdPaginated(chofer_id, limit, offset, estado, sortBy, sortOrder);
    const reservations = result.rows;
    const totalItems = result.totalItems;
    const totalPages = Math.ceil(totalItems / limit);

    const choferNombre = reservations.length > 0 ? `${reservations[0].nombre_chofer} ${reservations[0].apellido_chofer}` : 'Chofer';

    res.render('reservas/chofer', {
      reservations,
      error: reservations.length === 0 && page === 1 ? 'No reservations found for this chofer' : null,
      currentPage: page,
      totalPages,
      totalItems,
      choferId: chofer_id,
      choferNombre,
      currentEstado: estado,
      currentSortBy: sortBy,
      currentSortOrder: sortOrder,
      queryParams: req.query
    });
  } catch (error) {
    console.error(`Error fetching reservations for chofer ${req.params.chofer_id} in controller:`, error);
    res.render('reservas/chofer', {
      reservations: [],
      error: 'Error fetching reservations for this chofer',
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      choferId: req.params.chofer_id,
      choferNombre: 'Chofer'
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
        // tarifa, // Tarifa se recalcula en backend
        tipo_pago,
        estado,
        distancia_km
      } = req.body;

      // Validación similar a createReservation, excluyendo tarifa.
      if (!cliente_id || !chofer_id || !fecha || !origen || !destino || !tipo_pago || !estado) {
        // Re-renderizar el formulario de edición con errores.
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
            error: 'Todos los campos marcados con * son obligatorios (excepto tarifa que es automática).'
        });
      }

      // Calcular tarifa en el backend de forma segura
      const tarifaBase = 5;
      const costoPorKm = 2;
      let distanciaNumericaUpdate = distancia_km ? parseFloat(distancia_km) : 0;
      if (isNaN(distanciaNumericaUpdate) || distanciaNumericaUpdate < 0) {
          distanciaNumericaUpdate = 0; // Asegurar que la distancia sea válida
      }
      const tarifaCalculadaUpdate = tarifaBase + (costoPorKm * distanciaNumericaUpdate);

      const reservaData = {
        cliente_id: parseInt(cliente_id),
        chofer_id: parseInt(chofer_id),
        fecha,
        hora_inicio: hora_inicio, // Asumir que son obligatorios si llegan aquí
        hora_fin: hora_fin,
        origen: origen,
        destino: destino,
        tarifa: parseFloat(tarifaCalculadaUpdate.toFixed(2)), // Usar tarifa calculada en backend
        tipo_pago,
        estado,
        distancia_km: distanciaNumericaUpdate // Usar la distancia ya validada y parseada
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
