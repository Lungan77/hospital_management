import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(["driver", "paramedic"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { latitude, longitude, address } = await req.json();

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      return Response.json({ error: "Valid latitude and longitude are required" }, { status: 400 });
    }

    // Find ambulance assigned to this driver or paramedic
    const ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id
    });

    if (!ambulance) {
      return Response.json({ 
        message: "No ambulance assigned to user",
        updated: false 
      }, { status: 200 });
    }

    // Update ambulance location with driver's current position
    ambulance.currentLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      lastUpdated: new Date()
    };

    await ambulance.save();

    console.log(`Updated ambulance ${ambulance.callSign} location:`, {
      latitude: ambulance.currentLocation.latitude,
      longitude: ambulance.currentLocation.longitude,
      address: ambulance.currentLocation.address
    });

    return Response.json({ 
      message: "Ambulance location updated successfully",
      ambulance: {
        _id: ambulance._id,
        callSign: ambulance.callSign,
        currentLocation: ambulance.currentLocation
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating driver location:", error);
    return Response.json({ error: "Error updating location" }, { status: 500 });
  }
}