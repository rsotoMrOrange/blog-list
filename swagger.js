const swaggerJSDoc = require('swagger-jsdoc')

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Bloglist API',
    version: '1.0.0',
    description: 'API intended to serve blog-related information',
  },
}

const options = {
  swaggerDefinition,
  apis: ['./controllers/blogs.js'],
}

const swaggerSpec = swaggerJSDoc(options)
module.exports = swaggerSpec