import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import DischargeSummary from "@/models/DischargeSummary";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const patientAdmissionId = searchParams.get("patientAdmissionId");
    const summaryId = searchParams.get("summaryId");

    if (summaryId) {
      const summary = await DischargeSummary.findById(summaryId)
        .populate("dischargedBy", "name")
        .lean();

      if (!summary) {
        return NextResponse.json({ error: "Discharge summary not found" }, { status: 404 });
      }

      return NextResponse.json({ summary });
    }

    if (patientAdmissionId) {
      const summaries = await DischargeSummary.find({ patientAdmissionId })
        .populate("dischargedBy", "name")
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({ summaries });
    }

    return NextResponse.json({ error: "Missing query parameters" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching discharge summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch discharge summary" },
      { status: 500 }
    );
  }
}
