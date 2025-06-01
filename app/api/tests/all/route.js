import { connectDB } from "@/lib/mongodb";
import TestOrder from "@/models/TestOrder";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin", "labtech", "nurse"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const orders = await TestOrder.find()
      .populate({
        path: "appointmentId",
        populate: [
          { path: "patientId", select: "name" },
          { path: "doctorId", select: "name" }
        ]
      });

    console.log("Fetched all test orders:", orders);
    console.log("Patients:", orders.map(order => order.appointmentId?.patientId?.name));
    console.log("Doctors:", orders.map(order => order.appointmentId?.doctorId?.name));

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch all test orders:", error);
    return NextResponse.json({ error: "Server error fetching test orders" }, { status: 500 });
  }
}
