import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["er", "doctor", "nurse", "ward_manager", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientId } = await params;

    const patient = await Emergency.findById(patientId)
      .populate("ambulanceId", "callSign vehicleNumber")
      .populate("dispatcherId", "firstName lastName")
      .populate("erAssessment.assessedBy", "firstName lastName")
      .populate("handover.receivingStaff", "firstName lastName")
      .populate("handover.verifiedBy", "firstName lastName");

    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    const patientData = patient.toObject();
    if (patientData.erAssessment) {
      patientData.assessment = patientData.erAssessment;
    }

    return Response.json({ patient: patientData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return Response.json({ error: "Error fetching patient details" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const auth = await isAuthenticated(req, ["er", "doctor", "nurse", "ward_manager", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { patientId } = await params;
    const updates = await req.json();

    const patient = await Emergency.findByIdAndUpdate(
      patientId,
      updates,
      { new: true, runValidators: true }
    )
      .populate("ambulanceId", "callSign vehicleNumber")
      .populate("dispatcherId", "firstName lastName")
      .populate("erAssessment.assessedBy", "firstName lastName");

    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    return Response.json({
      message: "Patient updated successfully",
      patient
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating patient:", error);
    return Response.json({
      error: "Error updating patient",
      details: error.message
    }, { status: 500 });
  }
}