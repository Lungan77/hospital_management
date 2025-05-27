import { connectDB } from "@/lib/mongodb";
import DoctorFeedback from "@/models/DoctorFeedback";
import TestResult from "@/models/TestResult";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import TestOrder from "@/models/TestOrder";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const { session, error, status } = await isAuthenticated(req, ["doctor"]);
  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  await connectDB();

  try {
    const {
      testResultId,
      summary,
      recommendations,
      urgencyLevel,
      followUpRequired,
      followUpDate,
      visibility,
    } = await req.json();

    const testResult = await TestResult.findById(testResultId).populate({
      path: "testOrderId",
      populate: {
        path: "appointmentId",
        populate: [
          { path: "doctorId", select: "name email" },
          { path: "patientId", select: "name email" },
        ],
      },
    });

    console.log("Test Result:", testResult);
    console.log("patientId:", testResult?.testOrderId?.appointmentId?.patientId);
    console.log("patientId (fallback):", testResult?.testOrderId?.appointmentId?.patientId);

    if (!testResult) {
      return NextResponse.json({ error: "Test result or related patient not found." }, { status: 404 });
    }

    const patientId = testResult.testOrderId.appointmentId.patientId?._id || testResult.testOrderId.appointmentId.patientId;

    const feedback = await DoctorFeedback.create({
      testResultId,
      doctorId: session.user.id,
      patientId,
      summary,
      recommendations,
      urgencyLevel,
      followUpRequired,
      followUpDate,
      visibility,
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json({ error: "Failed to save feedback." }, { status: 500 });
  }
}
