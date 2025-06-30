//Frank
const model = require('../models/Admin');

const index = async (req, res) => {
  const estado = req.query.estado || 'activo';
  const admins = await model.getAll(estado);
  res.render('admins/index', { admins, estado });
};

const create = async (req, res) => {
  res.render('admins/create', { error: null });
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
    await model.createAdmin({ userId, nombre, apellido, dni: finalDni, telefono: finalTelefono, email });
    res.redirect('/admins');
  } catch (error) {
    console.error("Error al crear admin:", error);
    res.status(500).render('admins/create', { error: 'Error al registrar administrador', formData: req.body });
  }
};

const show = async (req, res) => {
  const admin = await model.getById(req.params.id);
  if (!admin) return res.status(404).send("No encontrado");
  res.render('admins/show', { admin });
};

const edit = async (req, res) => {
  const admin = await model.getById(req.params.id);
  if (!admin) return res.status(404).send("No encontrado");
  res.render('admins/edit', { admin });
};

const update = async (req, res) => {
  const { nombre, apellido, dni, telefono, email } = req.body;
  const adminId = req.params.id;

  // Basic trimming
  const finalDni = dni ? String(dni).trim() : '';
  const finalTelefono = telefono ? String(telefono).trim() : '';

  // REMOVED DNI Validation block
  // REMOVED Telefono Validation block

  await model.updateAdmin(adminId, { nombre, apellido, dni: finalDni, telefono: finalTelefono, email });
  res.redirect('/admins');
};

const changeEstado = async (req, res) => {
  await model.changeEstado(req.params.id, req.body.estado);
  res.redirect('/admins');
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
    // Verifica que el usuario logueado es el mismo que el perfil que se quiere editar
    if (req.user.profile_id !== parseInt(req.params.id)) {
      req.flash('error_msg', 'No autorizado');
      return res.redirect('/dashboard');
    }
    try {
      const admin = await model.getById(req.params.id);
      if (!admin) {
        req.flash('error_msg', 'Administrador no encontrado.');
        return res.redirect('/dashboard');
      }
      // Asume que tienes una vista 'admins/editProfile.ejs' o similar
      res.render('admins/editProfile', { admin, error: null, success_msg: '', error_msg: '' });
    } catch (error) {
      console.error("Error al cargar perfil de admin:", error);
      req.flash('error_msg', 'Error al cargar perfil.');
      res.redirect('/dashboard');
    }
  },
  updateProfile: async (req, res) => {
    // Verifica que el usuario logueado es el mismo que el perfil que se quiere actualizar
    if (req.user.profile_id !== parseInt(req.params.id)) {
      req.flash('error_msg', 'No autorizado');
      return res.redirect('/dashboard');
    }
    const adminId = req.params.id;
    const { nombre, apellido, dni, telefono, email, password, current_password } = req.body;

    // Basic trimming
    const finalDni = dni ? String(dni).trim() : '';
    const finalTelefono = telefono ? String(telefono).trim() : '';

    try {
      // Si se proporciona una nueva contraseña, verificar la actual y actualizarla
      if (password) {
        if (!current_password) {
          req.flash('error_msg', 'Debe proporcionar la contraseña actual para cambiarla.');
          // Volver a renderizar el formulario con los datos y el error
          const admin = await model.getById(adminId);
          return res.render('admins/editProfile', { admin, error: 'Debe proporcionar la contraseña actual para cambiarla.', formData: req.body, success_msg: '', error_msg: 'Debe proporcionar la contraseña actual para cambiarla.' });
        }
        // El modelo debe tener un método para verificar la contraseña actual y actualizarla
        const passwordUpdated = await model.updatePassword(adminId, current_password, password);
        if (!passwordUpdated) {
          req.flash('error_msg', 'La contraseña actual es incorrecta.');
          const admin = await model.getById(adminId);
          return res.render('admins/editProfile', { admin, error: 'La contraseña actual es incorrecta.', formData: req.body, success_msg: '', error_msg: 'La contraseña actual es incorrecta.' });
        }
      }

      // Actualizar otros datos del perfil
      await model.updateAdmin(adminId, { nombre, apellido, dni: finalDni, telefono: finalTelefono, email });

      req.flash('success_msg', 'Perfil actualizado correctamente.');
      res.redirect('/dashboard');
    } catch (error) {
      console.error("Error al actualizar perfil de admin:", error);
      req.flash('error_msg', 'Error al actualizar el perfil.');
      // Volver a renderizar el formulario con los datos y el error
      const admin = await model.getById(adminId);
      res.render('admins/editProfile', { admin, error: 'Error al actualizar el perfil.', formData: req.body, success_msg: '', error_msg: 'Error al actualizar el perfil.' });
    }
  }
};
