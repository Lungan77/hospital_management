import { connectDB } from "@/lib/mongodb";
import TestOrder from "@/models/TestOrder";
import Appointment from "@/models/Appointment";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin", "labtech"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const orders = await TestOrder.find().populate("appointmentId");

    return Response.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch all test orders:", error);
    return Response.json({ error: "Server error fetching test orders" }, { status: 500 });
  }
}
