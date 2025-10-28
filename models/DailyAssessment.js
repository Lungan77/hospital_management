import mongoose from "mongoose";

const DailyAssessmentSchema = new mongoose.Schema(
  {
    patientAdmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientAdmission",
      required: true,
      index: true,
    },
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessorName: {
      type: String,
      required: true,
    },
    assessorRole: {
      type: String,
      required: true,
      enum: ["doctor", "nurse", "er", "admin"],
    },
    assessmentDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    generalCondition: {
      type: String,
      required: true,
      enum: ["Improving", "Stable", "Deteriorating", "Critical"],
    },
    consciousness: {
      type: String,
      enum: ["Alert", "Drowsy", "Confused", "Unconscious"],
    },
    painLevel: {
      type: Number,
      min: 0,
      max: 10,
    },
    vitalSigns: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number,
      weight: Number,
    },
    respiratoryStatus: {
      type: String,
      enum: ["Normal", "Labored", "Requires O2", "Ventilated"],
    },
    cardiovascularStatus: {
      type: String,
      enum: ["Normal", "Irregular", "Tachycardia", "Bradycardia"],
    },
    neurologicalStatus: {
      pupils: String,
      motorResponse: String,
      verbalResponse: String,
      glasgowComaScale: Number,
    },
    gastrointestinalStatus: {
      diet: String,
      appetite: String,
      bowelMovement: String,
      nausea: Boolean,
      vomiting: Boolean,
    },
    urinaryStatus: {
      output: String,
      color: String,
      catheterized: Boolean,
      incontinence: Boolean,
    },
    skinCondition: {
      integrity: String,
      pressureUlcers: Boolean,
      wounds: String,
      edema: String,
    },
    mobilityStatus: {
      type: String,
      enum: ["Independent", "Assisted", "Bedbound", "Wheelchair"],
    },
    sleepPattern: {
      hoursSlept: Number,
      quality: String,
      disturbances: String,
    },
    mentalStatus: {
      mood: String,
      anxiety: Boolean,
      orientation: String,
      behavior: String,
    },
    medicationCompliance: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Poor"],
    },
    symptomsReported: [String],
    interventionsProvided: [String],
    laboratoryFindings: String,
    imagingFindings: String,
    progressNotes: {
      type: String,
      required: true,
    },
    treatmentResponse: String,
    complications: String,
    planForNextDay: String,
    nursingCareProvided: [String],
    patientEducation: String,
    familyInvolvement: String,
    dischargeReadiness: {
      type: String,
      enum: ["Not Ready", "Improving", "Nearly Ready", "Ready"],
    },
    followUpRequired: Boolean,
    criticalIssues: [String],
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

DailyAssessmentSchema.index({ patientAdmissionId: 1, assessmentDate: -1 });
DailyAssessmentSchema.index({ assessedBy: 1 });

const DailyAssessment =
  mongoose.models.DailyAssessment ||
  mongoose.model("DailyAssessment", DailyAssessmentSchema);

export default DailyAssessment;
