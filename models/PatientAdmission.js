import mongoose from "mongoose";

const PatientAdmissionSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: false }, // Generated unique ID
    emergencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Emergency" }, // Link to emergency if from EMS
    
    // Patient Information
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    idNumber: { type: String },
    phone: { type: String },
    address: { type: String },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String }
    },
    
    // Admission Details
    admissionType: { 
      type: String, 
      enum: ["Emergency", "Scheduled", "Transfer", "Walk-in"], 
      required: true 
    },
    arrivalMethod: { 
      type: String, 
      enum: ["Ambulance", "Private Vehicle", "Walk-in", "Transfer"], 
      required: true 
    },
    arrivalTime: { type: Date, default: Date.now },
    
    // Triage Information
    triageLevel: { 
      type: String, 
      enum: ["1 - Resuscitation", "2 - Emergency", "3 - Urgent", "4 - Less Urgent", "5 - Non-Urgent"],
      required: true 
    },
    triageNotes: { type: String },
    triageTime: { type: Date },
    triageNurse: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // Medical Information
    chiefComplaint: { type: String, required: true },
    presentingSymptoms: { type: String },
    painScale: { type: Number, min: 0, max: 10, default: 0 },
    allergies: { type: String },
    currentMedications: { type: String },
    medicalHistory: { type: String },
    
    // Vital Signs at Admission
    vitalSigns: {
      bloodPressure: { type: String },
      heartRate: { type: Number },
      temperature: { type: Number },
      respiratoryRate: { type: Number },
      oxygenSaturation: { type: Number },
      weight: { type: Number },
      height: { type: Number },
      recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      recordedAt: { type: Date, default: Date.now }
    },
    
    // Assignment Information
    assignedBed: { type: String },
    assignedWard: { type: String },
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedNurse: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedSpecialists: [{
      specialistId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      specialty: { type: String },
      assignedAt: { type: Date, default: Date.now },
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      notes: { type: String }
    }],

    // Critical Equipment and Resources
    assignedEquipment: [{
      equipmentType: {
        type: String,
        enum: ["Ventilator", "Monitor", "Oxygen", "IV Pump", "Defibrillator", "Suction", "Other"]
      },
      equipmentId: { type: String },
      assignedAt: { type: Date, default: Date.now },
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["Active", "Removed", "Maintenance"],
        default: "Active"
      },
      notes: { type: String },
      removedAt: { type: Date }
    }],
    
    // Status Tracking
    status: { 
      type: String, 
      enum: ["Admitted", "In Treatment", "Waiting", "Discharged", "Transferred"], 
      default: "Admitted" 
    },
    
    // Administrative Information
    admittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    insurance: {
      provider: { type: String },
      policyNumber: { type: String },
      groupNumber: { type: String }
    },
    
    // Discharge Information
    dischargeTime: { type: Date },
    dischargeNotes: { type: String },
    dischargedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // System Information
    admissionNumber: { type: String, unique: true }, // Hospital admission number
    mrn: { type: String }, // Medical Record Number
    
    // Alerts and Flags
    alerts: [{
      type: { type: String, enum: ["Allergy", "Fall Risk", "Isolation", "DNR", "Other"] },
      description: { type: String },
      severity: { type: String, enum: ["Low", "Medium", "High", "Critical"] },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      addedAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Generate admission number before saving
PatientAdmissionSchema.pre("save", async function (next) {
  if (!this.admissionNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Use milliseconds and random component to ensure uniqueness
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.admissionNumber = `ADM-${year}${month}${day}-${timestamp.slice(-6)}${random}`;
  }

  next();
});

export default mongoose.models.PatientAdmission || mongoose.model("PatientAdmission", PatientAdmissionSchema);