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
      return Response.json({ 
        routes: [],
        stats: {
          totalRoutes: 0,
          totalDistance: 0,
          totalDuration: 0,
          avgResponseTime: 0,
          totalFuel: 0
        }
      }, { status: 200 });
    }

    // Find all completed emergencies for this ambulance
    const emergencies = await Emergency.find({
      ambulanceId: ambulance._id,
      status: "Completed",
      dispatchedAt: { $exists: true },
      completedAt: { $exists: true }
    })
    .populate("dispatcherId", "name")
    .sort({ completedAt: -1 })
    .limit(100); // Last 100 routes

    // Calculate route data
    const routes = emergencies.map(emergency => {
      const dispatchTime = new Date(emergency.dispatchedAt);
      const onSceneTime = emergency.onSceneAt ? new Date(emergency.onSceneAt) : null;
      const completedTime = new Date(emergency.completedAt);
      
      const responseTime = onSceneTime ? 
        Math.round((onSceneTime - dispatchTime) / 60000) : null; // minutes
      
      const totalDuration = Math.round((completedTime - dispatchTime) / 60000); // minutes
      
      // Calculate distance based on coordinates if available
      let distance = 5; // Default distance
      if (emergency.coordinates && ambulance.currentLocation) {
        // Simple distance calculation (in real system, use proper routing API)
        const lat1 = ambulance.currentLocation.latitude || -26.2041;
        const lon1 = ambulance.currentLocation.longitude || 28.0473;
        const lat2 = emergency.coordinates.latitude;
        const lon2 = emergency.coordinates.longitude;
        
        if (lat2 && lon2) {
          const R = 6371; // Earth's radius in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance = Math.round(R * c * 10) / 10; // Round to 1 decimal
        }
      } else {
        // Estimate distance based on response time
        distance = Math.round((responseTime || 10) * 0.8 * 10) / 10; // Rough estimate
      }
      
      const fuelUsed = Math.round(distance * 0.25 * 10) / 10; // Approximate fuel usage
      
      return {
        id: emergency._id,
        emergencyId: emergency.incidentNumber,
        date: completedTime,
        startLocation: ambulance.baseStation || "Base Station",
        destination: emergency.address,
        patientName: emergency.patientName,
        priority: emergency.priority,
        status: emergency.status,
        distance: distance,
        duration: totalDuration,
        responseTime: responseTime,
        fuelUsed: fuelUsed,
        dispatchedAt: emergency.dispatchedAt,
        onSceneAt: emergency.onSceneAt,
        completedAt: emergency.completedAt,
        type: emergency.type
      };
    });

    // Calculate summary stats
    const stats = {
      totalRoutes: routes.length,
      totalDistance: Math.round(routes.reduce((sum, route) => sum + route.distance, 0) * 10) / 10,
      totalDuration: routes.reduce((sum, route) => sum + route.duration, 0),
      avgResponseTime: routes.length > 0 ? 
        Math.round(routes.filter(r => r.responseTime).reduce((sum, route) => sum + route.responseTime, 0) / routes.filter(r => r.responseTime).length) : 0,
      totalFuel: Math.round(routes.reduce((sum, route) => sum + route.fuelUsed, 0) * 10) / 10
    };

    return Response.json({ routes, stats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching route history:", error);
    return Response.json({ error: "Error fetching route history" }, { status: 500 });
  }
}