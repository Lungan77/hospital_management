import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import Emergency from "@/models/Emergency";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["driver"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Find ambulance assigned to this driver
    const ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id,
      "crew.role": "Driver"
    }).populate("crew.memberId", "name");

    if (!ambulance) {
      return Response.json({ 
        assignment: null, 
        vehicle: null,
        message: "No vehicle assigned to driver" 
      }, { status: 200 });
    }

    let assignment = null;
    if (ambulance.currentEmergency) {
      assignment = await Emergency.findById(ambulance.currentEmergency)
        .populate("dispatcherId", "name")
        .populate("ambulanceId", "callSign vehicleNumber");
    }

    return Response.json({ 
      assignment,
      vehicle: {
        _id: ambulance._id,
        callSign: ambulance.callSign,
        vehicleNumber: ambulance.vehicleNumber,
        type: ambulance.type,
        status: ambulance.status,
        baseStation: ambulance.baseStation,
        radioChannel: ambulance.radioChannel,
        fuelLevel: ambulance.fuelLevel,
        currentLocation: ambulance.currentLocation,
        crew: ambulance.crew
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching driver assignment:", error);
    return Response.json({ error: "Error fetching assignment" }, { status: 500 });
  }
}