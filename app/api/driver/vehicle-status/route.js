import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["driver"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { status } = await req.json();

    // Find ambulance assigned to this driver
    const ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id,
      "crew.role": "Driver"
    });

    if (!ambulance) {
      return Response.json({ error: "No vehicle assigned to driver" }, { status: 404 });
    }

    // Update vehicle status
    ambulance.status = status;
    await ambulance.save();

    return Response.json({ 
      message: `Vehicle status updated to ${status}`,
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating vehicle status:", error);
    return Response.json({ error: "Error updating vehicle status" }, { status: 500 });
  }
}