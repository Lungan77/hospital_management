import { connectDB } from "@/lib/mongodb";
import Bed from "@/models/Bed";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["nurse", "admin", "er", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { bedId, dischargeReason = "Discharged", dischargeNotes } = await req.json();

    const bed = await Bed.findById(bedId)
      .populate("currentPatient")
      .populate("wardId");
    
    if (!bed) {
      return Response.json({ error: "Bed not found" }, { status: 404 });
    }

    if (bed.status !== "Occupied" || !bed.currentPatient) {
      return Response.json({ error: "Bed is not occupied" }, { status: 400 });
    }

    const patient = bed.currentPatient;

    // Update occupancy history
    const currentOccupancy = bed.occupancyHistory.find(
      occ => occ.patientId.toString() === patient._id.toString() && !occ.dischargedAt
    );
    
    if (currentOccupancy) {
      currentOccupancy.dischargedAt = new Date();
      currentOccupancy.lengthOfStay = Math.round((new Date() - currentOccupancy.admittedAt) / (1000 * 60 * 60)); // hours
      currentOccupancy.dischargeReason = dischargeReason;
      currentOccupancy.notes = dischargeNotes;
    }

    // Update bed status - mark for cleaning
    bed.status = "Cleaning";
    bed.currentPatient = null;
    bed.housekeeping.cleaningStatus = "Needs Cleaning";
    bed.housekeeping.nextCleaningDue = new Date();
    await bed.save();

    // Update patient record
    await PatientAdmission.findByIdAndUpdate(patient._id, {
      status: "Discharged",
      dischargeTime: new Date(),
      dischargeNotes: dischargeNotes,
      dischargedBy: auth.session.user.id,
      assignedBed: null,
      assignedWard: null
    });

    // Update ward capacity
    await bed.wardId.updateCapacity();

    // Trigger housekeeping notification (in a real system, this would send notifications)
    console.log(`Housekeeping notification: Bed ${bed.bedNumber} needs cleaning after patient discharge`);

    return Response.json({ 
      message: `Patient ${patient.firstName} ${patient.lastName} discharged from bed ${bed.bedNumber}. Bed marked for cleaning.`,
      bed,
      patient: {
        name: `${patient.firstName} ${patient.lastName}`,
        patientId: patient.patientId,
        dischargedAt: new Date(),
        lengthOfStay: currentOccupancy?.lengthOfStay || 0
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error discharging patient:", error);
    return Response.json({ error: "Error discharging patient" }, { status: 500 });
  }
}