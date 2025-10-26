import mongoose from "mongoose";

const nutritionalAssessmentSchema = new mongoose.Schema(
  {
    patientAdmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Emergency",
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assessmentDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    anthropometricData: {
      height: {
        value: Number,
        unit: { type: String, default: "cm" }
      },
      weight: {
        value: Number,
        unit: { type: String, default: "kg" }
      },
      bmi: Number,
      idealBodyWeight: Number,
      percentIdealBodyWeight: Number,
      recentWeightChange: {
        amount: Number,
        timeframe: String,
        significance: { type: String, enum: ["None", "Mild", "Moderate", "Severe"] }
      },
      midArmCircumference: Number,
      tricepSkinfold: Number
    },
    biochemicalData: {
      albumin: Number,
      prealbumin: Number,
      totalProtein: Number,
      hemoglobin: Number,
      hematocrit: Number,
      glucose: Number,
      cholesterol: Number,
      triglycerides: Number,
      electrolytes: {
        sodium: Number,
        potassium: Number,
        chloride: Number,
        calcium: Number
      },
      vitaminLevels: {
        vitaminD: Number,
        vitaminB12: Number,
        folate: Number,
        iron: Number
      }
    },
    clinicalData: {
      diagnosis: String,
      medicalHistory: [String],
      currentMedications: [String],
      surgicalHistory: [String],
      functionalStatus: {
        type: String,
        enum: ["Independent", "Requires Assistance", "Dependent", "Bedridden"]
      },
      pressureUlcers: Boolean,
      edema: Boolean,
      dehydration: Boolean,
      malnutritionSigns: [String]
    },
    dietaryHistory: {
      usualIntake: {
        breakfast: String,
        lunch: String,
        dinner: String,
        snacks: String
      },
      appetiteLevel: {
        type: String,
        enum: ["Poor", "Fair", "Good", "Excellent"]
      },
      recentIntakeChanges: String,
      difficultyChewing: Boolean,
      difficultySwallowing: Boolean,
      nauseaVomiting: Boolean,
      diarrhea: Boolean,
      constipation: Boolean,
      foodAllergies: [String],
      foodIntolerances: [String],
      culturalPreferences: [String],
      religiousRestrictions: [String],
      supplementsUsed: [String]
    },
    nutritionalRisk: {
      screeningTool: {
        type: String,
        enum: ["MUST", "NRS-2002", "MNA", "SGA", "Custom"]
      },
      score: Number,
      riskLevel: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        required: true
      },
      riskFactors: [String]
    },
    nutritionalDiagnosis: [{
      problem: String,
      etiology: String,
      signsSymptoms: String,
      priority: { type: String, enum: ["High", "Medium", "Low"] }
    }],
    nutritionalGoals: [{
      goal: String,
      targetDate: Date,
      status: { type: String, enum: ["Not Started", "In Progress", "Achieved", "Modified"], default: "Not Started" },
      progress: String
    }],
    interventions: [{
      intervention: String,
      type: { type: String, enum: ["Diet Modification", "Supplementation", "Enteral Nutrition", "Parenteral Nutrition", "Education"] },
      rationale: String,
      startDate: Date,
      status: { type: String, enum: ["Active", "Completed", "Discontinued"], default: "Active" }
    }],
    energyProteinRequirements: {
      estimatedEnergyRequirement: {
        value: Number,
        unit: { type: String, default: "kcal/day" },
        method: String
      },
      estimatedProteinRequirement: {
        value: Number,
        unit: { type: String, default: "g/day" },
        method: String
      },
      fluidRequirement: {
        value: Number,
        unit: { type: String, default: "ml/day" }
      }
    },
    recommendedDietType: {
      type: String,
      enum: [
        "Regular",
        "Soft",
        "Liquid",
        "Full Liquid",
        "Clear Liquid",
        "Pureed",
        "Low Sodium",
        "Low Fat",
        "Diabetic",
        "Renal",
        "Cardiac",
        "High Protein",
        "Low Protein",
        "Gluten Free",
        "Vegetarian",
        "Vegan",
        "NPO",
        "Enteral Nutrition",
        "Parenteral Nutrition",
        "Custom"
      ]
    },
    recommendedTexture: {
      type: String,
      enum: ["Regular", "Minced", "Pureed", "Liquid"]
    },
    recommendedFluidConsistency: {
      type: String,
      enum: ["Thin", "Nectar Thick", "Honey Thick", "Pudding Thick", "Not Applicable"]
    },
    monitoringPlan: {
      frequency: String,
      parametersToMonitor: [String],
      nextAssessmentDate: Date
    },
    educationProvided: [{
      topic: String,
      materials: String,
      understandingLevel: { type: String, enum: ["Poor", "Fair", "Good", "Excellent"] }
    }],
    dieticianNotes: String,
    recommendationsForTeam: String,
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["Initial", "Follow-up", "Discharge"],
      default: "Initial"
    },
    followUpRequired: {
      type: Boolean,
      default: true
    },
    followUpDate: Date
  },
  {
    timestamps: true
  }
);

nutritionalAssessmentSchema.index({ patientAdmissionId: 1, assessmentDate: -1 });
nutritionalAssessmentSchema.index({ patientId: 1 });
nutritionalAssessmentSchema.index({ assessedBy: 1 });
nutritionalAssessmentSchema.index({ status: 1 });

const NutritionalAssessment = mongoose.models.NutritionalAssessment ||
  mongoose.model("NutritionalAssessment", nutritionalAssessmentSchema);

export default NutritionalAssessment;
