import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  subject: { type: String },
  body: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Email', emailSchema);
