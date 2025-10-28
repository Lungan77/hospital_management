import { connectDB } from "@/lib/mongodb";
import DischargeSummary from "@/models/DischargeSummary";
import PatientAdmission from "@/models/PatientAdmission";
import AdmittedPatientTreatmentPlan from "@/models/AdmittedPatientTreatmentPlan";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const data = await req.json();
    const { patientAdmissionId } = data;

    const patient = await PatientAdmission.findById(patientAdmissionId);
    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    const treatmentPlan = await AdmittedPatientTreatmentPlan.findOne({
      patientAdmissionId,
      status: "Active",
    }).sort({ createdAt: -1 });

    const lengthOfStay = patient.admissionDate
      ? Math.ceil((new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60 * 24))
      : 0;

    const dischargeSummary = await DischargeSummary.create({
      ...data,
      dischargedBy: auth.session.user.id,
      admissionDate: patient.arrivalTime,
      lengthOfStay,
      reasonForAdmission: patient.chiefComplaint,
      chiefComplaint: patient.chiefComplaint,
    });

    patient.status = "Discharged";
    patient.dischargeDate = new Date();
    await patient.save();

    if (treatmentPlan) {
      treatmentPlan.status = "Completed";
      await treatmentPlan.save();
    }

    return Response.json({ dischargeSummary }, { status: 201 });
  } catch (error) {
    console.error("Error generating discharge summary:", error);
    return Response.json({
      error: "Failed to generate discharge summary",
      details: error.message
    }, { status: 500 });
  }
}
