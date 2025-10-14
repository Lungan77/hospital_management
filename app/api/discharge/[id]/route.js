import { connectDB } from "@/lib/mongodb";
import DischargeSummary from "@/models/DischargeSummary";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["doctor", "nurse", "admin", "patient"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { id } = await params;

    const dischargeSummary = await DischargeSummary.findById(id)
      .populate("patientAdmissionId", "firstName lastName admissionNumber age gender")
      .populate("dischargedBy", "name title email")
      .populate("approvedBy", "name title");

    if (!dischargeSummary) {
      return Response.json({ error: "Discharge summary not found" }, { status: 404 });
    }

    return Response.json({ dischargeSummary }, { status: 200 });
  } catch (error) {
    console.error("Error fetching discharge summary:", error);
    return Response.json({ error: "Error fetching discharge summary" }, { status: 500 });
  }
}
