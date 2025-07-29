import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin", "receptionist", "dispatcher", "nurse", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const ambulances = await Ambulance.find()
      .populate("crew.memberId", "name")
      .populate("currentEmergency", "incidentNumber priority")
      .sort({ callSign: 1 });

    return Response.json({ ambulances }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ambulances:", error);
    return Response.json({ error: "Error fetching ambulances" }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const ambulanceData = await req.json();

    const ambulance = await Ambulance.create(ambulanceData);

    return Response.json({ 
      message: "Ambulance created successfully",
      ambulance 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating ambulance:", error);
    return Response.json({ error: "Error creating ambulance" }, { status: 500 });
  }
}