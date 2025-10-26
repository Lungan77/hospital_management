import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import DischargeFeedback from "@/models/DischargeFeedback";
import DischargeSummary from "@/models/DischargeSummary";
import Emergency from "@/models/Emergency";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const data = await req.json();
    const { dischargeSummaryId } = data;

    const summary = await DischargeSummary.findById(dischargeSummaryId);
    if (!summary) {
      return NextResponse.json({ error: "Discharge summary not found" }, { status: 404 });
    }

    const admission = await Emergency.findById(summary.patientAdmissionId);
    if (!admission || admission.patientId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const existingFeedback = await DischargeFeedback.findOne({
      dischargeSummaryId,
      patientId: session.user.id
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: "Feedback already submitted for this discharge" },
        { status: 400 }
      );
    }

    const feedback = await DischargeFeedback.create({
      ...data,
      patientId: session.user.id
    });

    return NextResponse.json({ feedback, message: "Thank you for your feedback!" }, { status: 201 });
  } catch (error) {
    console.error("Error submitting discharge feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["admin", "doctor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const dischargeSummaryId = searchParams.get("dischargeSummaryId");

    let query = {};
    if (dischargeSummaryId) {
      query.dischargeSummaryId = dischargeSummaryId;
    }

    const feedbacks = await DischargeFeedback.find(query)
      .populate("patientId", "name")
      .populate("dischargeSummaryId")
      .sort({ createdAt: -1 })
      .lean();

    const averages = await DischargeFeedback.aggregate([
      { $group: {
        _id: null,
        avgOverallExperience: { $avg: "$overallExperience" },
        avgTreatmentQuality: { $avg: "$treatmentQuality" },
        avgStaffProfessionalism: { $avg: "$staffProfessionalism" },
        avgFacilityCleaniness: { $avg: "$facilityCleaniness" },
        avgCommunicationClarity: { $avg: "$communicationClarity" },
        avgDischargeInstructions: { $avg: "$dischargeInstructions" },
        totalResponses: { $sum: 1 },
        recommendCount: { $sum: { $cond: ["$wouldRecommend", 1, 0] } }
      }}
    ]);

    return NextResponse.json({
      feedbacks,
      statistics: averages.length > 0 ? averages[0] : null
    });
  } catch (error) {
    console.error("Error fetching discharge feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
