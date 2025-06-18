const express = require('express');
const router = express.Router();
const controller = require('../controllers/chofer.controller');
const { tieneRol } = require('../middleware/roles.middleware');

router.use(tieneRol('gerente'));

router.get('/', controller.index);
router.get('/create', controller.create);
router.post('/', controller.store);
router.get('/:id', controller.show); // Nuevo
router.get('/:id/edit', controller.edit);
router.put('/:id', controller.update);
router.put('/:id/estado', controller.updateEstado); // Nuevo
router.delete('/:id', controller.destroy);

module.exports = router;
