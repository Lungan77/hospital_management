import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import MealPlan from "@/models/MealPlan";
import NutritionalAssessment from "@/models/NutritionalAssessment";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["dietician", "doctor", "nurse", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await dbConnect();

    const admittedPatients = await Emergency.find({
      status: { $in: ["Admitted", "In Treatment"] }
    })
      .populate("patientId", "name email phone gender")
      .sort({ admissionDate: -1 })
      .lean();

    const enrichedPatients = await Promise.all(
      admittedPatients.map(async (patient) => {
        const latestMealPlan = await MealPlan.findOne({
          patientAdmissionId: patient._id,
          status: "Active"
        })
          .sort({ planDate: -1 })
          .lean();

        const latestAssessment = await NutritionalAssessment.findOne({
          patientAdmissionId: patient._id
        })
          .sort({ assessmentDate: -1 })
          .lean();

        const pendingMeals = latestMealPlan ? [
          !latestMealPlan.meals.breakfast?.delivered ? "Breakfast" : null,
          !latestMealPlan.meals.lunch?.delivered ? "Lunch" : null,
          !latestMealPlan.meals.dinner?.delivered ? "Dinner" : null
        ].filter(Boolean) : [];

        return {
          ...patient,
          latestMealPlan,
          latestAssessment,
          pendingMeals,
          needsAssessment: !latestAssessment ||
            (latestAssessment.followUpDate && new Date(latestAssessment.followUpDate) <= new Date()),
          riskLevel: latestAssessment?.nutritionalRisk?.riskLevel || "Unknown"
        };
      })
    );

    const stats = {
      totalPatients: enrichedPatients.length,
      highRisk: enrichedPatients.filter(p => p.riskLevel === "High" || p.riskLevel === "Critical").length,
      needingAssessment: enrichedPatients.filter(p => p.needsAssessment).length,
      activeMealPlans: enrichedPatients.filter(p => p.latestMealPlan).length
    };

    return NextResponse.json({
      patients: enrichedPatients,
      stats
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching nutrition patients:", error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}
import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import MealPlan from "@/models/MealPlan";
import NutritionalAssessment from "@/models/NutritionalAssessment";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["dietician", "doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const admittedPatients = await Emergency.find({
      status: { $in: ["Admitted", "In Treatment"] }
    })
      .populate("patientId")
      .sort({ admissionDate: -1 })
      .lean();

    const enrichedPatients = await Promise.all(
      admittedPatients.map(async (patient) => {
        const latestMealPlan = await MealPlan.findOne({
          patientAdmissionId: patient._id,
          status: "Active"
        })
          .sort({ planDate: -1 })
          .lean();

        const latestAssessment = await NutritionalAssessment.findOne({
          patientAdmissionId: patient._id
        })
          .sort({ assessmentDate: -1 })
          .lean();

        const pendingMeals = latestMealPlan ? [
          !latestMealPlan.meals.breakfast?.delivered ? "Breakfast" : null,
          !latestMealPlan.meals.lunch?.delivered ? "Lunch" : null,
          !latestMealPlan.meals.dinner?.delivered ? "Dinner" : null
        ].filter(Boolean) : [];

        return {
          ...patient,
          latestMealPlan,
          latestAssessment,
          pendingMeals,
          needsAssessment: !latestAssessment ||
            (latestAssessment.followUpDate && new Date(latestAssessment.followUpDate) <= new Date()),
          riskLevel: latestAssessment?.nutritionalRisk?.riskLevel || "Unknown"
        };
      })
    );

    const stats = {
      totalPatients: enrichedPatients.length,
      highRisk: enrichedPatients.filter(p => p.riskLevel === "High" || p.riskLevel === "Critical").length,
      needingAssessment: enrichedPatients.filter(p => p.needsAssessment).length,
      activeMealPlans: enrichedPatients.filter(p => p.latestMealPlan).length
    };

    return Response.json({
      patients: enrichedPatients,
      stats
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching nutrition patients:", error);
    return Response.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}
