// models/TestOrder.js
import mongoose from "mongoose";

const TestOrderSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  tests: [
    {
      name: { type: String, required: true },
      sampleType: { type: String },
      instructions: { type: String },
      reason: { type: String },
      priority: { type: String, enum: ["Routine", "Urgent", "STAT"], default: "Routine" },
      expectedResultDate: { type: Date },
      status: { type: String, enum: ["Pending Sample Collection", "In Progress", "Completed"], default: "Pending Sample Collection" },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TestOrder || mongoose.model("TestOrder", TestOrderSchema);
