const express = require("express");
const cors = require("cors");

const app = express();

// =====================
// CONFIGURACIONES
// =====================
app.use(cors());
app.use(express.json());

// =====================
// SWAGGER
// =====================
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =====================
// RUTA PRINCIPAL
// =====================
app.get('/', (req, res) => {
    res.send('🚀 Help Center API funcionando correctamente');
});

// =====================
// CONEXION MYSQL
// =====================
// Solo importa la conexión, NO la crees aquí
require('./src/config/db');

// =====================
// RUTAS
// =====================

// Tickets
const ticketRoutes = require('./src/routes/tickets.routes');
app.use('/api/tickets', ticketRoutes);

// Usuarios
const userRoutes = require('./src/routes/users.routes');
app.use('/api/users', userRoutes);

// Auth
const authRoutes = require('./src/routes/auth.routes');
app.use('/api/auth', authRoutes);

// =====================
// MIDDLEWARE DE ERRORES
// =====================
const errorHandler = require('./src/middlewares/errorMiddleware');
app.use(errorHandler);

// =====================
// SERVIDOR
// =====================
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});