const express = require('express');
const router = express.Router();
const controller = require('../controllers/vehiculo.controller');
const { isAuthenticated } = require('../middleware/auth.middleware'); // Assuming you have this
const { tieneRol } = require('../middleware/roles.middleware');

// All vehicle routes require the user to be an authenticated 'chofer'
router.use(isAuthenticated, tieneRol('chofer'));

// GET /vehiculos - Show vehicle management page (display vehicle or add form)
router.get('/', controller.showVehiculo);

// POST /vehiculos - Add a new vehicle
router.post('/', controller.storeVehiculo);

// POST /vehiculos/:id/estado - Update vehicle state
router.post('/:id/estado', controller.updateEstado);

// POST /vehiculos/:id/eliminar - Delete a vehicle
// Using POST for deletion as it's done via a form submission. Could also be DELETE if using client-side JS for requests.
router.post('/:id/eliminar', controller.destroyVehiculo);

module.exports = router;
