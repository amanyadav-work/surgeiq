import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
  oxygen_stock: Number,
  beds_available: Number,
  staff_on_duty: Number,
  ventilators: Number,
  masks: Number,
  gloves: Number,
  medicines: Number,
  ambulances: Number,
}, { _id: false });

const EntrySchema = new mongoose.Schema({
  date: { type: String, required: true },
  AQI: Number,
  temperature: String,
  holiday_event: String,
  patient_count: Number,
  oxygen_used: Number,
  beds_used: Number,
  resources: ResourceSchema,
}, { _id: false });

const DatasetSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  entries: [EntrySchema],
}, { timestamps: true });

export default mongoose.models.Dataset || mongoose.model('Dataset', DatasetSchema);
