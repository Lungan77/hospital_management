import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(["driver", "paramedic", "admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { latitude, longitude, address } = await req.json();

    console.log("Location update request:", { latitude, longitude, address, userId: auth.session.user.id });

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      return Response.json({ error: "Valid latitude and longitude are required" }, { status: 400 });
    }

    // Find ambulance assigned to this user (driver or paramedic)
    const ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id
    });

    console.log("Found ambulance for user:", ambulance ? ambulance.callSign : "None");

    if (!ambulance) {
      // For testing purposes, update the first available ambulance if no assignment exists
      const firstAmbulance = await Ambulance.findOne({});
      if (firstAmbulance) {
        firstAmbulance.currentLocation = {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address: address || `Live Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          lastUpdated: new Date()
        };
        await firstAmbulance.save();
        
        console.log(`Updated first ambulance ${firstAmbulance.callSign} with location:`, firstAmbulance.currentLocation);
        
        return Response.json({ 
          message: "Location updated (test mode - first ambulance)",
          ambulance: {
            _id: firstAmbulance._id,
            callSign: firstAmbulance.callSign,
            currentLocation: firstAmbulance.currentLocation
          }
        }, { status: 200 });
      }
      
      return Response.json({ 
        message: "No ambulance found to update",
        updated: false 
      }, { status: 200 });
    }

    // Update ambulance location with user's current position
    ambulance.currentLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || `Live Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
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