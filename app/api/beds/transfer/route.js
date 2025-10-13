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

    // Validate required fields
    if (!fromBedId || !toBedId || !reason) {
      return Response.json({ error: "Missing required fields: fromBedId, toBedId, and reason are required" }, { status: 400 });
    }

    // Prevent transferring to same bed
    if (fromBedId === toBedId) {
      return Response.json({ error: "Cannot transfer patient to the same bed" }, { status: 400 });
    }

    // Validate source bed
    const fromBed = await Bed.findById(fromBedId)
      .populate("currentPatient")
      .populate("wardId");
    if (!fromBed) {
      return Response.json({ error: "Source bed not found" }, { status: 404 });
    }

    if (fromBed.status !== "Occupied" || !fromBed.currentPatient) {
      return Response.json({ error: "Source bed is not occupied or has no patient assigned" }, { status: 400 });
    }

    // Validate destination bed
    const toBed = await Bed.findById(toBedId).populate("wardId");
    if (!toBed) {
      return Response.json({ error: "Destination bed not found" }, { status: 404 });
    }

    if (toBed.status !== "Available") {
      return Response.json({ error: `Destination bed is not available (Current status: ${toBed.status})` }, { status: 400 });
    }

    const patient = fromBed.currentPatient;
    const isWardTransfer = fromBed.wardId._id.toString() !== toBed.wardId._id.toString();

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
    const updateData = {
      assignedBed: toBed.bedNumber,
      assignedWard: toBed.wardId.wardName
    };

    await PatientAdmission.findByIdAndUpdate(patient._id, updateData);

    // Update ward capacities
    await fromBed.wardId.updateCapacity();
    if (fromBed.wardId._id.toString() !== toBed.wardId._id.toString()) {
      await toBed.wardId.updateCapacity();
    }

    const transferMessage = isWardTransfer
      ? `Patient ${patient.firstName} ${patient.lastName} transferred from ${fromBed.bedNumber} (${fromBed.wardId.wardName}) to ${toBed.bedNumber} (${toBed.wardId.wardName})`
      : `Patient ${patient.firstName} ${patient.lastName} transferred from ${fromBed.bedNumber} to ${toBed.bedNumber} within ${toBed.wardId.wardName}`;

    return Response.json({
      message: transferMessage,
      transfer: {
        from: {
          bed: fromBed.bedNumber,
          ward: fromBed.wardId.wardName
        },
        to: {
          bed: toBed.bedNumber,
          ward: toBed.wardId.wardName
        },
        patient: {
          id: patient._id,
          name: `${patient.firstName} ${patient.lastName}`,
          patientId: patient.patientId
        },
        reason,
        notes,
        isWardTransfer,
        transferredAt: new Date(),
        transferredBy: auth.session.user.id
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error transferring patient:", error);
    console.error("Error details:", error.message);
    return Response.json({
      error: "Error transferring patient",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}