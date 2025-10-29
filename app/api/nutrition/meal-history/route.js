import { connectDB } from "@/lib/mongodb";
import MealPlan from "@/models/MealPlan";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["dietician", "doctor", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return Response.json({ error: "Patient ID is required" }, { status: 400 });
    }

    const patient = await PatientAdmission.findById(patientId);
    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    const mealHistory = await MealPlan.find({
      patient: patientId,
    })
      .sort({ date: -1 })
      .limit(30);

    return Response.json({
      patient: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        patientName: `${patient.firstName} ${patient.lastName}`,
        admissionNumber: patient.admissionNumber,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodType: patient.bloodType,
        arrivalTime: patient.arrivalTime,
        assignedWard: patient.assignedWard,
        assignedBed: patient.assignedBed,
      },
      mealHistory,
    });
  } catch (error) {
    console.error("Error fetching meal history:", error);
    return Response.json(
      { error: "Failed to fetch meal history" },
      { status: 500 }
    );
  }
}
