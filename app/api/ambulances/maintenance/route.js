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
      cost, 
      performedBy, 
      nextMaintenanceDate,
      mileage 
    } = await req.json();

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    // Update maintenance information
    ambulance.lastMaintenance = new Date();
    ambulance.nextMaintenance = nextMaintenanceDate ? new Date(nextMaintenanceDate) : null;
    ambulance.maintenanceNotes = description;
    
    if (mileage) {
      ambulance.mileage = mileage;
    }

    // If ambulance was in maintenance, return to available
    if (ambulance.status === "Maintenance") {
      ambulance.status = "Available";
    }

    await ambulance.save();

    return Response.json({ 
      message: "Maintenance record updated successfully",
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating maintenance record:", error);
    return Response.json({ error: "Error updating maintenance record" }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Get ambulances that need maintenance
    const ambulances = await Ambulance.find({
      $or: [
        { nextMaintenance: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }, // Due within 7 days
        { nextMaintenance: { $lte: new Date() } } // Overdue
      ]
    }).sort({ nextMaintenance: 1 });

    return Response.json({ ambulances }, { status: 200 });
  } catch (error) {
    console.error("Error fetching maintenance schedule:", error);
    return Response.json({ error: "Error fetching maintenance schedule" }, { status: 500 });
  }
}