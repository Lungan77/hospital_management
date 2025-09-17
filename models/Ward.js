import mongoose from "mongoose";

const WardSchema = new mongoose.Schema(
  {
    wardName: { type: String, required: true, unique: true },
    wardCode: { type: String, required: true, unique: true },
    wardType: { 
      type: String, 
      enum: ["Emergency", "ICU", "Medical", "Surgical", "Pediatric", "Maternity", "Isolation", "Recovery"], 
      required: true 
    },
    
    // Ward Location
    location: {
      building: { type: String, required: true },
      floor: { type: Number, required: true },
      wing: { type: String }, // e.g., "East Wing", "West Wing"
      description: { type: String }
    },
    
    // Capacity Information
    capacity: {
      totalBeds: { type: Number, required: true },
      availableBeds: { type: Number, default: 0 },
      occupiedBeds: { type: Number, default: 0 },
      reservedBeds: { type: Number, default: 0 },
      outOfServiceBeds: { type: Number, default: 0 }
    },
    
    // Staff Assignment
    staff: {
      wardManager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      headNurse: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      assignedNurses: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      assignedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      housekeepingStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    },
    
    // Ward Specifications
    specifications: {
      isolationCapable: { type: Boolean, default: false },
      oxygenSupply: { type: Boolean, default: true },
      suctionSystem: { type: Boolean, default: false },
      cardiacMonitoring: { type: Boolean, default: false },
      emergencyEquipment: { type: Boolean, default: false },
      visitorPolicy: { type: String, enum: ["Open", "Restricted", "No Visitors"], default: "Open" },
      ageRestriction: { type: String, enum: ["Adult", "Pediatric", "All Ages"], default: "All Ages" }
    },
    
    // Operating Hours and Policies
    operatingHours: {
      admissionHours: { type: String, default: "24/7" },
      visitorHours: { type: String, default: "08:00-20:00" },
      quietHours: { type: String, default: "22:00-06:00" }
    },
    
    // Ward Status
    wardStatus: { 
      type: String, 
      enum: ["Operational", "Limited Capacity", "Closed", "Emergency Only"], 
      default: "Operational" 
    },
    
    // Alerts and Notifications
    alerts: [{
      type: { type: String, enum: ["Capacity", "Staffing", "Equipment", "Safety"], required: true },
      message: { type: String, required: true },
      severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
      active: { type: Boolean, default: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      resolvedAt: { type: Date },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],
    
    // Performance Metrics
    metrics: {
      averageLengthOfStay: { type: Number, default: 0 }, // hours
      occupancyRate: { type: Number, default: 0 }, // percentage
      turnoverRate: { type: Number, default: 0 }, // beds per day
      patientSatisfaction: { type: Number, default: 0 }, // 1-5 scale
      lastUpdated: { type: Date, default: Date.now }
    },
    
    // System Information
    isActive: { type: Boolean, default: true },
    notes: { type: String }
  },
  { timestamps: true }
);

// Update capacity counts when beds change
WardSchema.methods.updateCapacity = async function() {
  const Bed = mongoose.model('Bed');
  const beds = await Bed.find({ wardId: this._id });
  
  this.capacity.totalBeds = beds.length;
  this.capacity.availableBeds = beds.filter(bed => bed.status === "Available").length;
  this.capacity.occupiedBeds = beds.filter(bed => bed.status === "Occupied").length;
  this.capacity.reservedBeds = beds.filter(bed => bed.status === "Reserved").length;
  this.capacity.outOfServiceBeds = beds.filter(bed => ["Cleaning", "Maintenance", "Out of Service"].includes(bed.status)).length;
  
  // Update occupancy rate
  this.metrics.occupancyRate = this.capacity.totalBeds > 0 ? 
    Math.round((this.capacity.occupiedBeds / this.capacity.totalBeds) * 100) : 0;
  this.metrics.lastUpdated = new Date();
  
  await this.save();
};

export default mongoose.models.Ward || mongoose.model("Ward", WardSchema);