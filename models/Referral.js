import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema(
  {
    diagnosisId: { type: mongoose.Schema.Types.ObjectId, ref: "Diagnosis", required: true },
    referringDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    specialistName: { type: String, required: true }, // ✅ Entered manually
    hospitalName: { type: String, required: true }, // ✅ Entered manually
    reasonForReferral: { type: String, required: true },
    additionalNotes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Referral || mongoose.model("Referral", ReferralSchema);
