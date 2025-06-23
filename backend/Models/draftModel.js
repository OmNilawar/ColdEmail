import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: String,
  body: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
  // Add other fields as needed
});

export default mongoose.model('Draft', draftSchema);