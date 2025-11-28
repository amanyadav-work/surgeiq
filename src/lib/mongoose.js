import mongoose from 'mongoose';
import SurgePrediction from '@/schemas/SurgePrediction';

const MONGO_URI = process.env.MONGODB_URI;

let isConnected = false;

export { SurgePrediction };

export async function dbConnect() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}