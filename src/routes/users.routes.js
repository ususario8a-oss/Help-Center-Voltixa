const express = require('express');
const router = express.Router();

const {
  registerUser,
  getUsers,
  cambiarRol,
  deleteUser
} = require('../controllers/users.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

// Registrar usuario
router.post('/register', registerUser);

// Obtener usuarios (solo admin)
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  getUsers
);

// Cambiar rol de usuario (solo admin)
router.put(
  '/:id/rol',
  authMiddleware,
  roleMiddleware('admin'),
  cambiarRol
);

// Eliminar usuario (solo admin)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  deleteUser
);

module.exports = router;