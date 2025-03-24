import mongoose from "mongoose";

const DiagnosisSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symptoms: { type: String, required: true },
    symptomsDuration: { type: String }, 
    diagnosis: { type: String, required: true },
    severity: { type: String, enum: ["Mild", "Moderate", "Severe"], required: true }, 
    labTestsOrdered: { type: String }, 
    notes: { type: String },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" }, // ✅ Link to Prescription
    treatmentPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "TreatmentPlan" }, // ✅ Link to Treatment Plan
    referralId: { type: mongoose.Schema.Types.ObjectId, ref: "Referral" },
  },
  { timestamps: true }
);

export default mongoose.models.Diagnosis || mongoose.model("Diagnosis", DiagnosisSchema);
