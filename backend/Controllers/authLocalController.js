import bcrypt from 'bcrypt';
import User from '../Models/userModel.js';

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      loginMethod: 'local',
    });

    req.login(newUser, (err) => {
      if (err) return res.status(500).json({ message: 'Login after register failed' });
      const { password, ...userSafe } = newUser.toObject();
      return res.status(201).json({ message: 'User registered & logged in', user: userSafe });
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Login failed' });
      const { password, ...userSafe } = user.toObject();
      return res.status(200).json({ message: 'Login successful', user: userSafe });
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logoutUser = (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
};

// Set or update password for existing user
export const setPassword = async (req, res) => {
  try {
    const { password } = req.body;

    console.log(req.user);
    
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.password && user.password.trim() !== '')
      return res.status(400).json({ message: 'Password already set. Use update instead.' });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;

    // Update loginMethod to 'both' if needed
    if (user.loginMethod === 'google') user.loginMethod = 'both';

    await user.save();

    res.status(200).json({ message: 'Password set successfully' });
  } catch (err) {
    console.error('Set password error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
