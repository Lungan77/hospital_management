import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Full Name
    title: { 
      type: String, 
      enum: ["Dr", "Mr", "Miss", "Mrs", "Prof", "None"], // Added "None"
      required: true, 
      default: "None" 
    }, // Title Enum
    email: { type: String, unique: true, required: true },
    idNumber: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    role: {
      type: String,
      enum: ["admin", "doctor", "nurse", "receptionist", "patient", "labtech", "dispatcher", "driver", "paramedic", "er", "ward_manager"],
      required: true
    },
    password: { type: String, required: true }, 
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
