import { connectDB } from "@/lib/mongodb";
import Procedure from "@/models/Procedure";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const body = await req.json();

    const {
      patientAdmissionId,
      procedureName,
      procedureType,
      description,
      scheduledDate,
      scheduledTime,
      estimatedDuration,
      priority,
      location,
      room,
      performingPhysician,
      assistingStaff,
      preOpInstructions,
      postOpInstructions,
      requiredEquipment,
      requiredPreparation,
      notes
    } = body;

    if (!patientAdmissionId || !procedureName || !procedureType || !scheduledDate) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const patient = await PatientAdmission.findById(patientAdmissionId);
    if (!patient) {
      return Response.json({ error: "Patient admission not found" }, { status: 404 });
    }

    const isAuthorized =
      patient.assignedDoctor?.toString() === auth.session.user.id ||
      patient.assignedNurse?.toString() === auth.session.user.id;

    if (!isAuthorized) {
      return Response.json({ error: "Not authorized to schedule procedures for this patient" }, { status: 403 });
    }

    const procedure = new Procedure({
      patientAdmissionId,
      scheduledBy: auth.session.user.id,
      procedureName,
      procedureType,
      description,
      scheduledDate,
      scheduledTime,
      estimatedDuration,
      priority: priority || "Routine",
      location,
      room,
      performingPhysician,
      assistingStaff,
      preOpInstructions,
      postOpInstructions,
      requiredEquipment,
      requiredPreparation,
      notes,
      status: "Scheduled"
    });

    await procedure.save();

    return Response.json({
      message: "Procedure scheduled successfully",
      procedure
    }, { status: 201 });
  } catch (error) {
    console.error("Error scheduling procedure:", error);
    return Response.json({ error: "Error scheduling procedure" }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const patientAdmissionId = searchParams.get("patientAdmissionId");

    if (!patientAdmissionId) {
      return Response.json({ error: "Patient admission ID is required" }, { status: 400 });
    }

    const procedures = await Procedure.find({ patientAdmissionId })
      .populate("scheduledBy", "name title email")
      .populate("performingPhysician", "name title email")
      .populate("assistingStaff.staffId", "name title")
      .populate("performedBy", "name title")
      .populate("cancelledBy", "name title")
      .sort({ scheduledDate: 1 });

    return Response.json({ procedures }, { status: 200 });
  } catch (error) {
    console.error("Error fetching procedures:", error);
    return Response.json({ error: "Error fetching procedures" }, { status: 500 });
  }
}
