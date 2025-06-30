const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');
const { tieneRol } = require('../middleware/roles.middleware');

router.use(tieneRol('gerente'));

router.get('/', controller.index);
router.get('/create', controller.create);
router.post('/', controller.store);
router.get('/:id', controller.show);
router.get('/:id/edit', controller.edit);
router.put('/:id', controller.update);
router.put('/:id/estado', controller.changeEstado);

// Rutas para que el propio admin edite su cuenta
router.get('/profile/:id/edit', tieneRol('admin'), controller.editProfileForm);
router.put('/profile/:id', tieneRol('admin'), controller.updateProfile);

module.exports = router;

