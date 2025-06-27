import mongoose from 'mongoose';

const emailStatusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: mongoose.Schema.Types.ObjectId, ref: 'Email', required: true },
  recipient: { type: String, required: true },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'replied', 'failed'],
    default: 'sent',
  },
  threadId: { type: String },
  messageId: { type: String },
  sentAt: { type: Date, default: Date.now },
  replyAt: { type: Date },
});

export default mongoose.model('EmailStatus', emailStatusSchema);
