import { connectDB } from "@/lib/mongodb";
import Referral from "@/models/Referral";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "patient"]); // ✅ Restrict access
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // ✅ Extract `diagnosisId` from URL
    const url = new URL(req.url);
    const diagnosisId = url.pathname.split("/").pop(); // Extract ID from URL

    if (!diagnosisId) {
      return Response.json({ error: "Diagnosis ID is required" }, { status: 400 });
    }

    const referral = await Referral.findOne({ diagnosisId });

    if (!referral) {
      return Response.json({ error: "Referral not found" }, { status: 404 });
    }

    return Response.json({ referral }, { status: 200 });
  } catch (error) {
    console.error("Error fetching referral:", error);
    return Response.json({ error: "Error fetching referral" }, { status: 500 });
  }
}
