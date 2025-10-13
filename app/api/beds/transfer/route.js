import { connectDB } from "@/lib/mongodb";
import Bed from "@/models/Bed";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "admin", "er", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { fromBedId, toBedId, reason, notes } = await req.json();

    // Validate source bed
    const fromBed = await Bed.findById(fromBedId)
      .populate("currentPatient")
      .populate("wardId");
    if (!fromBed) {
      return Response.json({ error: "Source bed not found" }, { status: 404 });
    }

    if (fromBed.status !== "Occupied" || !fromBed.currentPatient) {
      return Response.json({ error: "Source bed is not occupied" }, { status: 400 });
    }

    // Validate destination bed
    const toBed = await Bed.findById(toBedId).populate("wardId");
    if (!toBed) {
      return Response.json({ error: "Destination bed not found" }, { status: 404 });
    }

    if (toBed.status !== "Available") {
      return Response.json({ error: "Destination bed is not available" }, { status: 400 });
    }

    const patient = fromBed.currentPatient;

    // Update source bed - mark as needing cleaning
    const currentOccupancy = fromBed.occupancyHistory.find(
      occ => occ.patientId.toString() === patient._id.toString() && !occ.dischargedAt
    );
    
    if (currentOccupancy) {
      currentOccupancy.dischargedAt = new Date();
      currentOccupancy.lengthOfStay = Math.round((new Date() - currentOccupancy.admittedAt) / (1000 * 60 * 60)); // hours
      currentOccupancy.dischargeReason = "Transferred";
      currentOccupancy.notes = `Transferred to ${toBed.bedNumber}: ${reason}`;
    }

    fromBed.status = "Cleaning";
    fromBed.currentPatient = null;
    fromBed.housekeeping.cleaningStatus = "Needs Cleaning";
    fromBed.housekeeping.nextCleaningDue = new Date();
    await fromBed.save();

    // Update destination bed
    toBed.status = "Occupied";
    toBed.currentPatient = patient._id;
    toBed.assignedAt = new Date();
    toBed.assignedBy = auth.session.user.id;
    
    // Add to destination bed occupancy history
    toBed.occupancyHistory.push({
      patientId: patient._id,
      admittedAt: new Date(),
      assignedBy: auth.session.user.id,
      notes: `Transferred from ${fromBed.bedNumber}: ${reason}`
    });

    await toBed.save();

    // Update patient record
    await PatientAdmission.findByIdAndUpdate(patient._id, {
      assignedBed: toBed.bedNumber,
      assignedWard: toBed.wardId.wardName
    });

    // Update ward capacities
    await fromBed.wardId.updateCapacity();
    if (fromBed.wardId._id.toString() !== toBed.wardId._id.toString()) {
      await toBed.wardId.updateCapacity();
    }

    return Response.json({ 
      message: `Patient ${patient.firstName} ${patient.lastName} transferred from ${fromBed.bedNumber} to ${toBed.bedNumber}`,
      transfer: {
        from: fromBed.bedNumber,
        to: toBed.bedNumber,
        patient: `${patient.firstName} ${patient.lastName}`,
        reason,
        transferredAt: new Date()
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error transferring patient:", error);
    return Response.json({ error: "Error transferring patient" }, { status: 500 });
  }
}