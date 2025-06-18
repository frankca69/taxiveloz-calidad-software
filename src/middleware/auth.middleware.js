//Frank
function requireLogin(req, res, next) {
  
  if (req.path.startsWith('/sessions')) return next();

  if (req.session && req.session.user) {
    return next();
  }

  return res.redirect('/sessions');
}

module.exports = requireLogin;
