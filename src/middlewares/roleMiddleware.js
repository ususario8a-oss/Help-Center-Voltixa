const roleMiddleware = (...rolesPermitidos) => {
  return (req, res, next) => {
    const userRole = req.user?.rol;

    if (!userRole) {
      return res.status(403).json({
        error: 'Rol no definido en el token'
      });
    }

    if (!rolesPermitidos.includes(userRole)) {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    next();
  };
};

const soloAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  next();
};

module.exports = {
  roleMiddleware,
  soloAdmin
};