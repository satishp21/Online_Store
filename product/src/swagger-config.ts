import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  swaggerDefinition: {
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'Documentation for my API',
    },
    tags: [
      {
        name: 'Landlord Management',
        description: 'Landlord related opertions',
      },
      {
        name: 'Mortgage Management',
        description: 'Mortgage related opertions',
      },
      {
        name: 'Admin Auth',
        description: 'Admin Authentication',
      },
      // Add more tags as needed
    ],
    securityDefinitions: {
      BearerAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
      },
    }
  },
  security: [
    {
      BearerAuth: []
    },
  ],
  apis: ['./src/routes/*.ts','./dist/routes/*.js'], // Specify the path to your API routes files
};

const specs = swaggerJsdoc(options);

export default specs;