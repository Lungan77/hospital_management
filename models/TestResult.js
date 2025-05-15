// models/TestResult.js
import mongoose from 'mongoose';

const ResultEntrySchema = new mongoose.Schema({
  parameter: { type: String, required: true },
  value: { type: String, required: true },
  unit: { type: String, required: false },
  referenceRange: { type: String, required: false },
  interpretation: { type: String, required: false }
});

const TestResultSchema = new mongoose.Schema({
  sample: { type: mongoose.Schema.Types.ObjectId, ref: 'Sample', required: true },
  testOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestOrder', required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testName: { type: String, required: true },
  results: [ResultEntrySchema],
  comments: { type: String },
  status: { type: String, enum: ['Completed', 'Approved'], default: 'Completed' },
  recordedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
});

export default mongoose.models.TestResult || mongoose.model('TestResult', TestResultSchema);
