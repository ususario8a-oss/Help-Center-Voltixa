// tickets.controller.js

const db = require('../config/db');
const { ok, fail } = require('../utils/response');
const bcrypt = require('bcrypt');

//  Constantes globales (MEJOR PRÁCTICA)
const estadosValidos = ['abierto', 'pendiente', 'en_proceso', 'resuelto', 'cerrado'];
const prioridadesValidas = ['baja', 'media', 'alta'];

// Obtener todos los tickets
const getTickets = (req, res) => {

  const { estado, limite = 100, pagina = 1 } = req.query;

  const limit = parseInt(limite);
  const offset = (parseInt(pagina) - 1) * limit;

let countQuery = 'SELECT COUNT(*) AS total FROM tickets';
let ticketsQuery = `
    SELECT 
        tickets.id,
        tickets.titulo,
        tickets.descripcion,
        tickets.estado,
        tickets.prioridad,
        tickets.fecha_creacion,
        tickets.usuario_id,
        usuarios.email AS usuario_email
    FROM tickets
    LEFT JOIN usuarios
        ON tickets.usuario_id = usuarios.id
`;

let queryParams = [];

if (estado) {

    countQuery += ' WHERE estado = ?';

    ticketsQuery += ' WHERE tickets.estado = ?';

    queryParams.push(estado);
}

ticketsQuery += `
    ORDER BY tickets.fecha_creacion DESC
    LIMIT ? OFFSET ?
`;
  db.query(countQuery, queryParams, (err, countResult) => {

    if (err) {
      return fail(res, 'Error al contar tickets', 500, err);
    }

    db.query(
      ticketsQuery,
      [...queryParams, limit, offset],

      (err, results) => {

        if (err) {
          return fail(res, 'Error al consultar tickets', 500, err);
        }

        return res.json({
          total: countResult[0].total,
          pagina: parseInt(pagina),
          limite: limit,
          data: results
        });
      }
    );
  });
};

// Crear ticket
const createTicket = (req, res) => {
  let { titulo, descripcion, estado, prioridad } = req.body;

  //  Limpiar datos primero
  titulo = titulo?.trim();
  descripcion = descripcion?.trim();

  let errores = [];

  // Validar título
  if (!titulo || typeof titulo !== 'string' || titulo.length < 5) {
    errores.push('El título debe tener al menos 5 caracteres');
  }

  // Validar descripción
  if (!descripcion || typeof descripcion !== 'string' || descripcion.length < 10) {
    errores.push('La descripción debe tener al menos 10 caracteres');
  }

  // Validar estado
  if (estado && !estadosValidos.includes(estado)) {
    errores.push('Estado inválido');
  }

  // Validar prioridad
  if (prioridad && !prioridadesValidas.includes(prioridad)) {
    errores.push('Prioridad inválida');
  }

  // Si hay errores, regresar todos
  if (errores.length > 0) {
    return fail(res, errores, 400);
  }

 const usuario_id = req.user.id;

const query = `
    INSERT INTO tickets (
      titulo,
      descripcion,
      estado,
      prioridad,
      usuario_id,
      fecha_creacion
    ) 
    VALUES (?, ?, ?, ?, ?, NOW())
`;

  db.query(
  query,
  [
    titulo,
    descripcion,
    estado || 'abierto',
    prioridad || 'baja',
    usuario_id
  ],
    (err, result) => {
      if (err) return fail(res, 'Error al crear ticket', 500, err);

      return ok(res, { id: result.insertId }, 'Ticket creado', 201);
    }
  );
};

