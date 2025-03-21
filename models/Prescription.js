import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema(
  {
    diagnosisId: { type: mongoose.Schema.Types.ObjectId, ref: "Diagnosis", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
      },
    ],
    additionalNotes: { type: String },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Prescription || mongoose.model("Prescription", PrescriptionSchema);
