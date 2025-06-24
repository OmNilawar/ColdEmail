import mongoose from 'mongoose';

const userModel = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  // ✅ For password-based login
  password: { type: String }, // Hashed password (nullable if user signs up via Google only)

  // ✅ Optional: Track how user registered/logs in
  loginMethod: {
    type: String,
    enum: ['google', 'local', 'both'],
    default: 'local',
  },

  recipients: [{ type: String }], // Array of recipient email addresses

  // ✅ Google OAuth fields
  googleId: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
  profileImage: { type: String },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userModel);
