const express = require('express');
const router = express.Router();
const controller = require('../controllers/gerente.controller');
const { tieneRol } = require('../middleware/roles.middleware');

router.use(tieneRol('gerente'));

router.get('/', controller.index);
router.get('/create', controller.create);
router.post('/', controller.store);
router.get('/:id', controller.show);
router.get('/:id/edit', controller.edit); // Gerente edita otro gerente (si es permitido)
router.put('/:id', controller.update); // Gerente actualiza otro gerente
router.put('/:id/estado', controller.changeEstado);

// Rutas para que el propio gerente edite su cuenta
router.get('/profile/:id/edit', tieneRol('gerente'), controller.editProfileForm);
router.put('/profile/:id', tieneRol('gerente'), controller.updateProfile);

module.exports = router;

