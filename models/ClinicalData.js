import mongoose from "mongoose";

const ClinicalDataSchema = new mongoose.Schema(
  {
    patientAdmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientAdmission", required: true },
    
    // Vital Signs History
    vitalSigns: [{
      recordedAt: { type: Date, default: Date.now },
      recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      bloodPressure: { type: String },
      heartRate: { type: Number },
      temperature: { type: Number },
      respiratoryRate: { type: Number },
      oxygenSaturation: { type: Number },
      weight: { type: Number },
      height: { type: Number },
      bmi: { type: Number },
      painScale: { type: Number, min: 0, max: 10, default: 0 },
      consciousnessLevel: { type: String, enum: ["Alert", "Verbal", "Pain", "Unresponsive"], default: "Alert" },
      notes: { type: String }
    }],
    
    // Medical History
    medicalHistory: {
      chronicConditions: [{ type: String }],
      previousSurgeries: [{
        procedure: { type: String, required: true },
        date: { type: Date },
        hospital: { type: String },
        complications: { type: String }
      }],
      familyHistory: [{
        condition: { type: String, required: true },
        relationship: { type: String, required: true },
        ageOfOnset: { type: Number }
      }],
      socialHistory: {
        smoking: { type: String, enum: ["Never", "Former", "Current"], default: "Never" },
        alcohol: { type: String, enum: ["Never", "Occasional", "Regular", "Heavy"], default: "Never" },
        drugs: { type: String, enum: ["Never", "Former", "Current"], default: "Never" },
        occupation: { type: String },
        maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"] }
      },
      recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      recordedAt: { type: Date, default: Date.now }
    },
    
    // Allergies and Adverse Reactions
    allergies: [{
      allergen: { type: String, required: true },
      reaction: { type: String, required: true },
      severity: { type: String, enum: ["Mild", "Moderate", "Severe", "Life-threatening"], required: true },
      dateIdentified: { type: Date },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      notes: { type: String }
    }],
    
    // Current Medications
    medications: [{
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      route: { type: String, enum: ["Oral", "IV", "IM", "Sublingual", "Topical", "Inhalation"], required: true },
      startDate: { type: Date },
      prescribedBy: { type: String },
      indication: { type: String },
      notes: { type: String },
      recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],
    
    // Physical Assessment
    physicalAssessment: {
      generalAppearance: { type: String },
      skinCondition: { type: String },
      cardiovascular: { type: String },
      respiratory: { type: String },
      neurological: { type: String },
      gastrointestinal: { type: String },
      genitourinary: { type: String },
      musculoskeletal: { type: String },
      assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      assessedAt: { type: Date, default: Date.now }
    },
    
    // Laboratory Results
    labResults: [{
      testName: { type: String, required: true },
      results: [{
        parameter: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String },
        referenceRange: { type: String },
        abnormal: { type: Boolean, default: false }
      }],
      orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      performedAt: { type: Date },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: { type: Date }
    }],
    
    // Imaging Results
    imagingResults: [{
      studyType: { type: String, required: true },
      bodyPart: { type: String, required: true },
      findings: { type: String },
      impression: { type: String },
      orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      performedAt: { type: Date },
      radiologist: { type: String },
      reportedAt: { type: Date }
    }],
    
    // Clinical Notes
    clinicalNotes: [{
      noteType: { type: String, enum: ["Admission", "Progress", "Discharge", "Consultation"], required: true },
      content: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      createdAt: { type: Date, default: Date.now },
      reviewed: { type: Boolean, default: false },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: { type: Date }
    }],
    
    // Data Completeness Tracking
    dataCompleteness: {
      vitalsRecorded: { type: Boolean, default: false },
      historyTaken: { type: Boolean, default: false },
      allergiesChecked: { type: Boolean, default: false },
      medicationsRecorded: { type: Boolean, default: false },
      physicalExamDone: { type: Boolean, default: false },
      consentObtained: { type: Boolean, default: false },
      completenessScore: { type: Number, default: 0 }, // 0-100%
      lastUpdated: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

// Calculate data completeness score
ClinicalDataSchema.methods.calculateCompleteness = function() {
  const checks = [
    this.vitalSigns.length > 0,
    this.medicalHistory.recordedBy !== null,
    this.allergies.length >= 0, // Even "no allergies" counts as checked
    this.medications.length >= 0, // Even "no medications" counts as recorded
    this.physicalAssessment.assessedBy !== null,
    this.dataCompleteness.consentObtained
  ];
  
  const completedChecks = checks.filter(Boolean).length;
  this.dataCompleteness.completenessScore = Math.round((completedChecks / checks.length) * 100);
  
  // Update individual flags
  this.dataCompleteness.vitalsRecorded = this.vitalSigns.length > 0;
  this.dataCompleteness.historyTaken = this.medicalHistory.recordedBy !== null;
  this.dataCompleteness.allergiesChecked = true; // Always true once checked
  this.dataCompleteness.medicationsRecorded = true; // Always true once recorded
  this.dataCompleteness.physicalExamDone = this.physicalAssessment.assessedBy !== null;
  this.dataCompleteness.lastUpdated = new Date();
  
  return this.dataCompleteness.completenessScore;
};

export default mongoose.models.ClinicalData || mongoose.model("ClinicalData", ClinicalDataSchema);