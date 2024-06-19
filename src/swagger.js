import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Expense Tracker',
        version: '1.0.0',
        description: 'A project which tracks the expense',
    },
    servers: [
        {
        url: `http://localhost:${process.env.PORT}/api/v1/admin`
    }
]
};

const options = {
    swaggerDefinition,
    apis: ['./routes/admin/*.router.js'], // Path to the API routes in your Node.js application
};

const swaggerSpec = swaggerJSDoc(options);
export {swaggerSpec};