import { connectDB } from "@/lib/mongodb";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "er", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientId, status } = await req.json();

    const patient = await PatientAdmission.findById(patientId);
    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    // Update patient status
    patient.status = status;
    
    // Set discharge information if being discharged
    if (status === "Discharged") {
      patient.dischargeTime = new Date();
      patient.dischargedBy = auth.session.user.id;
    }

    await patient.save();

    return Response.json({ 
      message: `Patient status updated to ${status}`,
      patient 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating patient status:", error);
    return Response.json({ error: "Error updating patient status" }, { status: 500 });
  }
}