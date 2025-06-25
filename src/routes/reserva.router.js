// src/routes/reserva.router.js
const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reserva.controller');
const { tieneRol } = require('../middleware/roles.middleware'); // Importar el middleware de roles

// Define reservation routes

// GET /reservas - Get all reservations (admin/general view)
// Asumiendo que todos los roles autenticados pueden ver todas las reservas. Ajustar si es necesario.
router.get('/reservas', reservaController.getAllReservations);

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
router.get('/reservas/cliente/:cliente_id', reservaController.getReservationsByCliente);

// GET /reservas/chofer/:chofer_id - Get reservations for a specific driver
router.get('/reservas/chofer/:chofer_id', reservaController.getReservationsByChofer);

// GET /reservas/:id - Get a single reservation by ID
router.get('/reservas/:id', reservaController.getReservationById);

module.exports = router;
