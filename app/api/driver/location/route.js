import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import User from "@/models/User";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["driver", "paramedic", "admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { latitude, longitude, address } = await req.json();

    console.log("🚗 Location update request from user:", auth.session.user.id, auth.session.user.name);
    console.log("📍 Coordinates received:", { latitude, longitude, address });

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      console.log("❌ Invalid coordinates provided");
      return Response.json({ error: "Valid latitude and longitude are required" }, { status: 400 });
    }

    // Find ambulance assigned to this user (driver or paramedic)
    const ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id
    });

    console.log("🚑 Found ambulance for user:", ambulance ? ambulance.callSign : "None");

    if (!ambulance) {
      console.log("⚠️ No ambulance assigned, updating first available ambulance for testing");
      
      // For testing: update the first ambulance if no assignment exists
      const firstAmbulance = await Ambulance.findOne({});
      if (firstAmbulance) {
        const locationData = {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address: address || `Driver Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          lastUpdated: new Date()
        };

        firstAmbulance.currentLocation = locationData;
        await firstAmbulance.save();
        
        console.log("✅ Updated first ambulance location:", firstAmbulance.callSign, locationData);
        
        return Response.json({ 
          message: "Location updated (test mode - first ambulance)",
          ambulance: {
            _id: firstAmbulance._id,
            callSign: firstAmbulance.callSign,
            currentLocation: firstAmbulance.currentLocation
          },
          testMode: true
        }, { status: 200 });
      }
      
      return Response.json({ 
        message: "No ambulance found to update",
        updated: false 
      }, { status: 200 });
    }

    // Update ambulance location with driver's current position
    const locationData = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || `Live Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      lastUpdated: new Date()
    };

    ambulance.currentLocation = locationData;
    await ambulance.save();

    console.log("✅ Updated ambulance location:", ambulance.callSign, locationData);

    return Response.json({ 
      message: "Ambulance location updated successfully",
      ambulance: {
        _id: ambulance._id,
        callSign: ambulance.callSign,
        vehicleNumber: ambulance.vehicleNumber,
        status: ambulance.status,
        currentLocation: ambulance.currentLocation
      }
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating driver location:", error);
    return Response.json({ error: "Error updating location" }, { status: 500 });
  }
}

export async function POST(req) {
  // Alias POST to PUT for compatibility
  return PUT(req);
}