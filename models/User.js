import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { 
      type: String, 
      enum: ["admin", "doctor", "nurse", "patient", "receptionist"], 
      default: "patient" 
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
