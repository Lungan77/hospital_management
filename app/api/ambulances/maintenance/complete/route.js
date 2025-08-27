import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { ambulanceId, actualCost, completionNotes } = await req.json();

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    // Update maintenance completion
    ambulance.lastMaintenance = new Date();
    ambulance.status = "Available"; // Return to service
    
    if (completionNotes) {
      ambulance.maintenanceNotes = completionNotes;
    }

    // Update the latest maintenance record if exists
    if (ambulance.maintenanceRecords && ambulance.maintenanceRecords.length > 0) {
      const latestRecord = ambulance.maintenanceRecords[ambulance.maintenanceRecords.length - 1];
      if (latestRecord.status === "Scheduled" || latestRecord.status === "In Progress") {
        latestRecord.status = "Completed";
        latestRecord.completedAt = new Date();
        latestRecord.actualCost = actualCost ? parseFloat(actualCost) : latestRecord.estimatedCost;
        latestRecord.completionNotes = completionNotes || "";
        latestRecord.completedBy = auth.session.user.id;
      }
    }

    await ambulance.save();

    return Response.json({ 
      message: "Maintenance marked as complete - ambulance returned to service",
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error completing maintenance:", error);
    return Response.json({ error: "Error completing maintenance" }, { status: 500 });
  }
}