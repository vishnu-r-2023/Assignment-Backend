const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('Authorization header received:', req.headers.authorization); // Debugging

  const token = req.headers.authorization?.split(' ')[1]; // Extract the token from "Bearer <token>"

  if (!token) {
    console.log('No token provided'); // Debugging
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Validate the token
    console.log('Token decoded:', decoded); // Debugging
    req.adminId = decoded.id; // Attach the admin ID to the request object
    next();
  } catch (error) {
    console.log('Invalid token:', error.message); // Debugging
    return res.status(403).json({ message: 'Unauthorized' });
  }
};
