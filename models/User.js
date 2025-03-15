import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Full Name
    title: { 
      type: String, 
      enum: ["Dr.", "Nurse", "Mr.", "Ms.", "Mrs.", "Prof.", "None"], 
      required: true, 
      default: "None" 
    }, // Title Enum
    email: { type: String, unique: true, required: true },
    Id_number: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    role: { type: String, enum: ["doctor", "nurse", "receptionist", "patient"], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
