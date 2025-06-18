//Frank
const model = require('../models/Gerente');

const index = async (req, res) => {
  const estado = req.query.estado || 'activo';
  const gerentes = await model.getAll(estado);
  res.render('gerentes/index', { gerentes, estado });
};

const create = async (req, res) => {
  res.render('gerentes/create', { error: null });
};

const store = async (req, res) => {
  const { username, password, nombre, apellido, dni, telefono, email } = req.body;

  // Basic trimming
  const finalDni = dni ? String(dni).trim() : '';
  const finalTelefono = telefono ? String(telefono).trim() : '';

  // REMOVED DNI Validation block
  // REMOVED Telefono Validation block

  try {
    const userId = await model.createUser(username, password);
    await model.createGerente({ userId, nombre, apellido, dni: finalDni, telefono: finalTelefono, email });
    res.redirect('/gerentes');
  } catch (error) {
    console.error("Error al crear gerente:", error);
    res.status(500).render('gerentes/create', { error: 'Error al registrar gerente', formData: req.body });
  }
};

const show = async (req, res) => {
  const gerente = await model.getById(req.params.id);
  if (!gerente) return res.status(404).send("No encontrado");
  res.render('gerentes/show', { gerente });
};

const edit = async (req, res) => {
  const gerente = await model.getById(req.params.id);
  if (!gerente) return res.status(404).send("No encontrado");
  res.render('gerentes/edit', { gerente });
};

const update = async (req, res) => {
  const { nombre, apellido, dni, telefono, email } = req.body;
  const gerenteId = req.params.id;

  // Basic trimming
  const finalDni = dni ? String(dni).trim() : '';
  const finalTelefono = telefono ? String(telefono).trim() : '';

  // REMOVED DNI Validation block
  // REMOVED Telefono Validation block

  await model.updateGerente(gerenteId, { nombre, apellido, dni: finalDni, telefono: finalTelefono, email });
  res.redirect('/gerentes');
};

const changeEstado = async (req, res) => {
  await model.changeEstado(req.params.id, req.body.estado);
  res.redirect('/gerentes');
};

module.exports = {
  index,
  create,
  store,
  show,
  edit,
  update,
  changeEstado,
};
