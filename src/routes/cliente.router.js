const express = require("express");
const router = express.Router();
const controller = require("../controllers/cliente.controller")
const { tieneRol } = require('../middleware/roles.middleware');

router.get("/create",tieneRol('admin', 'gerente'), controller.create)
router.post('/',tieneRol('admin', 'gerente'), controller.store)

router.get('/',tieneRol('admin', 'gerente'), controller.index)
router.get('/:id',tieneRol('admin', 'gerente'), controller.show)

router.get('/:id/edit',tieneRol('admin', 'gerente'), controller.edit)
router.put('/:id',tieneRol('admin', 'gerente'), controller.update)

router.delete('/:id',tieneRol('admin', 'gerente'), controller.destroy)

module.exports =router;
