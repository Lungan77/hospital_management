import mongoose from "mongoose";

const InfectionControlSchema = new mongoose.Schema(
  {
    patientAdmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientAdmission", required: true },
    identifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    infectionType: {
      type: String,
      enum: [
        "MRSA",
        "C. difficile",
        "VRE",
        "COVID-19",
        "Tuberculosis",
        "Influenza",
        "Norovirus",
        "Hepatitis",
        "HIV",
        "Multi-Drug Resistant",
        "Other"
      ],
      required: true
    },
    infectionCategory: {
      type: String,
      enum: ["Hospital-Acquired", "Community-Acquired", "Suspected", "Confirmed"],
      required: true
    },

    isolationType: {
      type: String,
      enum: ["Contact", "Droplet", "Airborne", "Protective", "Standard", "Combined"],
      required: true
    },
    isolationRequired: { type: Boolean, default: true },
    isolationStartDate: { type: Date, default: Date.now },
    isolationEndDate: { type: Date },

    specialWardRequired: { type: Boolean, default: false },
    assignedWard: { type: mongoose.Schema.Types.ObjectId, ref: "Ward" },
    assignedRoom: { type: String },
    wardAssignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    wardAssignedAt: { type: Date },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },

    symptoms: [{ type: String }],
    labResults: [{
      testName: { type: String },
      result: { type: String },
      date: { type: Date },
      notes: { type: String }
    }],

    protocols: [{
      protocolName: { type: String, required: true },
      description: { type: String },
      implementedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      implementedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["Active", "Completed", "Discontinued"],
        default: "Active"
      }
    }],

    ppeRequired: [{
      item: { type: String },
      quantity: { type: String },
      mandatory: { type: Boolean, default: true }
    }],

    monitoringSchedule: {
      frequency: { type: String },
      lastMonitored: { type: Date },
      nextMonitoring: { type: Date }
    },

    contacts: [{
      contactType: {
        type: String,
        enum: ["Healthcare Worker", "Patient", "Visitor", "Family Member", "Other"]
      },
      contactId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      contactName: { type: String },
      exposureDate: { type: Date },
      exposureType: { type: String },
      notified: { type: Boolean, default: false },
      notifiedAt: { type: Date },
      followUpRequired: { type: Boolean, default: true },
      followUpStatus: { type: String }
    }],

    environmentalCleaning: [{
      cleanedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      cleanedAt: { type: Date },
      area: { type: String },
      disinfectantUsed: { type: String },
      verified: { type: Boolean, default: false },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],

    status: {
      type: String,
      enum: ["Active", "Monitoring", "Resolved", "Transferred", "Deceased"],
      default: "Active"
    },

    resolvedDate: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolutionNotes: { type: String },

    notes: { type: String },
    alerts: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.models.InfectionControl || mongoose.model("InfectionControl", InfectionControlSchema);
