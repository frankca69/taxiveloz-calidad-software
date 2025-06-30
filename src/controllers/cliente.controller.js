//Frank
const model = require("../models/Cliente")

const create = (req, res) => {
    res.render('clientes/create');
};

const store = async (req, res) => {
  const { nombre, apellido, dni, telefono, correo } = req.body;
  const { redirect_url } = req.query; // Obtener redirect_url de los query params

  // Basic trimming (optional, but good practice)
  const finalDni = dni ? String(dni).trim() : '';
  const finalTelefono = telefono ? String(telefono).trim() : '';

  // REMOVED DNI Validation block:
  // if (!finalDni || finalDni.length !== 8) { ... }

  // REMOVED Telefono Validation block:
  // if (finalTelefono && finalTelefono.length !== 9) { ... }

  try {
    // Note: DNI existence check might still be relevant depending on requirements
    // For now, keeping it as it's a data integrity check, not a format validation.
    const dniExiste = await model.existsDNI(finalDni);

    if (dniExiste) {
      return res.render("clientes/create", {
        error: "El DNI ya está registrado.", // This is a uniqueness constraint, not format.
        formData: req.body
      });
    }

    await model.store({ nombre, apellido, dni: finalDni, telefono: finalTelefono, correo });

    // Redirección condicional
    if (redirect_url) {
      // Por seguridad, podrías validar que redirect_url sea a una ruta permitida en tu aplicación.
      // Por ahora, simplemente redirigimos si existe.
      // Ejemplo de validación simple: if (redirect_url === '/reservas/create') { ... }
      return res.redirect(redirect_url);
    } else {
      return res.redirect("/clientes");
    }

  } catch (error) {
    console.error("Error al guardar cliente:", error);
    // Al renderizar error, también pasamos redirect_url para que el formulario lo mantenga si es necesario
    return res.status(500).render("clientes/create", {
        error: "Error al guardar cliente",
        formData: req.body,
        redirect_url: redirect_url // Para que el action del form lo pueda incluir de nuevo si hay error
    });
  }
};

 
const index = async (req, res) => {
    try {
        const clientes = await model.getAll();
        res.render("clientes/index", { clientes });
    } catch (error) {
        res.status(500).send("Error al cargar clientes");
    }
};

const show = async (req, res) => {
    const { id } = req.params;

    try {
        const cliente = await model.getById(id);
        if (!cliente) return res.status(404).send("Cliente no encontrado");
        res.render("clientes/show", { cliente });
    } catch (error) {
        res.status(500).send("Error al cargar cliente");
    }
};


const edit = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await model.getById(id);
    if (!cliente) {
      return res.status(404).send("Cliente no encontrado");
    }

    res.render("clientes/edit", { cliente });
  } catch (error) {
    console.error("Error al cargar cliente:", error);
    res.status(500).send("Error al cargar cliente");
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, telefono, correo } = req.body;

  // Basic trimming
  const finalDni = dni ? String(dni).trim() : '';
  const finalTelefono = telefono ? String(telefono).trim() : '';

  // REMOVED DNI Validation block:
  // if (!finalDni || finalDni.length !== 8) { ... }

  // REMOVED Telefono Validation block:
  // if (finalTelefono && finalTelefono.length !== 9) { ... }

  try {
    await model.updateCliente(id, { nombre, apellido, dni: finalDni, telefono: finalTelefono, correo });
    res.redirect("/clientes");
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    const cliente = await model.getById(id);
    res.status(500).render("clientes/edit", { error: "Error al actualizar cliente", formData: req.body, cliente: cliente });
  }
};

const destroy = async (req, res) => {
  const { id } = req.params;

  try {
    await model.softDelete(id); // 👈 ahora llama al softDelete
    res.redirect("/clientes");
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).send("Error al eliminar cliente");
  }
};

