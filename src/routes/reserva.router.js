// src/routes/reserva.router.js
const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reserva.controller');

// Define reservation routes

// GET /reservas - Get all reservations (admin/general view)
router.get('/reservas', reservaController.getAllReservations);

// GET /reservas/cliente/:cliente_id - Get reservations for a specific client
router.get('/reservas/cliente/:cliente_id', reservaController.getReservationsByCliente);

// GET /reservas/chofer/:chofer_id - Get reservations for a specific driver
router.get('/reservas/chofer/:chofer_id', reservaController.getReservationsByChofer);

// GET /reservas/:id - Get a single reservation by ID
router.get('/reservas/:id', reservaController.getReservationById);

module.exports = router;
