import { connectDB } from "@/lib/mongodb";
import Bed from "@/models/Bed";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "admin", "er"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { bedId, status, cleaningType, maintenanceNotes } = await req.json();

    const bed = await Bed.findById(bedId).populate("wardId");
    if (!bed) {
      return Response.json({ error: "Bed not found" }, { status: 404 });
    }

    const previousStatus = bed.status;
    bed.status = status;

    // Handle status-specific updates
    switch (status) {
      case "Available":
        // Mark as clean and available
        bed.housekeeping.cleaningStatus = "Clean";
        bed.housekeeping.lastCleaned = new Date();
        bed.housekeeping.cleanedBy = auth.session.user.id;
        if (cleaningType) {
          bed.housekeeping.cleaningType = cleaningType;
        }
        break;
        
      case "Cleaning":
        bed.housekeeping.cleaningStatus = "In Progress";
        bed.housekeeping.nextCleaningDue = new Date();
        break;
        
      case "Maintenance":
        bed.maintenance.lastMaintenance = new Date();
        if (maintenanceNotes) {
          bed.maintenance.maintenanceNotes = maintenanceNotes;
          bed.maintenance.maintenanceHistory.push({
            type: "Scheduled Maintenance",
            description: maintenanceNotes,
            performedBy: auth.session.user.id
          });
        }
        break;
        
      case "Out of Service":
        // Add alert for out of service bed
        bed.alerts.push({
          type: "Safety",
          message: `Bed ${bed.bedNumber} taken out of service`,
          severity: "High",
          createdBy: auth.session.user.id
        });
        break;
    }

    await bed.save();

    // Update ward capacity
    await bed.wardId.updateCapacity();

    return Response.json({ 
      message: `Bed ${bed.bedNumber} status updated from ${previousStatus} to ${status}`,
      bed 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating bed status:", error);
    return Response.json({ error: "Error updating bed status" }, { status: 500 });
  }
}