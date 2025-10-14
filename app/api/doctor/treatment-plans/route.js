import { connectDB } from "@/lib/mongodb";
import TreatmentPlan from "@/models/TreatmentPlan";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const body = await req.json();

    const {
      patientAdmissionId,
      treatmentGoals,
      medications,
      procedures,
      diagnosticTests,
      consultations,
      nursingCare,
      dietaryRequirements,
      activityRestrictions,
      monitoringRequirements,
      expectedDuration,
      staffTasks,
      notes
    } = body;

    const patient = await PatientAdmission.findById(patientAdmissionId);
    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    if (patient.assignedDoctor?.toString() !== auth.session.user.id) {
      return Response.json({ error: "Unauthorized - not assigned to this patient" }, { status: 403 });
    }

    const treatmentPlan = new TreatmentPlan({
      patientAdmissionId,
      doctorId: auth.session.user.id,
      treatmentGoals,
      medications,
      procedures,
      diagnosticTests,
      consultations,
      nursingCare,
      dietaryRequirements,
      activityRestrictions,
      monitoringRequirements,
      expectedDuration,
      staffTasks,
      notes,
      status: "Active"
    });

    await treatmentPlan.save();

    patient.status = "In Treatment";
    await patient.save();

    return Response.json({
      message: "Treatment plan created successfully",
      treatmentPlan
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating treatment plan:", error);
    return Response.json({ error: "Error creating treatment plan" }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const url = new URL(req.url);
    const patientAdmissionId = url.searchParams.get("patientAdmissionId");

    if (!patientAdmissionId) {
      return Response.json({ error: "Patient admission ID is required" }, { status: 400 });
    }

    const treatmentPlans = await TreatmentPlan.find({ patientAdmissionId })
      .populate("doctorId", "firstName lastName")
      .populate("patientAdmissionId", "firstName lastName admissionNumber")
      .sort({ createdAt: -1 });

    return Response.json({ treatmentPlans }, { status: 200 });
  } catch (error) {
    console.error("Error fetching treatment plans:", error);
    return Response.json({ error: "Error fetching treatment plans" }, { status: 500 });
  }
}
