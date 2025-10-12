import mongoose from "mongoose";

const TreatmentConsentSchema = new mongoose.Schema(
  {
    patientAdmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientAdmission", required: true },
    
    // Consent Provider Information
    consentProvider: {
      isPatient: { type: Boolean, default: true },
      name: { type: String, required: true },
      relationship: { type: String }, // If not patient
      idNumber: { type: String },
      phone: { type: String },
      address: { type: String },
      legalGuardian: { type: Boolean, default: false },
      powerOfAttorney: { type: Boolean, default: false }
    },
    
    // General Treatment Consent
    generalConsent: {
      consentGiven: { type: Boolean, required: true },
      consentDate: { type: Date, default: Date.now },
      witnessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      signature: { type: String }, // Digital signature or signature image path
      consentForm: { type: String }, // Path to signed consent form
      limitations: { type: String }, // Any limitations on consent
      notes: { type: String }
    },
    
    // Specific Treatment Consents
    specificConsents: [{
      treatmentType: { type: String, required: true },
      description: { type: String, required: true },
      risks: [{ type: String }],
      benefits: [{ type: String }],
      alternatives: [{ type: String }],
      consentGiven: { type: Boolean, required: true },
      consentDate: { type: Date, default: Date.now },
      expiryDate: { type: Date },
      doctorExplanation: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      witnessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      signature: { type: String },
      notes: { type: String }
    }],
    
    // Blood Transfusion Consent
    bloodTransfusionConsent: {
      consentGiven: { type: Boolean },
      religiousObjections: { type: Boolean, default: false },
      alternativesDiscussed: { type: Boolean, default: false },
      risksExplained: { type: Boolean, default: false },
      consentDate: { type: Date },
      witnessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      signature: { type: String },
      notes: { type: String }
    },
    
    // Anesthesia Consent
    anesthesiaConsent: {
      consentGiven: { type: Boolean },
      anesthesiaType: { type: String, enum: ["General", "Regional", "Local", "Sedation"] },
      risksExplained: { type: Boolean, default: false },
      alternativesDiscussed: { type: Boolean, default: false },
      consentDate: { type: Date },
      anesthesiologist: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      witnessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      signature: { type: String },
      notes: { type: String }
    },
    
    // Research Participation Consent
    researchConsent: {
      participationOffered: { type: Boolean, default: false },
      consentGiven: { type: Boolean },
      studyName: { type: String },
      principalInvestigator: { type: String },
      risksExplained: { type: Boolean, default: false },
      benefitsExplained: { type: Boolean, default: false },
      withdrawalRights: { type: Boolean, default: false },
      consentDate: { type: Date },
      witnessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      signature: { type: String },
      notes: { type: String }
    },
    
    // Privacy and Information Sharing Consent
    privacyConsent: {
      hipaaAcknowledged: { type: Boolean, required: true },
      informationSharing: {
        familyMembers: { type: Boolean, default: false },
        emergencyContact: { type: Boolean, default: true },
        insuranceCompany: { type: Boolean, default: true },
        otherProviders: { type: Boolean, default: true },
        researchPurposes: { type: Boolean, default: false }
      },
      consentDate: { type: Date, default: Date.now },
      witnessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      signature: { type: String }
    },
    
    // Advance Directives
    advanceDirectives: {
      hasAdvanceDirective: { type: Boolean, default: false },
      livingWill: { type: Boolean, default: false },
      dnrOrder: { type: Boolean, default: false },
      healthcarePowerOfAttorney: { type: Boolean, default: false },
      organDonor: { type: Boolean, default: false },
      documentLocation: { type: String },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      verifiedAt: { type: Date },
      notes: { type: String }
    },
    
    // Consent Status Tracking
    consentStatus: {
      overallStatus: { type: String, enum: ["Complete", "Partial", "Pending", "Refused"], default: "Pending" },
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      completedAt: { type: Date },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: { type: Date },
      lastUpdated: { type: Date, default: Date.now }
    },
    
    // Legal and Compliance
    legalCompliance: {
      patientRights: { type: Boolean, default: false },
      grievanceProcedure: { type: Boolean, default: false },
      financialResponsibility: { type: Boolean, default: false },
      visitationPolicy: { type: Boolean, default: false },
      dischargePlanning: { type: Boolean, default: false },
      interpreterServices: { type: Boolean, default: false },
      religiousServices: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

// Calculate overall consent status
TreatmentConsentSchema.methods.updateConsentStatus = function() {
  const requiredConsents = [
    this.generalConsent.consentGiven,
    this.privacyConsent.hipaaAcknowledged,
    this.legalCompliance.patientRights,
    this.legalCompliance.financialResponsibility
  ];

  const completedConsents = requiredConsents.filter(Boolean).length;

  if (completedConsents === requiredConsents.length) {
    this.consentStatus.overallStatus = "Complete";
  } else if (completedConsents > 0) {
    this.consentStatus.overallStatus = "Partial";
  } else {
    this.consentStatus.overallStatus = "Pending";
  }

  this.consentStatus.lastUpdated = new Date();
  return this.consentStatus.overallStatus;
};

export default mongoose.models.TreatmentConsent || mongoose.model("TreatmentConsent", TreatmentConsentSchema);