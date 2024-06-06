import mongoose from 'mongoose';

const { Schema } = mongoose;

const otpSchema = new Schema({
  phoneno: {
    type: Number,
    required: false,
  },
  otp: String,
  messageId: String,
  email: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 2, // this is the expiry time in seconds
  },
});

export default mongoose.model('otps', otpSchema);
