const express = require('express');
const router = express.Router();
const controller = require('../controllers/chofer.controller');
const { tieneRol } = require('../middleware/roles.middleware');

// Importar el controlador de reservas si aún no está
const reservaController = require('../controllers/reserva.controller'); // Asegúrate que la ruta sea correcta

// Rutas específicas para disponibilidad de choferes (puede no requerir rol de gerente si es para la UI de reserva)
// Se coloca antes de router.use(tieneRol('gerente')) si no requiere esa protección global.
// O, si se quiere proteger, se puede añadir tieneRol individualmente o moverla a reserva.router.js
router.get('/disponibles', reservaController.getChoferesDisponibles);


router.use(tieneRol('gerente'));

router.get('/', controller.index);
router.get('/create', controller.create);
router.post('/', controller.store);
router.get('/:id', controller.show); // Nuevo
router.get('/:id/edit', controller.edit); // Gerente edita chofer
router.put('/:id', controller.update); // Gerente actualiza chofer
router.put('/:id/estado', controller.updateEstado);
router.delete('/:id', controller.destroy);

// Rutas para que el propio chofer edite su cuenta
router.get('/profile/:id/edit', tieneRol('chofer'), controller.editProfileForm);
router.put('/profile/:id', tieneRol('chofer'), controller.updateProfile);

module.exports = router;
