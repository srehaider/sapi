import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const SALT_FACTOR = 10;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  name: String,
  role: String,
});

userSchema.pre('save', async next => {
  try {
    if (this.isModified('password')) {
      this.password = await bcryptjs.hash(this.password, SALT_FACTOR);
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = async newPassword => {
  try {
    return await bcryptjs.compare(newPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

export default mongoose.model('User', userSchema);
