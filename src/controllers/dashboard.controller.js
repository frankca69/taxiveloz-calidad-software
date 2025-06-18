//Frank
const redirectByRole = (req, res) => {
  const role = req.session.user?.role;

  if (!role) return res.redirect('/sessions');

  switch (role) {
    case 'cliente':
      return res.redirect('/dashboard/cliente');
    case 'chofer':
      return res.redirect('/dashboard/chofer');
    case 'gerente':
      return res.redirect('/dashboard/gerente');
    case 'admin':
      return res.redirect('/dashboard/admin');
    default:
      return res.redirect('/');
  }
};

const cliente = (req, res) => {
  res.render('dashboard/cliente', { user: req.session.user, showHeader: false, showFooter: false });
};

const chofer = (req, res) => {
  res.render('dashboard/chofer', { user: req.session.user, showHeader: false, showFooter: false });
};

const gerente = (req, res) => {
  res.render('dashboard/gerente', { user: req.session.user, showHeader: false, showFooter: false });
};

const admin = (req, res) => {
  res.render('dashboard/admin', { user: req.session.user, showHeader: false, showFooter: false });
};

module.exports = {
  redirectByRole,
  cliente,
  chofer,
  gerente,
  admin,
};
