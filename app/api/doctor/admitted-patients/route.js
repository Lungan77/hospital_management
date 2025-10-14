import { connectDB } from "@/lib/mongodb";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";
import Emergency from "@/models/Emergency";
import User from "@/models/User";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const patients = await PatientAdmission.find({
      assignedDoctor: auth.session.user.id,
      status: { $in: ["Admitted", "In Treatment", "Waiting"] }
    })
      .populate("triageNurse", "firstName lastName")
      .populate("assignedDoctor", "firstName lastName")
      .populate("assignedNurse", "firstName lastName")
      .populate("assignedSpecialists.specialistId", "firstName lastName")
      .populate("admittedBy", "firstName lastName")
      .populate("emergencyId", "incidentNumber priority")
      .sort({ arrivalTime: -1 });

    return Response.json({ patients }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admitted patients:", error);
    return Response.json({ error: "Error fetching admitted patients" }, { status: 500 });
  }
}
