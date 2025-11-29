import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: Buffer, required: true }, // Assuming password is stored as binary
  name: { type: String, required: true },
  hospital_name: { type: String, required: true },
  location: { type: String, required: true },
  role: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
