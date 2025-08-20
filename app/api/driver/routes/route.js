import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import Ambulance from "@/models/Ambulance";
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
    });

    if (!ambulance) {
      return Response.json({ routes: [] }, { status: 200 });
    }

    // Find all completed emergencies for this ambulance
    const emergencies = await Emergency.find({
      ambulanceId: ambulance._id,
      status: "Completed",
      dispatchedAt: { $exists: true },
      completedAt: { $exists: true }
    })
    .sort({ completedAt: -1 })
    .limit(50); // Last 50 routes

    // Calculate route data
    const routes = emergencies.map(emergency => {
      const dispatchTime = new Date(emergency.dispatchedAt);
      const onSceneTime = emergency.onSceneAt ? new Date(emergency.onSceneAt) : null;
      const completedTime = new Date(emergency.completedAt);
      
      const responseTime = onSceneTime ? 
        Math.round((onSceneTime - dispatchTime) / 60000) : null; // minutes
      
      const totalDuration = Math.round((completedTime - dispatchTime) / 60000); // minutes
      
      // Mock distance and fuel calculations (in real system, this would come from GPS tracking)
      const mockDistance = Math.round((Math.random() * 15 + 5) * 10) / 10; // 5-20 km
      const mockFuelUsed = Math.round(mockDistance * 0.25 * 10) / 10; // Approximate fuel usage
      
      return {
        id: emergency._id,
        emergencyId: emergency.incidentNumber,
        date: completedTime,
        startLocation: ambulance.baseStation || "Base Station",
        destination: emergency.address,
        patientName: emergency.patientName,
        priority: emergency.priority,
        status: emergency.status,
        distance: mockDistance,
        duration: totalDuration,
        responseTime: responseTime,
        fuelUsed: mockFuelUsed,
        dispatchedAt: emergency.dispatchedAt,
        onSceneAt: emergency.onSceneAt,
        completedAt: emergency.completedAt
      };
    });

    return Response.json({ routes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching route history:", error);
    return Response.json({ error: "Error fetching route history" }, { status: 500 });
  }
}