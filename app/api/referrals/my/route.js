import { connectDB } from "@/lib/mongodb";
import Referral from "@/models/Referral";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["doctor", "patient"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    
    let filter = {};
    if (auth.session.user.role === "doctor") {
      filter.referringDoctorId = auth.session.user.id;
    } else if (auth.session.user.role === "patient") {
      filter.patientId = auth.session.user.id;
    }

    const referrals = await Referral.find(filter).populate("diagnosisId", "diagnosis");

    return Response.json({ referrals }, { status: 200 });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return Response.json({ error: "Error fetching referrals" }, { status: 500 });
  }
}
