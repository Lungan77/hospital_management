import { connectDB } from "@/lib/mongodb";
import DoctorFeedback from "@/models/DoctorFeedback";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const testResultId = searchParams.get("testResultId");

  if (!testResultId) {
    return NextResponse.json({ error: "Missing testResultId" }, { status: 400 });
  }

  await connectDB();

  try {
    const feedback = await DoctorFeedback.find({ testResultId })
      .populate("doctorId", "name email")

    console.log("Feedback retrieved:", feedback);

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json({ error: "Failed to retrieve feedback." }, { status: 500 });
  }
}
