import { connectDB } from "@/lib/mongodb";
import PatientAdmission from "@/models/PatientAdmission";
import DailyAssessment from "@/models/DailyAssessment";
import AdmittedPatientTreatmentPlan from "@/models/AdmittedPatientTreatmentPlan";
import Medication from "@/models/Medication";
import Procedure from "@/models/Procedure";
import Vitals from "@/models/Vitals";
import DischargeSummary from "@/models/DischargeSummary";
import TestOrder from "@/models/TestOrder";
import TestResult from "@/models/TestResult";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "er", "admin", "receptionist"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { patientId } = params;

    const patient = await PatientAdmission.findById(patientId);
    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    const dailyAssessments = await DailyAssessment.find({ patientAdmissionId: patientId })
      .sort({ assessmentDate: -1 })
      .populate("assessedBy", "firstName lastName");

    const treatmentPlans = await AdmittedPatientTreatmentPlan.find({ patientAdmissionId: patientId })
      .sort({ createdAt: -1 })
      .populate("doctorId", "firstName lastName");

    const medications = await Medication.find({ patientAdmissionId: patientId })
      .sort({ createdAt: -1 });

    const procedures = await Procedure.find({ patientAdmissionId: patientId })
      .sort({ scheduledDate: -1 });

    const vitals = await Vitals.find({ patientId: patientId })
      .sort({ timestamp: -1 });

    const dischargeSummary = await DischargeSummary.findOne({ patientAdmissionId: patientId })
      .populate("dischargedBy", "firstName lastName");

    const testOrders = await TestOrder.find({ patientId: patientId })
      .sort({ createdAt: -1 })
      .populate("orderedBy", "firstName lastName");

    const testResults = await TestResult.find({ patientId: patientId })
      .sort({ resultDate: -1 })
      .populate("approvedBy", "firstName lastName");

    const fullRecord = {
      patient,
      dailyAssessments,
      treatmentPlans,
      medications,
      procedures,
      vitals,
      dischargeSummary,
      testOrders,
      testResults,
    };

    return Response.json({ record: fullRecord }, { status: 200 });
  } catch (error) {
    console.error("Error fetching full patient record:", error);
    return Response.json({
      error: "Failed to fetch full patient record",
      details: error.message
    }, { status: 500 });
  }
}
