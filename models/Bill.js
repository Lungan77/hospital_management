import mongoose from "mongoose";

const BillSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    diagnosisId: { type: mongoose.Schema.Types.ObjectId, ref: "Diagnosis", required: true },
    consultationFee: { type: Number, required: true },
    labTestsFee: { type: Number, default: 0 },
    medicationFee: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: ["paystack", "cash"], default: "paystack" },
  },
  { timestamps: true }
);

export default mongoose.models.Bill || mongoose.model("Bill", BillSchema);
