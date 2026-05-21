const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validaciones
    if (!email || !password) {
      const error = new Error('Email y contraseña son obligatorios');
      error.status = 400;
      throw error;
    }

    const query = 'SELECT * FROM usuarios WHERE email = ?';

    db.query(query, [email], async (err, results) => {
      if (err) return next(err);

      if (results.length === 0) {
        const error = new Error('Credenciales inválidas');
        error.status = 401;
        return next(error);
      }

      const usuario = results[0];

      const passwordValida = await bcrypt.compare(password, usuario.password);

      if (!passwordValida) {
        const error = new Error('Credenciales inválidas');
        error.status = 401;
        return next(error);
      }

      const token = jwt.sign(
        { id: usuario.id_usuario, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
      );

      res.json({
        message: 'Login exitoso',
        token
      });
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { login };