module.exports = {
 index,
 show,
 create,
 store,
 edit,
 update,
 destroy,
  editProfileForm: async (req, res) => {
    // El ID del cliente para editar viene de req.user.profile_id, que debe coincidir con req.params.id
    if (req.user.profile_id !== parseInt(req.params.id)) {
        req.flash('error_msg', 'No autorizado para editar este perfil.');
        return res.redirect('/dashboard');
    }
    try {
        const cliente = await model.getById(req.params.id);
        if (!cliente) {
            req.flash('error_msg', 'Cliente no encontrado.');
            return res.redirect('/dashboard');
        }
        // Asume una vista 'clientes/editProfile.ejs'
        res.render('clientes/editProfile', { cliente, user: req.user, error: null, success_msg: '', error_msg: '' });
    } catch (error) {
        console.error("Error al cargar perfil de cliente:", error);
        req.flash('error_msg', 'Error al cargar el perfil.');
        res.redirect('/dashboard');
    }
  },
  updateProfile: async (req, res) => {
    if (req.user.profile_id !== parseInt(req.params.id)) {
        req.flash('error_msg', 'No autorizado para actualizar este perfil.');
        return res.redirect('/dashboard');
    }
    const clienteId = req.params.id;
    // Los clientes no tienen username/password directamente en la tabla clientes, sino en 'users'
    // Para actualizar contraseña, se necesitaría un método en el modelo Cliente que maneje la actualización en la tabla 'users'
    // Por ahora, solo actualizamos los datos de la tabla 'clientes'
    const { nombre, apellido, dni, telefono, correo, password, current_password } = req.body;

    const finalDni = dni ? String(dni).trim() : '';
    const finalTelefono = telefono ? String(telefono).trim() : '';

    try {
        // Lógica para actualizar contraseña si se proporciona
        if (password) {
            if (!current_password) {
                req.flash('error_msg', 'Debe proporcionar la contraseña actual para cambiarla.');
                const cliente = await model.getById(clienteId);
                return res.render('clientes/editProfile', { cliente, user: req.user, error: 'Debe proporcionar la contraseña actual.', formData: req.body, success_msg: '', error_msg: 'Debe proporcionar la contraseña actual para cambiarla.' });
            }
            // Asumimos que el modelo Cliente tiene un método `updatePassword` que opera sobre la tabla `users`
            // Este método necesitaría el `user_id` asociado al cliente.
            // Si el cliente no tiene user_id directo (ej. si es solo un contacto), esta lógica debe cambiar.
            // Por el momento, asumimos que el modelo Cliente puede encontrar el user_id o que se pasa de alguna forma.
            const clienteData = await model.getById(clienteId); // Para obtener user_id si no está en req.user
            if (!clienteData || !clienteData.user_id) {
                 req.flash('error_msg', 'No se pudo encontrar el usuario asociado para actualizar la contraseña.');
                 return res.redirect('/dashboard');
            }

            const passwordUpdated = await model.updatePassword(clienteData.user_id, current_password, password);
            if (!passwordUpdated) {
                req.flash('error_msg', 'La contraseña actual es incorrecta.');
                const cliente = await model.getById(clienteId);
                return res.render('clientes/editProfile', { cliente, user: req.user, error: 'La contraseña actual es incorrecta.', formData: req.body, success_msg: '', error_msg: 'La contraseña actual es incorrecta.' });
            }
        }

        await model.updateCliente(clienteId, { nombre, apellido, dni: finalDni, telefono: finalTelefono, correo });

        req.flash('success_msg', 'Perfil actualizado correctamente.');
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error al actualizar perfil de cliente:", error);
        req.flash('error_msg', 'Error al actualizar el perfil.');
        const cliente = await model.getById(clienteId); // Recargar datos del cliente
        res.render('clientes/editProfile', { cliente, user: req.user, error: 'Error al actualizar el perfil.', formData: req.body, success_msg: '', error_msg: 'Error al actualizar el perfil.' });
    }
  }
};