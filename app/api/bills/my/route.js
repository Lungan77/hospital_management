import { connectDB } from "@/lib/mongodb";
import Bill from "@/models/Bill";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["patient", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    let filter = {};
    if (auth.session.user.role === "patient") {
      filter.patientId = auth.session.user.id; // ✅ Patients see their own bills
    } else if (auth.session.user.role === "doctor") {
      filter.doctorId = auth.session.user.id; // ✅ Doctors see bills they created
    }

    const bills = await Bill.find(filter)
      .populate("doctorId", "name") // ✅ Include doctor name
      .sort({ createdAt: -1 });

    return Response.json({ bills }, { status: 200 });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return Response.json({ error: "Error fetching bills" }, { status: 500 });
  }
}
