import { connectDB } from "@/lib/mongodb";
import MealPlan from "@/models/MealPlan";
import PatientAdmission from "@/models/PatientAdmission";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["dietician", "doctor", "nurse", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const patientAdmissionId = searchParams.get("patientAdmissionId");
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    let query = {};

    if (patientAdmissionId) {
      query.patientAdmissionId = patientAdmissionId;
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.planDate = {
        $gte: searchDate,
        $lt: nextDate,
      };
    }

    if (status) {
      query.status = status;
    }

    const mealPlans = await MealPlan.find(query).sort({ planDate: -1 }).lean();

    return Response.json({ mealPlans });
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    return Response.json(
      { error: "Failed to fetch meal plans" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const auth = await isAuthenticated(req, ["dietician", "doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const data = await req.json();

    const patient = await PatientAdmission.findById(data.patientAdmissionId);
    if (!patient) {
      return Response.json({ error: "Patient admission not found" }, { status: 404 });
    }

    const mealPlan = await MealPlan.create({
      ...data,
      admissionModel: "PatientAdmission",
      patientName: `${patient.firstName} ${patient.lastName}`,
      admissionNumber: patient.admissionNumber,
      createdBy: {
        userId: auth.session.user.id,
        name: auth.session.user.name,
        role: auth.session.user.role,
      },
    });

    return Response.json({ mealPlan }, { status: 201 });
  } catch (error) {
    console.error("Error creating meal plan:", error);
    return Response.json(
      { error: "Failed to create meal plan" },
      { status: 500 }
    );
  }
}
