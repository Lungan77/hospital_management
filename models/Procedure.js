import mongoose from "mongoose";

const ProcedureSchema = new mongoose.Schema(
  {
    patientAdmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientAdmission", required: true },
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    procedureName: { type: String, required: true },
    procedureType: {
      type: String,
      enum: ["Surgery", "Diagnostic", "Therapeutic", "Imaging", "Biopsy", "Endoscopy", "Other"],
      required: true
    },
    description: { type: String },

    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String },
    estimatedDuration: { type: String },

    priority: {
      type: String,
      enum: ["Routine", "Urgent", "Emergency", "STAT"],
      default: "Routine"
    },

    location: { type: String },
    room: { type: String },

    performingPhysician: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assistingStaff: [{
      staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String }
    }],

    preOpInstructions: { type: String },
    postOpInstructions: { type: String },

    requiredEquipment: [{ type: String }],
    requiredPreparation: { type: String },

    consentObtained: { type: Boolean, default: false },
    consentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    consentDate: { type: Date },

    status: {
      type: String,
      enum: ["Scheduled", "Confirmed", "In Progress", "Completed", "Cancelled", "Postponed"],
      default: "Scheduled"
    },

    actualStartTime: { type: Date },
    actualEndTime: { type: Date },

    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completedAt: { type: Date },
    procedureNotes: { type: String },
    complications: { type: String },

    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },

    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Procedure || mongoose.model("Procedure", ProcedureSchema);
