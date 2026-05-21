const db = require('../config/db');
const bcrypt = require('bcrypt');

//  REGISTRAR USUARIO
const registerUser = async (req, res, next) => {
  const { nombre, email, password } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !email || !password) {
      const error = new Error('Todos los campos son obligatorios');
      error.status = 400;
      throw error;
    }

    // Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Email inválido');
      error.status = 400;
      throw error;
    }

    // Validar contraseña
    if (password.length < 6) {
      const error = new Error('La contraseña debe tener al menos 6 caracteres');
      error.status = 400;
      throw error;
    }

    // Verificar si el usuario ya existe
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) return next(err);

      if (results.length > 0) {
        const error = new Error('El usuario ya existe');
        error.status = 400;
        return next(error);
      }

      // Hash de contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar usuario
      const query = `
        INSERT INTO usuarios (nombre, email, password, rol)
        VALUES (?, ?, ?, ?)
      `;

      db.query(query, [nombre, email, hashedPassword, 'usuario'], (err, result) => {
        if (err) return next(err);

        res.status(201).json({
          message: 'Usuario registrado correctamente',
          id: result.insertId
        });
      });
    });

  } catch (error) {
    next(error);
  }
};

//  OBTENER TODOS LOS USUARIOS (SOLO ADMIN)
const getUsers = (req, res, next) => {
  const query = 'SELECT id_usuario AS id, nombre, email, rol FROM usuarios';

  db.query(query, (err, results) => {
    if (err) return next(err);

    res.json(results);
  });
};


// CAMBIAR ROL DE USUARIO
const cambiarRol = (req, res, next) => {

  const { id } = req.params;
  const { rol } = req.body;

  const rolesValidos = ['admin', 'tecnico', 'usuario'];

  // Validar rol
  if (!rolesValidos.includes(rol)) {

    return res.status(400).json({
      error: 'Rol inválido'
    });
  }

  // Actualizar rol
  const query =
    'UPDATE usuarios SET rol = ? WHERE id_usuario = ?';

  db.query(query, [rol, id], (err, result) => {

    if (err) return next(err);

    if (result.affectedRows === 0) {

      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      message: 'Rol actualizado correctamente'
    });
  });
};


// Eliminar usuario
const deleteUser = (req, res) => {
    const { id } = req.params;

    const sqlTickets = 'DELETE FROM tickets WHERE usuario_id = ?';
    const sqlUsuario = 'DELETE FROM usuarios WHERE id = ?';

    db.query(sqlTickets, [id], (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                error: 'Error eliminando tickets del usuario'
            });
        }

        db.query(sqlUsuario, [id], (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    error: 'Error eliminando usuario'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Usuario no encontrado'
                });
            }

            res.json({
                message: 'Usuario y sus tickets eliminados correctamente'
            });
        });
    });
};

module.exports = {
  registerUser,
  getUsers,
  cambiarRol,
  deleteUser
};