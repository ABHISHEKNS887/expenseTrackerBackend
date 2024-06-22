import YAML from 'yamljs';
const swaggerDocument = YAML.load('/Users/abhishekns/Documents/expenseTracker/src/swagger.yaml');

export { swaggerDocument };