const { execSync } = require('child_process');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

const backendRoot = path.join(__dirname, '..');

beforeAll(async () => {
  execSync('npx prisma db push --force-reset --skip-generate', {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
  });
  execSync('node prisma/seed.js', {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
  });
});

afterAll(async () => {
  const prisma = require('../src/config/database');
  await prisma.$disconnect();
});
