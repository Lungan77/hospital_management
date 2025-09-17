import mongoose from "mongoose";

const BedSchema = new mongoose.Schema(
  {
    bedNumber: { type: String, required: true, unique: true },
    wardId: { type: mongoose.Schema.Types.ObjectId, ref: "Ward", required: true },
    bedType: { 
      type: String, 
      enum: ["Standard", "ICU", "Isolation", "Pediatric", "Maternity", "Emergency", "Surgery Recovery"], 
      required: true 
    },
    
    // Current Status
    status: { 
      type: String, 
      enum: ["Available", "Occupied", "Reserved", "Cleaning", "Maintenance", "Out of Service"], 
      default: "Available" 
    },
    
    // Current Patient Assignment
    currentPatient: { type: mongoose.Schema.Types.ObjectId, ref: "PatientAdmission" },
    assignedAt: { type: Date },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // Bed Features and Equipment
    features: [{
      name: { type: String, required: true }, // e.g., "Oxygen Outlet", "Cardiac Monitor"
      available: { type: Boolean, default: true },
      lastChecked: { type: Date },
      notes: { type: String }
    }],
    
    // Housekeeping Information
    housekeeping: {
      lastCleaned: { type: Date },
      cleanedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      cleaningType: { type: String, enum: ["Standard", "Deep Clean", "Isolation", "Terminal"], default: "Standard" },
      cleaningNotes: { type: String },
      cleaningDuration: { type: Number }, // minutes
      nextCleaningDue: { type: Date },
      cleaningStatus: { type: String, enum: ["Clean", "Needs Cleaning", "In Progress"], default: "Clean" }
    },
    
    // Maintenance Information
    maintenance: {
      lastMaintenance: { type: Date },
      nextMaintenance: { type: Date },
      maintenanceNotes: { type: String },
      maintenanceHistory: [{
        type: { type: String, required: true },
        description: { type: String },
        performedAt: { type: Date, default: Date.now },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        cost: { type: Number, default: 0 },
        notes: { type: String }
      }]
    },
    
    // Occupancy History
    occupancyHistory: [{
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientAdmission" },
      admittedAt: { type: Date },
      dischargedAt: { type: Date },
      lengthOfStay: { type: Number }, // hours
      dischargeReason: { type: String, enum: ["Discharged", "Transferred", "Deceased", "AMA"] },
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      notes: { type: String }
    }],
    
    // Bed Configuration
    location: {
      floor: { type: Number, required: true },
      room: { type: String, required: true },
      position: { type: String }, // e.g., "A", "B" for multi-bed rooms
      coordinates: {
        x: { type: Number },
        y: { type: Number }
      }
    },
    
    // Alerts and Notifications
    alerts: [{
      type: { type: String, enum: ["Maintenance", "Cleaning", "Safety", "Equipment"], required: true },
      message: { type: String, required: true },
      severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      resolvedAt: { type: Date },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],
    
    // Bed Specifications
    specifications: {
      maxWeight: { type: Number, default: 200 }, // kg
      electricalOutlets: { type: Number, default: 2 },
      oxygenOutlet: { type: Boolean, default: true },
      suctionOutlet: { type: Boolean, default: false },
      nursCallSystem: { type: Boolean, default: true },
      bedSideTable: { type: Boolean, default: true },
      chair: { type: Boolean, default: true },
      privacy: { type: String, enum: ["Private", "Semi-Private", "Shared"], default: "Shared" }
    },
    
    // System Information
    isActive: { type: Boolean, default: true },
    notes: { type: String }
  },
  { timestamps: true }
);

// Generate bed number if not provided
BedSchema.pre("save", function (next) {
  if (!this.bedNumber) {
    const wardCode = this.wardId ? this.wardId.toString().slice(-4) : "0000";
    const bedNum = Math.floor(Math.random() * 999) + 1;
    this.bedNumber = `BED-${wardCode}-${bedNum.toString().padStart(3, '0')}`;
  }
  next();
});

export default mongoose.models.Bed || mongoose.model("Bed", BedSchema);