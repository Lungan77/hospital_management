import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["driver", "paramedic", "admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { latitude, longitude, address } = await req.json();

    // Find ambulance assigned to this user (driver or paramedic)
    const ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id
    });

    if (!ambulance) {
      return Response.json({ error: "No ambulance assigned to user" }, { status: 404 });
    }

    // Update location
    ambulance.currentLocation = {
      latitude,
      longitude,
      address: address || "Current Location",
      lastUpdated: new Date()
    };

    await ambulance.save();

    return Response.json({ 
      message: "Location updated successfully",
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating ambulance location:", error);
    return Response.json({ error: "Error updating location" }, { status: 500 });
  }
}