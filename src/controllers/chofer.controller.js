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
  editProfileForm: async (req, res) => {
    if (req.user.profile_id !== parseInt(req.params.id)) {
      req.flash('error_msg', 'No autorizado');
      return res.redirect('/dashboard');
    }
    try {
      const chofer = await model.getById(req.params.id);
      if (!chofer) {
        req.flash('error_msg', 'Chofer no encontrado.');
        return res.redirect('/dashboard');
      }
      res.render('choferes/editProfile', { chofer, error: null, success_msg: '', error_msg: '' });
    } catch (error) {
      console.error("Error al cargar perfil de chofer:", error);
      req.flash('error_msg', 'Error al cargar perfil.');
      res.redirect('/dashboard');
    }
  },
  updateProfile: async (req, res) => {
    if (req.user.profile_id !== parseInt(req.params.id)) {
      req.flash('error_msg', 'No autorizado');
      return res.redirect('/dashboard');
    }
    const choferId = req.params.id;
    const { nombre, apellido, dni, telefono, email, password, current_password } = req.body;

    const finalDni = dni ? String(dni).trim() : '';
    const finalTelefono = telefono ? String(telefono).trim() : '';

    try {
      if (password) {
        if (!current_password) {
          req.flash('error_msg', 'Debe proporcionar la contraseña actual para cambiarla.');
          const chofer = await model.getById(choferId);
          return res.render('choferes/editProfile', { chofer, error: 'Debe proporcionar la contraseña actual para cambiarla.', formData: req.body, success_msg: '', error_msg: 'Debe proporcionar la contraseña actual para cambiarla.' });
        }
        const passwordUpdated = await model.updatePassword(choferId, current_password, password);
        if (!passwordUpdated) {
          req.flash('error_msg', 'La contraseña actual es incorrecta.');
          const chofer = await model.getById(choferId);
          return res.render('choferes/editProfile', { chofer, error: 'La contraseña actual es incorrecta.', formData: req.body, success_msg: '', error_msg: 'La contraseña actual es incorrecta.' });
        }
      }

      await model.updateChofer(choferId, { nombre, apellido, dni: finalDni, telefono: finalTelefono, email });

      req.flash('success_msg', 'Perfil actualizado correctamente.');
      res.redirect('/dashboard');
    } catch (error) {
      console.error("Error al actualizar perfil de chofer:", error);
      req.flash('error_msg', 'Error al actualizar el perfil.');
      const chofer = await model.getById(choferId);
      res.render('choferes/editProfile', { chofer, error: 'Error al actualizar el perfil.', formData: req.body, success_msg: '', error_msg: 'Error al actualizar el perfil.' });
    }
  }
};