// Actualizar ticket (DINÁMICO)
const updateTicket = (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, estado, prioridad } = req.body;

  if (!id || isNaN(id)) {
    return fail(res, 'ID de ticket inválido', 400);
  }

  if (!titulo && !descripcion && !estado && !prioridad) {
    return fail(res, 'Debe enviar al menos un campo para actualizar', 400);
  }

  if (titulo && (typeof titulo !== 'string' || titulo.trim().length < 5)) {
    return fail(res, 'El título debe tener al menos 5 caracteres', 400);
  }

  if (descripcion && (typeof descripcion !== 'string' || descripcion.trim().length < 10)) {
    return fail(res, 'La descripción debe tener al menos 10 caracteres', 400);
  }

  if (estado && !estadosValidos.includes(estado)) {
    return fail(res, 'Estado inválido', 400);
  }

  if (prioridad && !prioridadesValidas.includes(prioridad)) {
    return fail(res, 'Prioridad inválida', 400);
  }

  let campos = [];
  let valores = [];

  if (titulo) {
    campos.push('titulo = ?');
    valores.push(titulo.trim());
  }

  if (descripcion) {
    campos.push('descripcion = ?');
    valores.push(descripcion.trim());
  }

  if (estado) {
    campos.push('estado = ?');
    valores.push(estado);
  }

  if (prioridad) {
    campos.push('prioridad = ?');
    valores.push(prioridad);
  }

  valores.push(id);

  const query = `UPDATE tickets SET ${campos.join(', ')} WHERE id = ?`;

  db.query(query, valores, (err, result) => {
    if (err) return fail(res, 'Error al actualizar ticket', 500, err);

    if (result.affectedRows === 0) {
      return fail(res, 'Ticket no encontrado', 404);
    }

    return ok(res, result, 'Ticket actualizado correctamente');
  });
};

// Asignar técnico
const asignarTecnico = (req, res) => {
  const { tecnico_id } = req.body;
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return fail(res, 'ID de ticket inválido', 400);
  }

  if (!tecnico_id || isNaN(tecnico_id)) {
    return fail(res, 'El tecnico_id es inválido', 400);
  }

  const query = `UPDATE tickets SET tecnico_id = ?, estado = 'en_proceso' WHERE id = ?`;

  db.query(query, [tecnico_id, id], (err, result) => {
    if (err) return fail(res, 'Error al asignar técnico', 500, err);

    if (result.affectedRows === 0) {
      return fail(res, 'Ticket no encontrado', 404);
    }

    return ok(res, result, 'Ticket asignado correctamente');
  });
};

// Cambiar estado
const cambiarEstado = (req, res) => {

  // Permitir solo admin y tecnico
  if (
    req.user.rol !== 'admin' &&
    req.user.rol !== 'tecnico'
  ) {
    return fail(res, 'No autorizado', 403);
  }

  const { estado } = req.body;
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return fail(res, 'ID de ticket inválido', 400);
  }

  if (!estado) {
    return fail(res, 'El estado es obligatorio', 400);
  }

  if (!estadosValidos.includes(estado)) {
    return fail(res, 'Estado inválido', 400);
  }

  const query = `UPDATE tickets SET estado = ? WHERE id = ?`;

  db.query(query, [estado, id], (err, result) => {

    if (err) {
      return fail(res, 'Error al actualizar estado', 500, err);
    }

    if (result.affectedRows === 0) {
      return fail(res, 'Ticket no encontrado', 404);
    }

    return ok(res, result, 'Estado actualizado correctamente');

  });
};

// Eliminar ticket
const deleteTicket = (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return fail(res, 'ID inválido', 400);
  }

  db.query('DELETE FROM tickets WHERE id = ?', [id], (err, result) => {
    if (err) return fail(res, 'Error al eliminar ticket', 500, err);

    if (result.affectedRows === 0) {
      return fail(res, 'Ticket no encontrado', 404);
    }

    return ok(res, result, 'Ticket eliminado');
  });
};

// Registrar usuario
const registerUser = (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
    return fail(res, 'El nombre debe tener al menos 3 caracteres', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return fail(res, 'Correo electrónico inválido', 400);
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return fail(res, 'La contraseña debe tener al menos 6 caracteres', 400);
  }

  const checkQuery = `SELECT id FROM usuarios WHERE email = ?`;

  db.query(checkQuery, [email.trim()], (err, results) => {
    if (err) return fail(res, 'Error al verificar usuario', 500, err);

    if (results.length > 0) {
      return fail(res, 'El usuario ya está registrado', 400);
    }

    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) return fail(res, 'Error al encriptar contraseña', 500, err);

      const insertQuery = `
        INSERT INTO usuarios (nombre, email, password)
        VALUES (?, ?, ?)
      `;

      db.query(
        insertQuery,
        [nombre.trim(), email.trim(), hashedPassword],
        (err, result) => {
          if (err) return fail(res, 'Error al registrar usuario', 500, err);

          return ok(res, { id: result.insertId }, 'Usuario registrado', 201);
        }
      );
    });
  });
};

// Exportación de funciones
module.exports = {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  asignarTecnico,
  cambiarEstado,
  registerUser
};