//Frank
const path = require("path")

const index = (req, res) => {
  const user = req.session?.user;

  if (user) {
    // Redirigir según el rol del usuario
    switch (user.role) {
      case 'cliente':
        return res.redirect('/dashboard/cliente');
      case 'chofer':
        return res.redirect('/dashboard/chofer');
      case 'gerente':
        return res.redirect('/dashboard/gerente');
      case 'admin':
        return res.redirect('/dashboard/admin');
      default:
        return res.redirect('/dashboard');
    }
  }

  // Si no está logueado, renderiza la vista pública
  res.render("index");
};

const private =  (req, res) => {
    res.sendFile(path.resolve(__dirname,"../../private/index.html"));
}

module.exports = {
    index,
    private,
}