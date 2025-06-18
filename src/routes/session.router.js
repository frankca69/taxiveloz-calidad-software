const express = require('express');
const router = express.Router();
const controller = require('../controllers/session.controller');

router.get('/', controller.index);

router.get("/registerc", controller.registerc)
router.post("/registerc", controller.storec);

router.post('/login', controller.login);
router.post('/logout', controller.logout);

module.exports = router;

