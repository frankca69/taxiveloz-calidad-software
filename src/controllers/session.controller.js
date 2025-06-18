//Frank
const SessionModel = require('../models/Session');

const index = (req, res) => {
  res.render('sessions/index', { showHeader: false, showFooter: false, error: null });
};

const registerc = (req, res) => {
  res.render('sessions/registerc', { showHeader: false, showFooter: false });
};

const storec = async (req, res) => {
  const { username, password, nombre, apellido, dni, telefono, email } = req.body;

  // Server-side validation for DNI and Telefono format
  if (!dni || !/^\d{8}$/.test(dni)) { // DNI is required here
    return res.render('sessions/registerc', {
      showHeader: false,
      showFooter: false,
      error: 'El DNI debe tener 8 dígitos numéricos.',
      formData: req.body
    });
  }
  // Telefono is optional, validate only if present
  if (telefono && telefono.trim() !== '' && !/^\d{9}$/.test(telefono)) {
    return res.render('sessions/registerc', {
      showHeader: false,
      showFooter: false,
      error: 'El Teléfono debe tener 9 dígitos numéricos.',
      formData: req.body
    });
  }

  try {
    const existingUser = await SessionModel.findUserByUsername(username);
    if (existingUser) {
      return res.render('sessions/registerc', {
        showHeader: false, showFooter: false, error: 'Nombre de usuario ya existe', formData: req.body
      });
    }

    const clienteExistente = await SessionModel.findClienteByDni(dni);

    if (clienteExistente) {
      // Cliente existe por DNI, verificar si tiene user_id
      if (clienteExistente.user_id) {
        return res.render('sessions/registerc', {
          showHeader: false, showFooter: false, error: 'Este DNI ya está registrado con una cuenta', formData: req.body
        });
      }

      // Crear el nuevo usuario
      const userId = await SessionModel.createUser(username, password);

      // Asociar el user al cliente existente y actualizar datos
      await SessionModel.updateClienteWithUser(clienteExistente.id, userId, {
        nombre, apellido, telefono, email
      });

      return res.redirect('/sessions');
    }

    // Si no existe el cliente, crear usuario y cliente nuevo
    const userId = await SessionModel.createUser(username, password);
    await SessionModel.createCliente(userId, nombre, apellido, dni, telefono, email);

    res.redirect('/sessions');
  } catch (err) {
    console.error(err);
    res.render('sessions/registerc', {
      showHeader: false,
      showFooter: false,
      error: 'Error al registrar. Intenta más tarde.',
      formData: req.body
    });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await SessionModel.validateUserCredentials(username, password);
    if (!user) {
      return res.render('sessions/index', {
        error: 'Credenciales inválidas.',
        showHeader: false,
        showFooter: false
      });
    }

    // Guardar datos mínimos en sesión
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    console.log('Usuario en sesión:', req.session.user);
    return res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('sessions/index', {
      error: 'Error al iniciar sesión. Intenta más tarde.',
      showHeader: false,
      showFooter: false
    });
  }
};

const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.send('Error al cerrar sesión');
    }
    res.redirect('/sessions');
  });
};


module.exports = {
  index,
  registerc,
  storec,
  login,
  logout,
};
