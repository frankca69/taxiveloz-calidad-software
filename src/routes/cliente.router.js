const express = require("express");
const router = express.Router();
const controller = require("../controllers/cliente.controller")
const { tieneRol } = require('../middleware/roles.middleware');

router.get("/create",tieneRol('admin', 'gerente'), controller.create)
router.post('/',tieneRol('admin', 'gerente'), controller.store)

router.get('/',tieneRol('admin', 'gerente'), controller.index)
router.get('/:id',tieneRol('admin', 'gerente'), controller.show)

router.get('/:id/edit',tieneRol('admin', 'gerente'), controller.edit) // Admin/Gerente edita cliente
router.put('/:id',tieneRol('admin', 'gerente'), controller.update) // Admin/Gerente actualiza cliente

router.delete('/:id',tieneRol('admin', 'gerente'), controller.destroy)

// Rutas para que el propio cliente edite su cuenta
router.get('/profile/:id/edit', tieneRol('cliente'), controller.editProfileForm);
router.put('/profile/:id', tieneRol('cliente'), controller.updateProfile);

module.exports =router;
