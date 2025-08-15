import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin", "receptionist", "dispatcher", "nurse", "doctor", "driver", "paramedic"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const ambulances = await Ambulance.find()
      .populate("crew.memberId", "name")
      .populate("currentEmergency", "incidentNumber priority")
      .sort({ callSign: 1 })
      .lean();

    // Add mock location data for ambulances without real GPS data
    const ambulancesWithLocation = ambulances.map(ambulance => {
      if (!ambulance.currentLocation?.latitude || !ambulance.currentLocation?.longitude) {
        // Add mock coordinates for demonstration (Johannesburg area)
        const mockLocations = [
          { lat: -26.2041, lng: 28.0473, address: "Johannesburg Central" },
          { lat: -26.1951, lng: 28.0568, address: "Sandton Medical District" },
          { lat: -26.2309, lng: 28.0583, address: "Soweto General Area" },
          { lat: -26.1715, lng: 28.0693, address: "Randburg Station" },
          { lat: -26.2439, lng: 28.1258, address: "Germiston Base" }
        ];
        
        const index = ambulances.indexOf(ambulance) % mockLocations.length;
        const location = mockLocations[index];
        ambulance.currentLocation = {
          latitude: location.lat,
          longitude: location.lng,
          address: location.address,
          lastUpdated: new Date()
        };
      }
      return ambulance;
    });

    return Response.json({ ambulances: ambulancesWithLocation }, { status: 200 });
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