import mongoose from "mongoose";

const DischargeSummarySchema = new mongoose.Schema(
  {
    patientAdmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientAdmission", required: true },
    dischargedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    dischargeDate: { type: Date, default: Date.now },
    dischargeTime: { type: String },

    admissionDate: { type: Date },
    lengthOfStay: { type: Number },

    reasonForAdmission: { type: String },
    chiefComplaint: { type: String },

    admissionDiagnosis: { type: String },
    finalDiagnosis: { type: String, required: true },
    secondaryDiagnoses: [{ type: String }],

    hospitalCourse: { type: String, required: true },

    proceduresPerformed: [{
      procedureName: { type: String },
      date: { type: Date },
      performedBy: { type: String },
      notes: { type: String }
    }],

    investigationsResults: [{
      testName: { type: String },
      date: { type: Date },
      result: { type: String },
      significance: { type: String }
    }],

    treatmentProvided: {
      medications: [{ type: String }],
      therapies: [{ type: String }],
      interventions: [{ type: String }]
    },

    conditionAtDischarge: {
      type: String,
      enum: ["Improved", "Stable", "Unchanged", "Deteriorated", "Deceased"],
      required: true
    },

    vitalSignsAtDischarge: {
      bloodPressure: { type: String },
      heartRate: { type: String },
      temperature: { type: String },
      respiratoryRate: { type: String },
      oxygenSaturation: { type: String }
    },

    dischargeMedications: [{
      medicationName: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: { type: String },
      instructions: { type: String }
    }],

    dietaryInstructions: { type: String },
    activityRestrictions: { type: String },

    followUpCare: {
      required: { type: Boolean, default: false },
      appointmentDate: { type: Date },
      appointmentWith: { type: String },
      instructions: { type: String }
    },

    warningSignsToReport: [{ type: String }],

    patientEducation: { type: String },
    caregiverInstructions: { type: String },

    referrals: [{
      specialty: { type: String },
      physicianName: { type: String },
      reason: { type: String },
      urgent: { type: Boolean, default: false }
    }],

    dischargeDestination: {
      type: String,
      enum: ["Home", "Rehabilitation Facility", "Nursing Home", "Another Hospital", "Other"],
      default: "Home"
    },

    transportArrangements: { type: String },

    complications: [{ type: String }],

    followUpInvestigations: [{ type: String }],

    clinicalNotes: { type: String },

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Approved"
    },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },

    billingCleared: { type: Boolean, default: false },
    medicationsCollected: { type: Boolean, default: false },

    patientAcknowledgement: {
      acknowledged: { type: Boolean, default: false },
      acknowledgedAt: { type: Date },
      signature: { type: String }
    },

    additionalNotes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.DischargeSummary || mongoose.model("DischargeSummary", DischargeSummarySchema);
