const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`ERP API server running on port ${env.port}`);
  console.log(`Swagger docs: http://localhost:${env.port}/api/docs`);
});
