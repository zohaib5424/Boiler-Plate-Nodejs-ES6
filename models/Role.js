import mongoose from 'mongoose';

const { Schema } = mongoose;

const roleSchema = new Schema({
  roleName: String,
});

export default mongoose.model('roles', roleSchema);
