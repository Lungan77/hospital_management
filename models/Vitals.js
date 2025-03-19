import mongoose from "mongoose";

const VitalsSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    bloodPressure: { type: String, required: true },
    temperature: { type: String, required: true },
    heartRate: { type: String, required: true },
    respiratoryRate: { type: String, required: true }, // New
    oxygenSaturation: { type: String, required: true }, // New
    weight: { type: String, required: true }, // New
    height: { type: String, required: true }, // New
    bmi: { type: String, required: false }, // New (calculated)
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Automatically calculate BMI before saving
VitalsSchema.pre("save", function (next) {
  if (this.weight && this.height) {
    const weightKg = parseFloat(this.weight);
    const heightM = parseFloat(this.height) / 100; // Convert cm to meters
    if (weightKg > 0 && heightM > 0) {
      this.bmi = (weightKg / (heightM * heightM)).toFixed(2);
    }
  }
  next();
});

export default mongoose.models.Vitals || mongoose.model("Vitals", VitalsSchema);
