import mongoose from "mongoose";

const MedicationSchema = new mongoose.Schema(
  {
    patientAdmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientAdmission", required: true },
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    medicationName: { type: String, required: true },
    dosage: { type: String, required: true },
    route: {
      type: String,
      enum: ["Oral", "IV", "IM", "SC", "Topical", "Inhalation", "Rectal", "Other"],
      required: true
    },
    frequency: { type: String, required: true },
    duration: { type: String },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },

    instructions: { type: String },
    indication: { type: String },

    status: {
      type: String,
      enum: ["Active", "Completed", "Discontinued", "On Hold"],
      default: "Active"
    },

    administrations: [{
      administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      administeredAt: { type: Date },
      dose: { type: String },
      notes: { type: String },
      status: {
        type: String,
        enum: ["Given", "Refused", "Held", "Not Available"],
        default: "Given"
      }
    }],

    discontinuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    discontinuedAt: { type: Date },
    discontinuedReason: { type: String },

    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Medication || mongoose.model("Medication", MedicationSchema);
