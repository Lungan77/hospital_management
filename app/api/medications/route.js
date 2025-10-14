import { connectDB } from "@/lib/mongodb";
import Medication from "@/models/Medication";
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
      medicationName,
      dosage,
      route,
      frequency,
      duration,
      startDate,
      endDate,
      instructions,
      indication,
      notes
    } = body;

    if (!patientAdmissionId || !medicationName || !dosage || !route || !frequency) {
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
      return Response.json({ error: "Not authorized to prescribe for this patient" }, { status: 403 });
    }

    const medication = new Medication({
      patientAdmissionId,
      prescribedBy: auth.session.user.id,
      medicationName,
      dosage,
      route,
      frequency,
      duration,
      startDate: startDate || new Date(),
      endDate,
      instructions,
      indication,
      notes,
      status: "Active"
    });

    await medication.save();

    return Response.json({
      message: "Medication prescribed successfully",
      medication
    }, { status: 201 });
  } catch (error) {
    console.error("Error prescribing medication:", error);
    return Response.json({ error: "Error prescribing medication" }, { status: 500 });
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

    const medications = await Medication.find({ patientAdmissionId })
      .populate("prescribedBy", "name title email")
      .populate("administrations.administeredBy", "name title")
      .populate("discontinuedBy", "name title")
      .sort({ createdAt: -1 });

    return Response.json({ medications }, { status: 200 });
  } catch (error) {
    console.error("Error fetching medications:", error);
    return Response.json({ error: "Error fetching medications" }, { status: 500 });
  }
}
