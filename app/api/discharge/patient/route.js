import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import DischargeSummary from "@/models/DischargeSummary";
import Emergency from "@/models/Emergency";
import Prescription from "@/models/Prescription";
import Appointment from "@/models/Appointment";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const summaryId = searchParams.get("summaryId");

    if (!summaryId) {
      const patientAdmissions = await Emergency.find({
        patientId: session.user.id,
        status: "Discharged"
      }).sort({ dischargeDate: -1 });

      const discharges = await DischargeSummary.find({
        patientAdmissionId: { $in: patientAdmissions.map(p => p._id) }
      })
        .populate("dischargedBy", "name")
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({ discharges });
    }

    const summary = await DischargeSummary.findById(summaryId)
      .populate("dischargedBy", "name")
      .lean();

    if (!summary) {
      return NextResponse.json({ error: "Discharge summary not found" }, { status: 404 });
    }

    const admission = await Emergency.findById(summary.patientAdmissionId);

    if (!admission || admission.patientId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const prescriptions = await Prescription.find({
      patientId: session.user.id,
      createdAt: { $gte: admission.admissionDate, $lte: summary.dischargeDate }
    })
      .populate("doctorId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const followUpAppointments = await Appointment.find({
      patientId: session.user.id,
      appointmentDate: { $gte: summary.dischargeDate },
      status: { $in: ["Scheduled", "Confirmed"] }
    })
      .populate("doctorId", "name")
      .sort({ appointmentDate: 1 })
      .lean();

    return NextResponse.json({
      summary,
      admission,
      prescriptions,
      followUpAppointments
    });
  } catch (error) {
    console.error("Error fetching discharge summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch discharge summary" },
      { status: 500 }
    );
  }
}
