const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token saknas' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'din_hemliga_nyckel'); 
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Ogiltig token' });
  }
}

module.exports = requireAuth;