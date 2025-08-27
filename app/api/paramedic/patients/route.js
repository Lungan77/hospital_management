import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["paramedic"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Find ambulance assigned to this paramedic
    const ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id,
      "crew.role": "Paramedic"
    });

    let patients = [];

    if (ambulance) {
      // Get all emergencies this ambulance has responded to
      patients = await Emergency.find({
        ambulanceId: ambulance._id
      })
      .populate("dispatcherId", "name")
      .populate("ambulanceId", "callSign vehicleNumber")
      .sort({ reportedAt: -1 })
      .limit(50); // Last 50 patients
    } else {
      // For testing: get recent emergencies
      patients = await Emergency.find({})
        .populate("dispatcherId", "name")
        .populate("ambulanceId", "callSign vehicleNumber")
        .sort({ reportedAt: -1 })
        .limit(20);
    }

    return Response.json({ 
      patients,
      ambulance: ambulance ? {
        _id: ambulance._id,
        callSign: ambulance.callSign,
        vehicleNumber: ambulance.vehicleNumber
      } : null
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching paramedic patients:", error);
    return Response.json({ error: "Error fetching patient records" }, { status: 500 });
  }
}