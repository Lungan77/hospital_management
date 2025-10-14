import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import MealPlan from "@/models/MealPlan";
import Emergency from "@/models/Emergency";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

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

    return NextResponse.json({ mealPlans });
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plans" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["doctor", "nurse"].includes(session.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await dbConnect();

    const data = await req.json();

    const patient = await Emergency.findById(data.patientAdmissionId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const mealPlan = await MealPlan.create({
      ...data,
      patientName: `${patient.firstName} ${patient.lastName}`,
      admissionNumber: patient.admissionNumber,
      createdBy: {
        userId: session.user.id,
        name: session.user.name,
        role: session.user.role,
      },
    });

    return NextResponse.json({ mealPlan }, { status: 201 });
  } catch (error) {
    console.error("Error creating meal plan:", error);
    return NextResponse.json(
      { error: "Failed to create meal plan" },
      { status: 500 }
    );
  }
}
