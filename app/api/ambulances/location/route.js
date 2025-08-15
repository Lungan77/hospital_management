import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["nurse", "doctor", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { ambulanceId, latitude, longitude, address } = await req.json();

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    // Update location
    ambulance.currentLocation = {
      latitude,
      longitude,
      address,
      lastUpdated: new Date()
    };

    await ambulance.save();

    return Response.json({ 
      message: "Location updated successfully",
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating location:", error);
    return Response.json({ error: "Error updating location" }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher", "nurse", "doctor", "driver", "paramedic"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Get all ambulances with location data and crew information
    const ambulances = await Ambulance.find({
      "currentLocation.latitude": { $exists: true },
      "currentLocation.longitude": { $exists: true }
    })
    .populate("crew.memberId", "name role")
    .populate("currentEmergency", "incidentNumber priority")
    .select("callSign vehicleNumber status currentLocation crew currentEmergency type baseStation radioChannel fuelLevel");

    return Response.json({ ambulances }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ambulance locations:", error);
    return Response.json({ error: "Error fetching ambulance locations" }, { status: 500 });
  }
}