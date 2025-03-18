import mongoose from "mongoose";

const TimeSlotSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // Storing as YYYY-MM-DD
    slots: [{ type: String, required: true }], // Example: ["09:00 AM", "10:00 AM"]
  },
  { timestamps: true }
);

export default mongoose.models.TimeSlot || mongoose.model("TimeSlot", TimeSlotSchema);
