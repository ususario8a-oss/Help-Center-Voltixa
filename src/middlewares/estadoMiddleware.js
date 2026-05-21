// estadoMiddleware.js

// Middleware de validación de estado
const validarEstado = (req, res, next) => {
  const { estado } = req.body;
  const estadosValidos = ['pendiente', 'en_proceso', 'resuelto', 'cerrado'];

  if (!estado) {
    return res.status(400).json({ error: 'El estado es obligatorio' });
  }

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  next();
};

// Exportación correcta
module.exports = validarEstado;