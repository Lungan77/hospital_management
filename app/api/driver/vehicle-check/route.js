import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["driver"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { vehicleId, checkItems, notes, completedAt } = await req.json();

    // Find ambulance assigned to this driver
    let ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id,
      "crew.role": "Driver"
    });

    if (!ambulance && vehicleId) {
      ambulance = await Ambulance.findById(vehicleId);
    }

    if (!ambulance) {
      // For testing: use first ambulance if no assignment
      ambulance = await Ambulance.findOne({});
      
      if (!ambulance) {
        return Response.json({ error: "No vehicle found" }, { status: 404 });
      }
    }

    // Check for critical failures
    const criticalItems = [
      "engine", "transmission", "brakes", "steering", "battery", 
      "headlights", "emergency_lights", "siren", "radio", "seatbelts", 
      "fire_extinguisher", "first_aid", "safety_vest", "fuel_level", 
      "oil_level", "coolant", "tire_pressure", "windshield"
    ];

    const criticalFailures = criticalItems.filter(item => checkItems[item] === "fail");
    
    if (criticalFailures.length > 0) {
      // Mark ambulance as out of service if critical items fail
      ambulance.status = "Out of Service";
      ambulance.maintenanceNotes = `Critical vehicle check failures: ${criticalFailures.join(", ")}. Inspected by ${auth.session.user.name} on ${new Date().toLocaleString()}. Notes: ${notes}`;
    } else {
      // Mark as available if all critical items pass
      if (ambulance.status === "Out of Service") {
        ambulance.status = "Available";
      }
    }

    // Store vehicle check record
    if (!ambulance.vehicleChecks) {
      ambulance.vehicleChecks = [];
    }

    ambulance.vehicleChecks.push({
      checkItems,
      notes,
      completedAt: new Date(completedAt),
      completedBy: auth.session.user.id,
      criticalFailures: criticalFailures.length,
      passed: criticalFailures.length === 0
    });

    // Keep only last 10 checks
    if (ambulance.vehicleChecks.length > 10) {
      ambulance.vehicleChecks = ambulance.vehicleChecks.slice(-10);
    }

    ambulance.lastVehicleCheck = new Date(completedAt);
    await ambulance.save();

    return Response.json({ 
      message: criticalFailures.length > 0 
        ? "Vehicle check completed with critical issues. Vehicle marked out of service."
        : "Vehicle check completed successfully. Vehicle ready for service.",
      passed: criticalFailures.length === 0,
      criticalFailures,
      ambulance: {
        _id: ambulance._id,
        callSign: ambulance.callSign,
        status: ambulance.status
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error saving vehicle check:", error);
    return Response.json({ error: "Error saving vehicle check" }, { status: 500 });
  }
}

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
        vehicle: null,
        lastCheck: null 
      }, { status: 200 });
    }

    const lastCheck = ambulance.vehicleChecks && ambulance.vehicleChecks.length > 0 
      ? ambulance.vehicleChecks[ambulance.vehicleChecks.length - 1]
      : null;

    return Response.json({ 
      vehicle: ambulance,
      lastCheck 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicle check data:", error);
    return Response.json({ error: "Error fetching vehicle check data" }, { status: 500 });
  }
}