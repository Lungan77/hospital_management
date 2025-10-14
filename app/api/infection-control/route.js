import { connectDB } from "@/lib/mongodb";
import InfectionControl from "@/models/InfectionControl";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "ward_manager", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const body = await req.json();

    const {
      patientAdmissionId,
      infectionType,
      infectionCategory,
      isolationType,
      isolationRequired,
      specialWardRequired,
      riskLevel,
      symptoms,
      ppeRequired,
      notes,
      alerts
    } = body;

    if (!patientAdmissionId || !infectionType || !infectionCategory || !isolationType) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const patient = await PatientAdmission.findById(patientAdmissionId);
    if (!patient) {
      return Response.json({ error: "Patient admission not found" }, { status: 404 });
    }

    const infectionControl = new InfectionControl({
      patientAdmissionId,
      identifiedBy: auth.session.user.id,
      infectionType,
      infectionCategory,
      isolationType,
      isolationRequired: isolationRequired !== undefined ? isolationRequired : true,
      specialWardRequired: specialWardRequired || false,
      riskLevel: riskLevel || "Medium",
      symptoms: symptoms || [],
      ppeRequired: ppeRequired || [],
      notes,
      alerts: alerts || [],
      status: "Active"
    });

    await infectionControl.save();

    return Response.json({
      message: "Infection control case created successfully",
      infectionControl
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating infection control case:", error);
    return Response.json({ error: "Error creating infection control case" }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "ward_manager", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const patientAdmissionId = searchParams.get("patientAdmissionId");
    const status = searchParams.get("status");
    const riskLevel = searchParams.get("riskLevel");
    const isolationType = searchParams.get("isolationType");

    let query = {};

    if (patientAdmissionId) {
      query.patientAdmissionId = patientAdmissionId;
    }

    if (status) {
      query.status = status;
    }

    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    if (isolationType) {
      query.isolationType = isolationType;
    }

    const cases = await InfectionControl.find(query)
      .populate("patientAdmissionId", "firstName lastName admissionNumber chiefComplaint status")
      .populate("identifiedBy", "name title email")
      .populate("assignedWard", "name type capacity")
      .populate("wardAssignedBy", "name title")
      .populate("protocols.implementedBy", "name title")
      .populate("contacts.contactId", "name email")
      .sort({ createdAt: -1 });

    const stats = {
      total: cases.length,
      active: cases.filter(c => c.status === "Active").length,
      monitoring: cases.filter(c => c.status === "Monitoring").length,
      resolved: cases.filter(c => c.status === "Resolved").length,
      critical: cases.filter(c => c.riskLevel === "Critical").length,
      high: cases.filter(c => c.riskLevel === "High").length,
      requiresIsolation: cases.filter(c => c.isolationRequired).length,
      requiresSpecialWard: cases.filter(c => c.specialWardRequired).length
    };

    return Response.json({ cases, stats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching infection control cases:", error);
    return Response.json({ error: "Error fetching infection control cases" }, { status: 500 });
  }
}
