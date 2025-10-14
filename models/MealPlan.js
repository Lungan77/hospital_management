import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema(
  {
    patientAdmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Emergency",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    admissionNumber: {
      type: String,
      required: true,
    },
    planDate: {
      type: Date,
      required: true,
    },
    dietType: {
      type: String,
      required: true,
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
        "NPO (Nothing by Mouth)",
        "Custom"
      ],
    },
    meals: {
      breakfast: {
        items: [String],
        time: String,
        specialInstructions: String,
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: Date,
        deliveredBy: String,
      },
      lunch: {
        items: [String],
        time: String,
        specialInstructions: String,
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: Date,
        deliveredBy: String,
      },
      dinner: {
        items: [String],
        time: String,
        specialInstructions: String,
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: Date,
        deliveredBy: String,
      },
      snacks: [
        {
          items: [String],
          time: String,
          delivered: {
            type: Boolean,
            default: false,
          },
          deliveredAt: Date,
          deliveredBy: String,
        }
      ],
    },
    restrictions: {
      allergies: [String],
      intolerances: [String],
      culturalRestrictions: [String],
      religiousRestrictions: [String],
      dislikes: [String],
    },
    nutritionalRequirements: {
      calories: String,
      protein: String,
      carbohydrates: String,
      fat: String,
      fiber: String,
      sodium: String,
      fluids: String,
      otherRequirements: String,
    },
    texture: {
      type: String,
      enum: ["Regular", "Minced", "Pureed", "Liquid"],
      default: "Regular",
    },
    fluidConsistency: {
      type: String,
      enum: ["Thin", "Nectar Thick", "Honey Thick", "Pudding Thick", "Not Applicable"],
      default: "Not Applicable",
    },
    feedingMethod: {
      type: String,
      enum: ["Oral", "NG Tube", "PEG Tube", "TPN", "IV Nutrition"],
      default: "Oral",
    },
    assistanceRequired: {
      type: Boolean,
      default: false,
    },
    assistanceLevel: {
      type: String,
      enum: ["Independent", "Setup Only", "Supervision", "Partial Assistance", "Full Assistance"],
      default: "Independent",
    },
    medicalConditions: [String],
    medications: [String],
    dieticianConsulted: {
      type: Boolean,
      default: false,
    },
    dieticianName: String,
    dieticianNotes: String,
    consultationDate: Date,
    notes: String,
    specialConsiderations: String,
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled", "Modified"],
      default: "Active",
    },
    createdBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        required: true,
      },
    },
    lastModifiedBy: {
      userId: mongoose.Schema.Types.ObjectId,
      name: String,
      role: String,
    },
    lastModifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

mealPlanSchema.index({ patientAdmissionId: 1, planDate: -1 });
mealPlanSchema.index({ admissionNumber: 1 });
mealPlanSchema.index({ status: 1 });
mealPlanSchema.index({ planDate: -1 });

const MealPlan = mongoose.models.MealPlan || mongoose.model("MealPlan", mealPlanSchema);

export default MealPlan;
