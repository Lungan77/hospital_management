import mongoose from "mongoose";

const testTypes = ["Blood Test", "Urine Test", "X-ray", "CT Scan"];
const testStatuses = ["Pending Sample Collection", "Collected", "In Progress", "Completed"];

const TestOrderSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tests: [{
    type: String,
    enum: testTypes,
    required: true,
  }],
  status: {
    type: String,
    enum: testStatuses,
    default: "Pending Sample Collection",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.TestOrder || mongoose.model("TestOrder", TestOrderSchema);
