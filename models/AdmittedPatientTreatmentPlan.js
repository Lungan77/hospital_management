import mongoose from "mongoose";

const AdmittedPatientTreatmentPlanSchema = new mongoose.Schema(
  {
    patientAdmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientAdmission",
      required: true,
      index: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    treatmentGoals: { type: String },

    medications: [{
      name: { type: String },
      dosage: { type: String },
      frequency: { type: String },
      route: { type: String },
      duration: { type: String },
      instructions: { type: String },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date }
    }],

    procedures: [{
      name: { type: String },
      description: { type: String },
      scheduledDate: { type: Date },
      priority: { type: String, enum: ["Routine", "Urgent", "Emergency"], default: "Routine" },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
      completedDate: { type: Date },
      notes: { type: String }
    }],

    diagnosticTests: [{
      testName: { type: String },
      reason: { type: String },
      scheduledDate: { type: Date },
      priority: { type: String, enum: ["Routine", "Urgent", "STAT"], default: "Routine" },
      status: { type: String, enum: ["Ordered", "Completed", "Cancelled"], default: "Ordered" },
      results: { type: String }
    }],

    consultations: [{
      specialty: { type: String },
      consultantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: { type: String },
      requestedDate: { type: Date, default: Date.now },
      status: { type: String, enum: ["Requested", "Scheduled", "Completed", "Cancelled"], default: "Requested" },
      scheduledDate: { type: Date },
      notes: { type: String }
    }],

    nursingCare: [{
      task: { type: String },
      frequency: { type: String },
      assignedNurse: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
      status: { type: String, enum: ["Active", "Completed", "Discontinued"], default: "Active" }
    }],

    dietaryRequirements: {
      type: { type: String },
      restrictions: { type: String },
      allergies: { type: String },
      specialInstructions: { type: String }
    },

    activityRestrictions: { type: String },

    monitoringRequirements: [{
      parameter: { type: String },
      frequency: { type: String },
      targetRange: { type: String },
      instructions: { type: String }
    }],

    expectedDuration: { type: String },

    staffTasks: [{
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      task: { type: String },
      priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
      dueDate: { type: Date },
      status: { type: String, enum: ["Pending", "In Progress", "Completed", "Cancelled"], default: "Pending" },
      notes: { type: String },
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      completedAt: { type: Date }
    }],

    status: {
      type: String,
      enum: ["Active", "Completed", "Revised", "Discontinued"],
      default: "Active"
    },

    lifestyleRecommendations: { type: String },
    physiotherapy: { type: String },
    mentalHealthSupport: { type: String },
    followUpDate: { type: Date },
    notes: { type: String },
    additionalNotes: { type: String },

    reviewDate: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNotes: { type: String },

    version: { type: Number, default: 1 },
    supersededBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdmittedPatientTreatmentPlan" }
  },
  { timestamps: true }
);

AdmittedPatientTreatmentPlanSchema.index({ patientAdmissionId: 1, status: 1 });
AdmittedPatientTreatmentPlanSchema.index({ doctorId: 1 });

export default mongoose.models.AdmittedPatientTreatmentPlan || mongoose.model("AdmittedPatientTreatmentPlan", AdmittedPatientTreatmentPlanSchema);
