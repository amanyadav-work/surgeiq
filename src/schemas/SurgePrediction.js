import mongoose from 'mongoose';

const SurgePredictionSchema = new mongoose.Schema({
  phase: { type: String, required: true }, // e.g. "2023-01-05_to_2023-01-19"
  predictions: { type: Array, required: true },
  surge_days: { type: Array, required: true },
  resources: { type: Array, required: false }, // <-- Added field for resources data
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.SurgePrediction ||
  mongoose.model('SurgePrediction', SurgePredictionSchema);
