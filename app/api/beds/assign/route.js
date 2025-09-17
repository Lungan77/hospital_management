import { connectDB } from "@/lib/mongodb";
import Bed from "@/models/Bed";
import PatientAdmission from "@/models/PatientAdmission";
import Ward from "@/models/Ward";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "admin", "er"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { bedId, patientId } = await req.json();

    // Validate bed exists and is available
    const bed = await Bed.findById(bedId).populate("wardId");
    if (!bed) {
      return Response.json({ error: "Bed not found" }, { status: 404 });
    }

    if (bed.status !== "Available") {
      return Response.json({ error: "Bed is not available" }, { status: 400 });
    }

    // Validate patient exists and is not already assigned
    const patient = await PatientAdmission.findById(patientId);
    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    if (patient.assignedBed) {
      return Response.json({ error: "Patient is already assigned to a bed" }, { status: 400 });
    }

    // Assign bed to patient
    bed.status = "Occupied";
    bed.currentPatient = patientId;
    bed.assignedAt = new Date();
    bed.assignedBy = auth.session.user.id;
    
    // Add to occupancy history
    bed.occupancyHistory.push({
      patientId: patientId,
      admittedAt: new Date(),
      assignedBy: auth.session.user.id
    });

    await bed.save();

    // Update patient record
    patient.assignedBed = bed.bedNumber;
    patient.assignedWard = bed.wardId.wardName;
    patient.status = "In Treatment";
    await patient.save();

    // Update ward capacity
    await bed.wardId.updateCapacity();

    return Response.json({ 
      message: `Patient ${patient.firstName} ${patient.lastName} assigned to bed ${bed.bedNumber}`,
      bed,
      patient 
    }, { status: 200 });
  } catch (error) {
    console.error("Error assigning bed:", error);
    return Response.json({ error: "Error assigning bed" }, { status: 500 });
  }
}