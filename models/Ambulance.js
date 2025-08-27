import mongoose from "mongoose";

const AmbulanceSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true },
    callSign: { type: String, required: true, unique: true },
    type: { 
      type: String, 
      enum: ["Basic Life Support", "Advanced Life Support", "Critical Care", "Rescue"], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["Available", "Dispatched", "En Route", "On Scene", "Transporting", "Out of Service", "Maintenance"], 
      default: "Available" 
    },
    
    // Crew Information
    crew: [{
      memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      role: { type: String, enum: ["Paramedic", "EMT", "Driver"], required: true },
      certificationLevel: { type: String }
    }],
    
    // Location Information
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
      lastUpdated: { type: Date, default: Date.now }
    },
    
    // Equipment Information
    equipment: [{
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      minQuantity: { type: Number, default: 1 },
      status: { type: String, enum: ["Operational", "Needs Maintenance", "Out of Order"], default: "Operational" },
      lastChecked: { type: Date },
      location: { type: String },
      expiryDate: { type: Date },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],
    
    // Current Assignment
    currentEmergency: { type: mongoose.Schema.Types.ObjectId, ref: "Emergency" },
    
    // Vehicle Information
    make: { type: String },
    model: { type: String },
    year: { type: Number },
    licensePlate: { type: String },
    mileage: { type: Number },
    fuelLevel: { type: Number, min: 0, max: 100 },
    
    // Maintenance Information
    lastMaintenance: { type: Date },
    nextMaintenance: { type: Date },
    maintenanceNotes: { type: String },
    
    // Enhanced Maintenance Records
    maintenanceRecords: [{
      type: { type: String, required: true }, // e.g., "Routine Service", "Oil Change"
      description: { type: String },
      scheduledDate: { type: Date },
      completedAt: { type: Date },
      estimatedCost: { type: Number, default: 0 },
      actualCost: { type: Number },
      performedBy: { type: String }, // Technician or company name
      priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
      status: { type: String, enum: ["Scheduled", "In Progress", "Completed", "Cancelled"], default: "Scheduled" },
      estimatedDuration: { type: String },
      notes: { type: String },
      completionNotes: { type: String },
      createdAt: { type: Date, default: Date.now },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      partsUsed: [{
        partName: { type: String },
        partNumber: { type: String },
        quantity: { type: Number, default: 1 },
        cost: { type: Number, default: 0 }
      }],
      workPerformed: [{ type: String }], // Array of work items completed
      nextServiceMileage: { type: Number }, // Mileage for next service
      warrantyInfo: { type: String }
    }],
    
    // Vehicle Check Records
    vehicleChecks: [{
      checkItems: { type: Object }, // Stores the check results
      notes: { type: String },
      completedAt: { type: Date },
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      criticalFailures: { type: Number, default: 0 },
      passed: { type: Boolean, default: true },
      checkType: { type: String, enum: ["Pre-Shift", "Post-Shift", "Maintenance", "Emergency"], default: "Pre-Shift" }
    }],
    lastVehicleCheck: { type: Date },
    
    // Performance Metrics
    performanceMetrics: {
      totalMileage: { type: Number, default: 0 },
      totalResponses: { type: Number, default: 0 },
      avgResponseTime: { type: Number, default: 0 },
      safetyScore: { type: Number, default: 100, min: 0, max: 100 },
      fuelEfficiency: { type: Number, default: 0 }, // km per liter
      lastUpdated: { type: Date, default: Date.now }
    },
    
    // Base Station
    baseStation: { type: String, required: true },
    
    // Communication
    radioChannel: { type: String },
    gpsDeviceId: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Ambulance || mongoose.model("Ambulance", AmbulanceSchema);