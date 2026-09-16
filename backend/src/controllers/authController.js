const authService = require('../services/authService');

async function login(req, res) {
  const { email, password } = req.validated.body;
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
}

module.exports = { login };
