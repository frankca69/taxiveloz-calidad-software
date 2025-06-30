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
  editProfileForm: async (req, res) => {
    if (req.user.profile_id !== parseInt(req.params.id)) {
      req.flash('error_msg', 'No autorizado');
      return res.redirect('/dashboard');
    }
    try {
      const gerente = await model.getById(req.params.id);
      if (!gerente) {
        req.flash('error_msg', 'Gerente no encontrado.');
        return res.redirect('/dashboard');
      }
      res.render('gerentes/editProfile', { gerente, error: null, success_msg: '', error_msg: '' });
    } catch (error) {
      console.error("Error al cargar perfil de gerente:", error);
      req.flash('error_msg', 'Error al cargar perfil.');
      res.redirect('/dashboard');
    }
  },
  updateProfile: async (req, res) => {
    if (req.user.profile_id !== parseInt(req.params.id)) {
      req.flash('error_msg', 'No autorizado');
      return res.redirect('/dashboard');
    }
    const gerenteId = req.params.id;
    const { nombre, apellido, dni, telefono, email, password, current_password } = req.body;

    const finalDni = dni ? String(dni).trim() : '';
    const finalTelefono = telefono ? String(telefono).trim() : '';

    try {
      if (password) {
        if (!current_password) {
          req.flash('error_msg', 'Debe proporcionar la contraseña actual para cambiarla.');
          const gerente = await model.getById(gerenteId);
          return res.render('gerentes/editProfile', { gerente, error: 'Debe proporcionar la contraseña actual para cambiarla.', formData: req.body, success_msg: '', error_msg: 'Debe proporcionar la contraseña actual para cambiarla.' });
        }
        const passwordUpdated = await model.updatePassword(gerenteId, current_password, password);
        if (!passwordUpdated) {
          req.flash('error_msg', 'La contraseña actual es incorrecta.');
          const gerente = await model.getById(gerenteId);
          return res.render('gerentes/editProfile', { gerente, error: 'La contraseña actual es incorrecta.', formData: req.body, success_msg: '', error_msg: 'La contraseña actual es incorrecta.' });
        }
      }

      await model.updateGerente(gerenteId, { nombre, apellido, dni: finalDni, telefono: finalTelefono, email });

      req.flash('success_msg', 'Perfil actualizado correctamente.');
      res.redirect('/dashboard');
    } catch (error) {
      console.error("Error al actualizar perfil de gerente:", error);
      req.flash('error_msg', 'Error al actualizar el perfil.');
      const gerente = await model.getById(gerenteId);
      res.render('gerentes/editProfile', { gerente, error: 'Error al actualizar el perfil.', formData: req.body, success_msg: '', error_msg: 'Error al actualizar el perfil.' });
    }
  }
};
