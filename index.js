require("dotenv").config();

const express = require("express");
const app = express();
const layouts = require('express-ejs-layouts');
const path = require("path");
const methodOverride = require("method-override")
const pool = require(path.join (__dirname,"src/models/pg.js"))
const session = require('express-session');
const requireLogin = require('./src/middleware/auth.middleware');

app.use(session({secret: process.env.SECRETAUTH,resave: false,saveUninitialized: false}));
app.use(methodOverride("_method"))
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,"public")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "src/views"));
app.use(layouts);
app.set('layout', 'layouts/layout');

app.use("/sessions", require("./src/routes/session.router"));
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use(requireLogin);
app.use('/dashboard', require('./src/routes/dashboard.router'));
app.use(require("./src/routes/main.router"));
app.use("/admins", require("./src/routes/admin.router"));
app.use("/choferes", require("./src/routes/chofer.router"));
app.use("/clientes", require("./src/routes/cliente.router"));
app.use('/gerentes', require('./src/routes/gerente.router'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});

