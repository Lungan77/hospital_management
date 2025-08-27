import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { 
      ambulanceId, 
      maintenanceType, 
      description, 
      scheduledDate,
      estimatedCost, 
      performedBy, 
      nextMaintenanceDate,
      mileage,
      priority,
      estimatedDuration,
      notes
    } = await req.json();

    if (!ambulanceId) {
      return Response.json({ error: "Ambulance ID is required" }, { status: 400 });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    // Create maintenance record
    const maintenanceRecord = {
      type: maintenanceType,
      description: description || `${maintenanceType} scheduled`,
      scheduledDate: new Date(scheduledDate),
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
      performedBy: performedBy || "TBD",
      priority: priority || "Medium",
      estimatedDuration: estimatedDuration || "TBD",
      notes: notes || "",
      status: "Scheduled",
      createdAt: new Date(),
      createdBy: auth.session.user.id
    };

    // Initialize maintenance records array if it doesn't exist
    if (!ambulance.maintenanceRecords) {
      ambulance.maintenanceRecords = [];
    }

    // Add maintenance record
    ambulance.maintenanceRecords.push(maintenanceRecord);

    // Update maintenance information
    if (scheduledDate) {
      // If scheduled for today or past, mark as maintenance
      const schedDate = new Date(scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (schedDate <= today) {
        ambulance.status = "Maintenance";
      }
    }

    if (nextMaintenanceDate) {
      ambulance.nextMaintenance = new Date(nextMaintenanceDate);
    }
    
    if (mileage) {
      ambulance.mileage = parseInt(mileage);
    }

    ambulance.maintenanceNotes = description || `${maintenanceType} - ${new Date().toLocaleDateString()}`;

    await ambulance.save();

    return Response.json({ 
      message: "Maintenance scheduled successfully",
      ambulance,
      maintenanceRecord 
    }, { status: 200 });
  } catch (error) {
    console.error("Error scheduling maintenance:", error);
    return Response.json({ error: "Error scheduling maintenance" }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Get ambulances with maintenance information
    const ambulances = await Ambulance.find({})
      .select("callSign vehicleNumber type status lastMaintenance nextMaintenance mileage maintenanceNotes maintenanceRecords")
      .sort({ nextMaintenance: 1 });

    // Get maintenance records from all ambulances
    const allRecords = [];
    ambulances.forEach(ambulance => {
      if (ambulance.maintenanceRecords) {
        ambulance.maintenanceRecords.forEach(record => {
          allRecords.push({
            ...record,
            ambulanceId: ambulance._id,
            callSign: ambulance.callSign,
            vehicleNumber: ambulance.vehicleNumber
          });
        });
      }
    });

    return Response.json({ 
      ambulances,
      records: allRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching maintenance data:", error);
    return Response.json({ error: "Error fetching maintenance data" }, { status: 500 });
  }
}