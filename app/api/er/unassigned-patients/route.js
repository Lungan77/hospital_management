import { connectDB } from "@/lib/mongodb";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["er", "doctor", "nurse", "ward_manager", "receptionist"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const unassignedPatients = await PatientAdmission.find({
      status: "Admitted",
      admissionType: "Emergency",
      $or: [
        { assignedBed: { $exists: false } },
        { assignedBed: null }
      ]
    })
    .populate("emergencyId", "incidentNumber patientCondition handover")
    .populate("triageNurse", "name")
    .sort({ arrivalTime: -1 })
    .lean();

    const verifiedHandoverPatients = unassignedPatients.filter(patient =>
      patient.emergencyId?.handover?.verified === true
    );

    return Response.json({
      patients: verifiedHandoverPatients,
      count: verifiedHandoverPatients.length
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching unassigned patients:", error);
    return Response.json({
      error: "Error fetching unassigned patients",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
