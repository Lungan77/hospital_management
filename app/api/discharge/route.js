import { connectDB } from "@/lib/mongodb";
import DischargeSummary from "@/models/DischargeSummary";
import PatientAdmission from "@/models/PatientAdmission";
import Bed from "@/models/Bed";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const body = await req.json();

    const {
      patientAdmissionId,
      dischargeDate,
      dischargeTime,
      finalDiagnosis,
      secondaryDiagnoses,
      hospitalCourse,
      proceduresPerformed,
      investigationsResults,
      treatmentProvided,
      conditionAtDischarge,
      vitalSignsAtDischarge,
      dischargeMedications,
      dietaryInstructions,
      activityRestrictions,
      followUpCare,
      warningSignsToReport,
      patientEducation,
      caregiverInstructions,
      referrals,
      dischargeDestination,
      transportArrangements,
      complications,
      followUpInvestigations,
      clinicalNotes,
      additionalNotes
    } = body;

    if (!patientAdmissionId || !finalDiagnosis || !hospitalCourse || !conditionAtDischarge) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const patientAdmission = await PatientAdmission.findById(patientAdmissionId);
    if (!patientAdmission) {
      return Response.json({ error: "Patient admission not found" }, { status: 404 });
    }

    if (patientAdmission.assignedDoctor?.toString() !== auth.session.user.id) {
      return Response.json({ error: "Not authorized to discharge this patient" }, { status: 403 });
    }

    if (patientAdmission.status === "Discharged") {
      return Response.json({ error: "Patient already discharged" }, { status: 400 });
    }

    const admissionDate = new Date(patientAdmission.admissionDate);
    const dischargeDateTime = dischargeDate ? new Date(dischargeDate) : new Date();
    const lengthOfStay = Math.ceil((dischargeDateTime - admissionDate) / (1000 * 60 * 60 * 24));

    const dischargeSummary = new DischargeSummary({
      patientAdmissionId,
      dischargedBy: auth.session.user.id,
      dischargeDate: dischargeDateTime,
      dischargeTime: dischargeTime || new Date().toLocaleTimeString(),
      admissionDate: patientAdmission.admissionDate,
      lengthOfStay,
      reasonForAdmission: patientAdmission.reasonForAdmission,
      chiefComplaint: patientAdmission.chiefComplaint,
      admissionDiagnosis: patientAdmission.provisionalDiagnosis,
      finalDiagnosis,
      secondaryDiagnoses: secondaryDiagnoses || [],
      hospitalCourse,
      proceduresPerformed: proceduresPerformed || [],
      investigationsResults: investigationsResults || [],
      treatmentProvided: treatmentProvided || { medications: [], therapies: [], interventions: [] },
      conditionAtDischarge,
      vitalSignsAtDischarge: vitalSignsAtDischarge || {},
      dischargeMedications: dischargeMedications || [],
      dietaryInstructions,
      activityRestrictions,
      followUpCare: followUpCare || {},
      warningSignsToReport: warningSignsToReport || [],
      patientEducation,
      caregiverInstructions,
      referrals: referrals || [],
      dischargeDestination: dischargeDestination || "Home",
      transportArrangements,
      complications: complications || [],
      followUpInvestigations: followUpInvestigations || [],
      clinicalNotes,
      approvalStatus: "Approved",
      approvedBy: auth.session.user.id,
      approvedAt: new Date(),
      additionalNotes
    });

    await dischargeSummary.save();

    patientAdmission.status = "Discharged";
    patientAdmission.dischargeDate = dischargeDateTime;
    patientAdmission.dischargedBy = auth.session.user.id;
    await patientAdmission.save();

    if (patientAdmission.assignedBed) {
      await Bed.findByIdAndUpdate(
        patientAdmission.assignedBed,
        {
          status: "Needs Cleaning",
          currentPatient: null,
          lastOccupiedAt: new Date()
        }
      );
    }

    return Response.json({
      message: "Patient discharged successfully",
      dischargeSummary
    }, { status: 201 });
  } catch (error) {
    console.error("Error discharging patient:", error);
    return Response.json({ error: "Error discharging patient" }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const patientAdmissionId = searchParams.get("patientAdmissionId");

    let query = {};
    if (patientAdmissionId) {
      query.patientAdmissionId = patientAdmissionId;
    }

    const dischargeSummaries = await DischargeSummary.find(query)
      .populate("patientAdmissionId", "firstName lastName admissionNumber age gender")
      .populate("dischargedBy", "name title email")
      .populate("approvedBy", "name title")
      .sort({ createdAt: -1 });

    return Response.json({ dischargeSummaries }, { status: 200 });
  } catch (error) {
    console.error("Error fetching discharge summaries:", error);
    return Response.json({ error: "Error fetching discharge summaries" }, { status: 500 });
  }
}
