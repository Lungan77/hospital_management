import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import DischargeSummary from "@/models/DischargeSummary";
import Emergency from "@/models/Emergency";
import AdmittedPatientTreatmentPlan from "@/models/AdmittedPatientTreatmentPlan";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["doctor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Access denied. Only doctors can generate discharge summaries" }, { status: 403 });
    }

    await dbConnect();

    const data = await req.json();
    const { patientAdmissionId } = data;

    const patient = await Emergency.findById(patientAdmissionId);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const treatmentPlan = await AdmittedPatientTreatmentPlan.findOne({
      patientAdmissionId,
      status: "Active",
    }).sort({ createdAt: -1 });

    const lengthOfStay = patient.admissionDate
      ? Math.ceil((new Date() - new Date(patient.admissionDate)) / (1000 * 60 * 60 * 24))
      : 0;

    const dischargeSummary = await DischargeSummary.create({
      ...data,
      dischargedBy: session.user.id,
      admissionDate: patient.admissionDate,
      lengthOfStay,
      reasonForAdmission: patient.chiefComplaint,
      chiefComplaint: patient.chiefComplaint,
    });

    patient.status = "Discharged";
    patient.dischargeDate = new Date();
    await patient.save();

    if (treatmentPlan) {
      treatmentPlan.status = "Completed";
      await treatmentPlan.save();
    }

    return NextResponse.json({ dischargeSummary }, { status: 201 });
  } catch (error) {
    console.error("Error generating discharge summary:", error);
    return NextResponse.json(
      { error: "Failed to generate discharge summary" },
      { status: 500 }
    );
  }
}
