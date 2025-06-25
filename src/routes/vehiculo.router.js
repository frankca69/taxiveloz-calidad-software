const express = require('express');
const router = express.Router();
const controller = require('../controllers/vehiculo.controller');
const { tieneRol } = require('../middleware/roles.middleware');

// Nueva ruta para mostrar todos los vehículos (accesible por admin y gerente)
// Esta ruta debe ir ANTES de las rutas que usan `router.use` para aplicar middleware específico de chofer
// o ajustar el middleware general si es necesario.
router.get('/all', tieneRol('admin', 'gerente'), controller.showAllVehiculos);

// Middleware para rutas específicas de choferes
// Aplicar isAuthenticated y tieneRol('chofer') solo a las rutas que lo necesiten explícitamente
// o agruparlas después de este middleware.

// Rutas para que un chofer gestione SU vehículo
router.get('/', tieneRol('chofer'), controller.showVehiculo);
router.post('/', tieneRol('chofer'), controller.storeVehiculo);
router.post('/:id/estado', tieneRol('chofer'), controller.updateEstado);
router.post('/:id/eliminar', tieneRol('chofer'), controller.destroyVehiculo);

module.exports = router;
