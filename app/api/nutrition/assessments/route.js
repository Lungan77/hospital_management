import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import NutritionalAssessment from "@/models/NutritionalAssessment";
import Emergency from "@/models/Emergency";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["dietician", "doctor", "nurse"].includes(session.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await dbConnect();
    const data = await req.json();

    const admission = await Emergency.findById(data.patientAdmissionId);
    if (!admission) {
      return NextResponse.json({ error: "Patient admission not found" }, { status: 404 });
    }

    const assessment = await NutritionalAssessment.create({
      ...data,
      patientId: admission.patientId,
      assessedBy: session.user.id
    });

    return NextResponse.json({
      message: "Nutritional assessment created successfully",
      assessment
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating nutritional assessment:", error);
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 });
  }
}

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
    const { searchParams } = new URL(req.url);
    const patientAdmissionId = searchParams.get("patientAdmissionId");
    const patientId = searchParams.get("patientId");

    let query = {};
    if (patientAdmissionId) {
      query.patientAdmissionId = patientAdmissionId;
    } else if (patientId) {
      query.patientId = patientId;
    }

    const assessments = await NutritionalAssessment.find(query)
      .populate("assessedBy", "name")
      .populate("patientId", "name email")
      .sort({ assessmentDate: -1 })
      .lean();

    return NextResponse.json({ assessments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching nutritional assessments:", error);
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 });
  }
}
