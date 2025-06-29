// src/routes/reserva.router.js
const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reserva.controller');
const { tieneRol } = require('../middleware/roles.middleware'); // Importar el middleware de roles

// Define reservation routes

// GET /reservas - Get all reservations (admin/general view)
// Asumiendo que todos los roles autenticados pueden ver todas las reservas. Ajustar si es necesario.
router.get('/reservas', tieneRol('admin', 'gerente'), reservaController.getAllReservations);

// GET /reservas/create - Show form to create a new reservation (solo admin y gerente)
router.get('/reservas/create', tieneRol('admin', 'gerente'), reservaController.showCreateForm);

// POST /reservas - Create a new reservation (solo admin y gerente)
router.post('/reservas', tieneRol('admin', 'gerente'), reservaController.createReservation);

// GET /reservas/cliente/:cliente_id - Get reservations for a specific client
// Asumiendo que un cliente puede ver sus propias reservas, y admin/gerente pueden verlas también.
// El control específico de si el cliente_id coincide con el usuario logueado debería estar en el controlador o un middleware más específico.
// Por ahora, si solo admin/gerente pueden acceder a esta vista genérica por ID de cliente:
// router.get('/reservas/cliente/:cliente_id', tieneRol('admin', 'gerente'), reservaController.getReservationsByCliente);
// Si los clientes también pueden, se necesitaría una lógica más compleja o rutas separadas (ej. /mis-reservas)
// Dejamos esta ruta sin restricción de rol por ahora, asumiendo que la lógica de autorización está o estará en el controlador si es necesario.
router.get('/reservas/cliente/:cliente_id', tieneRol('cliente'), reservaController.getReservationsByCliente);

// GET /reservas/chofer/:chofer_id - Get reservations for a specific driver
router.get('/reservas/chofer/:chofer_id', tieneRol('chofer'), reservaController.getReservationsByChofer);

// GET /reservas/:id - Get a single reservation by ID
router.get('/reservas/:id', reservaController.getReservationById);

// POST /reservas/:id/confirmar - Confirm a reservation
// Asumiendo que el chofer o un admin/gerente puede confirmar.
// Si se necesita una lógica de autorización más fina (ej. solo el chofer asignado),
// se debería añadir un middleware o lógica en el controlador.
// Por ahora, usamos tieneRol para admin/gerente, pero un chofer también debería poder.
// Esto podría requerir un nuevo tipo de rol o lógica de autorización personalizada.
// Para simplificar, si la acción es principalmente para el chofer, y el chofer_id se usa para redirigir,
// podríamos no poner tieneRol aquí y manejar la autorización en el controlador o asumir que solo el chofer logueado ve el botón.
// O, si los choferes tienen un rol 'chofer': tieneRol('admin', 'gerente', 'chofer')
router.post('/reservas/:id/confirmar', reservaController.confirmarReserva);

// POST /reservas/:id/finalizar - Finalize a reservation
// Misma consideración de roles que para confirmar.
router.post('/reservas/:id/finalizar', reservaController.finalizarReserva);

// POST /reservas/:id/notificar - Mark a reservation as notified
// Solo admin y gerente pueden notificar.
router.post('/reservas/:id/notificar', tieneRol('admin', 'gerente'), reservaController.notificarReserva);

// POST /reservas/:id/eliminar - Mark a reservation as eliminated (soft delete)
// Solo admin y gerente pueden eliminar.
router.post('/reservas/:id/eliminar', tieneRol('admin', 'gerente'), reservaController.eliminarReserva);

// GET /reservas/edit/:id - Show form to edit a reservation
router.get('/reservas/edit/:id', tieneRol('admin', 'gerente'), reservaController.showEditForm);

// POST /reservas/edit/:id - Update a reservation
router.post('/reservas/edit/:id', tieneRol('admin', 'gerente'), reservaController.updateReservation);

// POST /reservas/:id/rechazar - Chofer rejects a reservation, attempt to reassign
// Se asume que el chofer logueado es quien puede rechazar su propia reserva.
// La autorización específica (que el chofer_id de la reserva coincida con el user.chofer_id logueado)
// debería manejarse dentro del controlador o con un middleware más específico si es necesario.
// Por ahora, se deja sin `tieneRol` asumiendo que la interfaz solo muestra el botón al chofer correcto.
router.post('/reservas/:id/rechazar', reservaController.rechazarYReasignarReserva);

module.exports = router;
