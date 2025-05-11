import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    checkedIn: { type: Boolean, default: false }, // ✅ Updated: Track check-in status
    checkInTime: { type: Date, default: null }, // ✅ New: Timestamp for check-in
    checkInToken: {type: String},
    checkInTokenExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
