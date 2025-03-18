import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // New: Time slot
  },
  { timestamps: true }
);

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
