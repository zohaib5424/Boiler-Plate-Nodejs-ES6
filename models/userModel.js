import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  gender: String,
  email: {
    type: String,
    required: false,
  },
  phoneno: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'roles',
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'companies', // assuming companies is your company model
  },
  profilepic: String,
  address: String,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  resetPasswordOtp: String,
});

export default mongoose.model('users', userSchema);
