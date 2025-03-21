import mongoose from "mongoose";

const TreatmentPlanSchema = new mongoose.Schema(
  {
    diagnosisId: { type: mongoose.Schema.Types.ObjectId, ref: "Diagnosis", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lifestyleRecommendations: { type: String }, 
    physiotherapy: { type: String }, 
    mentalHealthSupport: { type: String }, 
    followUpDate: { type: Date }, 
    additionalNotes: { type: String }, 
  },
  { timestamps: true }
);

export default mongoose.models.TreatmentPlan || mongoose.model("TreatmentPlan", TreatmentPlanSchema);
