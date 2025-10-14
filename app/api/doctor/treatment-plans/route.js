import { connectDB } from "@/lib/mongodb";
import AdmittedPatientTreatmentPlan from "@/models/AdmittedPatientTreatmentPlan";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";
import User from "@/models/User";

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
      return Response.json({ error: "Patient admission not found" }, { status: 404 });
    }

    if (patient.assignedDoctor?.toString() !== auth.session.user.id) {
      return Response.json({ error: "Unauthorized - not assigned to this patient" }, { status: 403 });
    }

    if (patient.status === "Discharged") {
      return Response.json({ error: "Cannot create treatment plan for discharged patient" }, { status: 400 });
    }

    const treatmentPlan = new AdmittedPatientTreatmentPlan({
      patientAdmissionId,
      doctorId: auth.session.user.id,
      treatmentGoals: treatmentGoals || "",
      medications: medications || [],
      procedures: procedures || [],
      diagnosticTests: diagnosticTests || [],
      consultations: consultations || [],
      nursingCare: nursingCare || [],
      dietaryRequirements: dietaryRequirements || {},
      activityRestrictions: activityRestrictions || "",
      monitoringRequirements: monitoringRequirements || [],
      expectedDuration: expectedDuration || "",
      staffTasks: staffTasks || [],
      notes: notes || "",
      status: "Active"
    });

    await treatmentPlan.save();

    if (patient.status === "Admitted") {
      patient.status = "In Treatment";
      await patient.save();
    }

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

    const treatmentPlans = await AdmittedPatientTreatmentPlan.find({ patientAdmissionId })
      .populate("doctorId", "name title email")
      .populate("patientAdmissionId", "firstName lastName admissionNumber")
      .populate("procedures.assignedTo", "name title")
      .populate("consultations.consultantId", "name title")
      .populate("nursingCare.assignedNurse", "name title")
      .populate("staffTasks.assignedTo", "name title")
      .populate("staffTasks.completedBy", "name title")
      .populate("reviewedBy", "name title")
      .sort({ createdAt: -1 });

    return Response.json({ treatmentPlans }, { status: 200 });
  } catch (error) {
    console.error("Error fetching treatment plans:", error);
    return Response.json({ error: "Error fetching treatment plans" }, { status: 500 });
  }
}
