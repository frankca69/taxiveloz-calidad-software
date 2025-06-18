const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const { tieneRol } = require('../middleware/roles.middleware');

router.get('/', controller.redirectByRole);

router.get('/cliente',tieneRol('cliente') , controller.cliente);
router.get('/chofer',tieneRol('chofer') , controller.chofer);
router.get('/gerente',tieneRol('gerente') , controller.gerente);
router.get('/admin',tieneRol('admin') , controller.admin);

module.exports = router;

