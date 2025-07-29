import mongoose from "mongoose";

const EmergencySchema = new mongoose.Schema(
  {
    incidentNumber: { type: String, required: true, unique: true },
    type: { 
      type: String, 
      enum: ["Medical", "Trauma", "Cardiac", "Respiratory", "Psychiatric", "Other"], 
      required: true 
    },
    priority: { 
      type: String, 
      enum: ["Critical", "High", "Medium", "Low"], 
      required: true, 
      default: "Medium" 
    },
    status: { 
      type: String, 
      enum: ["Reported", "Dispatched", "En Route", "On Scene", "Transporting", "Completed", "Cancelled"], 
      default: "Reported" 
    },
    
    // Caller Information
    callerName: { type: String, required: true },
    callerPhone: { type: String, required: true },
    callerRelation: { type: String }, // Relationship to patient
    
    // Patient Information
    patientName: { type: String },
    patientAge: { type: Number },
    patientGender: { type: String, enum: ["Male", "Female", "Other"] },
    patientCondition: { type: String, required: true },
    
    // Location Information
    address: { type: String, required: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    landmarks: { type: String },
    
    // Dispatch Information
    dispatchedAt: { type: Date },
    dispatcherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ambulanceId: { type: mongoose.Schema.Types.ObjectId, ref: "Ambulance" },
    estimatedArrival: { type: Date },
    
    // Response Information
    respondedAt: { type: Date },
    onSceneAt: { type: Date },
    transportStartedAt: { type: Date },
    arrivedHospitalAt: { type: Date },
    completedAt: { type: Date },
    
    // Medical Information
    chiefComplaint: { type: String },
    vitalSigns: [{
      timestamp: { type: Date, default: Date.now },
      bloodPressure: { type: String },
      heartRate: { type: Number },
      respiratoryRate: { type: Number },
      temperature: { type: Number },
      oxygenSaturation: { type: Number },
      glucoseLevel: { type: Number },
      painScale: { type: Number, min: 0, max: 10 },
      recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],
    
    treatments: [{
      timestamp: { type: Date, default: Date.now },
      treatment: { type: String, required: true },
      medication: { type: String },
      dosage: { type: String },
      route: { type: String },
      response: { type: String },
      administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],
    
    // Hospital Information
    destinationHospital: { type: String },
    hospitalNotified: { type: Boolean, default: false },
    hospitalNotifiedAt: { type: Date },
    
    // Additional Information
    notes: { type: String },
    weatherConditions: { type: String },
    trafficConditions: { type: String },
    
    // System Information
    reportedBy: { type: String, enum: ["Phone", "Online", "Radio", "Walk-in"], default: "Phone" },
    reportedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Generate incident number before saving
EmergencySchema.pre("save", function (next) {
  if (!this.incidentNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = Date.now().toString().slice(-4);
    this.incidentNumber = `EMG-${year}${month}${day}-${time}`;
  }
  next();
});

export default mongoose.models.Emergency || mongoose.model("Emergency", EmergencySchema);