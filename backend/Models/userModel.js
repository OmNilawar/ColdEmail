import mongoose from 'mongoose';

const userModel = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  recipients: [{ type: String }], // Array of recipient email addresses
  googleId: { type: String }, // Unique Google ID for OAuth users
  accessToken: { type: String }, // OAuth access token for sending emails
  refreshToken: { type: String }, // OAuth refresh token for renewing access tokens
  profileImage: { type: String }, // URL of the user's profile image
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userModel);