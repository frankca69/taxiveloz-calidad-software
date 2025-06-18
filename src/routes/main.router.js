const express = require("express");
const router = express.Router();
const controller = require("../controllers/main.controller")

router.get('/', controller.index);

router.get('/private', controller.private)

module.exports =router;
