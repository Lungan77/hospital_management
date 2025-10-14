import mongoose from "mongoose";

const TreatmentPlanSchema = new mongoose.Schema(
  {
    patientAdmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientAdmission" },
    diagnosisId: { type: mongoose.Schema.Types.ObjectId, ref: "Diagnosis" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    treatmentGoals: { type: String },

    medications: [{
      name: { type: String },
      dosage: { type: String },
      frequency: { type: String },
      route: { type: String },
      duration: { type: String },
      instructions: { type: String },
      startDate: { type: Date },
      endDate: { type: Date }
    }],

    procedures: [{
      name: { type: String },
      description: { type: String },
      scheduledDate: { type: Date },
      priority: { type: String, enum: ["Routine", "Urgent", "Emergency"] },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" }
    }],

    diagnosticTests: [{
      testName: { type: String },
      reason: { type: String },
      scheduledDate: { type: Date },
      priority: { type: String, enum: ["Routine", "Urgent", "STAT"] },
      status: { type: String, enum: ["Ordered", "Completed", "Cancelled"], default: "Ordered" }
    }],

    consultations: [{
      specialty: { type: String },
      consultantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: { type: String },
      requestedDate: { type: Date },
      status: { type: String, enum: ["Requested", "Scheduled", "Completed", "Cancelled"], default: "Requested" }
    }],

    nursingCare: [{
      task: { type: String },
      frequency: { type: String },
      assignedNurse: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      priority: { type: String, enum: ["Low", "Medium", "High", "Critical"] },
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
      priority: { type: String, enum: ["Low", "Medium", "High", "Critical"] },
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
    reviewNotes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.TreatmentPlan || mongoose.model("TreatmentPlan", TreatmentPlanSchema);
