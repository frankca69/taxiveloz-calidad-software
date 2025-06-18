//Frank
const model = require('../models/Chofer');

const create = async (req, res) => {
  res.render("choferes/create", { error: null });
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
    await model.createChofer({ userId, nombre, apellido, dni: finalDni, telefono: finalTelefono, email });
    res.redirect('/choferes');
  } catch (error) {
    console.error("Error al crear chofer:", error);
    // Pass formData here as well for consistency, though a generic error is shown
    res.status(500).render('choferes/create', { error: "Error al registrar chofer", formData: req.body });
  }
};

const index = async (req, res) => {
  const estado = req.query.estado || 'activo';
  const choferes = await model.getByEstado(estado);
  res.render('choferes/index', { choferes, estado });
};

const show = async (req, res) => {
  const chofer = await model.getById(req.params.id);
  if (!chofer || chofer.estado === 'eliminado') return res.status(404).send("No encontrado");
  res.render('choferes/show', { chofer });
};

const edit = async (req, res) => {
  const chofer = await model.getById(req.params.id);
  if (!chofer) return res.status(404).send("No encontrado");
  res.render('choferes/edit', { chofer });
};

const update = async (req, res) => {
  const { nombre, apellido, dni, telefono, email } = req.body;
  const choferId = req.params.id;

  // Basic trimming
  const finalDni = dni ? String(dni).trim() : '';
  const finalTelefono = telefono ? String(telefono).trim() : '';

  // REMOVED DNI Validation block
  // REMOVED Telefono Validation block

  await model.updateChofer(choferId, { nombre, apellido, dni: finalDni, telefono: finalTelefono, email });
  res.redirect('/choferes');
};

const updateEstado = async (req, res) => {
  const { estado } = req.body;
  await model.updateEstado(req.params.id, estado);
  res.redirect('/choferes');
};

const destroy = async (req, res) => {
  await model.updateEstado(req.params.id, 'eliminado');
  res.redirect('/choferes');
};

module.exports = {
  create,
  store,
  index,
  show,
  edit,
  update,
  updateEstado,
  destroy,
};