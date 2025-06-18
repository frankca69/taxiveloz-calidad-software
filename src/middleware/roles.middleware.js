//Frank
function tieneRol(...rolesPermitidos) {
  return (req, res, next) => {
    const rolUsuario = req.session?.user?.role;
    if (rolesPermitidos.includes(rolUsuario)) {
      return next();
    }
    return res.status(403).send('Acceso denegado');
  };
}

module.exports = {
  tieneRol,
};
