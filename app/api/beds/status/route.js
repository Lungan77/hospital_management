import { connectDB } from "@/lib/mongodb";
import Bed from "@/models/Bed";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "admin", "er", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { bedId, status, cleaningType, maintenanceNotes } = await req.json();

    const bed = await Bed.findById(bedId).populate("wardId");
    if (!bed) {
      return Response.json({ error: "Bed not found" }, { status: 404 });
    }

    // Prevent setting status to Occupied without a patient
    if (status === "Occupied" && !bed.currentPatient) {
      return Response.json({
        error: "Cannot mark bed as Occupied without assigning a patient. Please use the bed assignment feature."
      }, { status: 400 });
    }

    // Prevent changing status if bed is occupied
    if (bed.status === "Occupied" && bed.currentPatient && status !== "Occupied") {
      return Response.json({
        error: "Cannot change status of occupied bed. Please discharge the patient first."
      }, { status: 400 });
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
    console.error("Error details:", error.message);
    return Response.json({
      error: "Error updating bed status",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}