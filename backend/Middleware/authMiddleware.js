// middlewares/authMiddleware.js
import User from '../Models/userModel.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];

    if (!token) return res.status(401).json({ error: 'Access token missing' });

    // Find user by accessToken
    const user = await User.findOne({ accessToken: token });
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    req.user = user; // Attach the whole user to the request
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authentication failed', details: err.message });
  }
};
