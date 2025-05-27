import mongoose from "mongoose";

const doctorFeedbackSchema = new mongoose.Schema(
  {
    testResultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabTestResult", // Update as needed
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Doctor"
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
      description: "Short summary or clinical interpretation of the result",
    },
    recommendations: {
      type: String,
      trim: true,
      description: "Follow-up steps or suggestions for further action",
    },
    urgencyLevel: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
      default: "low",
      description: "Doctor's assessment of result urgency",
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
      required: function () {
        return this.followUpRequired;
      },
    },
    visibility: {
      type: String,
      enum: ["doctor-only", "patient-visible"],
      default: "patient-visible",
      description: "Controls who can view this feedback",
    },
  },
  { timestamps: true }
);

export default mongoose.models.DoctorFeedback ||
  mongoose.model("DoctorFeedback", doctorFeedbackSchema);
