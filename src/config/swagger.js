const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Help Center API',
      version: '1.0.0',
      description: 'Documentación del API Help Center'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    servers: [
      { url: 'http://localhost:3000' }
    ]
  },
  apis: ['./server.js'] // ⚠️ importante
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;