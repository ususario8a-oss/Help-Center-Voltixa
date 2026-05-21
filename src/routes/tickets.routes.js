const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

const {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  asignarTecnico,
  cambiarEstado
} = require('../controllers/tickets.controller');

// 🔹 Obtener tickets
router.get('/', authMiddleware, getTickets);

// 🔹 Crear ticket
router.post('/', authMiddleware, createTicket);

// 🔹 Actualizar ticket completo
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'tecnico'),
  updateTicket
);

// 🔹 Cambiar estado del ticket
router.put('/:id/estado', authMiddleware, cambiarEstado);

// 🔹 Asignar técnico al ticket
router.put(
  '/:id/asignar',
  authMiddleware,
  roleMiddleware('admin'),
  asignarTecnico
);

// 🔹 Eliminar ticket (solo admin)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  deleteTicket
);

module.exports = router;