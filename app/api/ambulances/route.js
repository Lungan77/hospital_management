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

    console.log(`API: Found ${ambulances.length} ambulances`);
    
    // Log ambulances with location data
    const ambulancesWithLocation = ambulances.filter(amb => 
      amb.currentLocation?.latitude && 
      amb.currentLocation?.longitude &&
      !isNaN(amb.currentLocation.latitude) &&
      !isNaN(amb.currentLocation.longitude)
    );
    
    console.log(`API: ${ambulancesWithLocation.length} ambulances have valid location data`);
    
    // Log each ambulance location for debugging
    ambulances.forEach(amb => {
      if (amb.currentLocation?.latitude && amb.currentLocation?.longitude) {
        console.log(`API: ${amb.callSign} location:`, {
          lat: amb.currentLocation.latitude,
          lng: amb.currentLocation.longitude,
          updated: amb.currentLocation.lastUpdated
        });
      } else {
        console.log(`API: ${amb.callSign} has no valid location data`);
      }
    });

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