import mongoose from "mongoose";

const DischargeFeedbackSchema = new mongoose.Schema(
  {
    dischargeSummaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DischargeSummary",
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    overallExperience: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    treatmentQuality: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    staffProfessionalism: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    facilityCleaniness: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    communicationClarity: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    dischargeInstructions: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    wouldRecommend: {
      type: Boolean,
      required: true
    },
    comments: {
      type: String,
      maxlength: 1000
    },
    concerns: {
      type: String,
      maxlength: 1000
    },
    suggestions: {
      type: String,
      maxlength: 1000
    },
    followUpNeeded: {
      type: Boolean,
      default: false
    },
    contactForFollowUp: {
      type: Boolean,
      default: false
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.models.DischargeFeedback || mongoose.model("DischargeFeedback", DischargeFeedbackSchema);
