import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["paramedic", "driver", "admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Find ambulance assigned to this user
    const ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id
    });

    if (!ambulance) {
      // Return default equipment status for testing
      const defaultEquipment = {
        "Defibrillator": "Operational",
        "Oxygen Tank": "Operational", 
        "IV Supplies": "Needs Maintenance",
        "Medications": "Operational",
        "Airway Kit": "Operational",
        "Trauma Kit": "Operational",
        "Cardiac Monitor": "Operational",
        "Suction Unit": "Operational"
      };
      
      return Response.json({ 
        equipment: defaultEquipment,
        checkComplete: false 
      }, { status: 200 });
    }

    // Convert equipment array to status object
    const equipmentStatus = {};
    ambulance.equipment.forEach(item => {
      equipmentStatus[item.name] = item.status;
    });

    // Check if all required equipment is operational
    const requiredEquipment = [
      "Defibrillator", "Oxygen Tank", "IV Supplies", "Medications", 
      "Airway Kit", "Trauma Kit", "Cardiac Monitor", "Suction Unit"
    ];
    
    const checkComplete = requiredEquipment.every(eq => 
      equipmentStatus[eq] === "Operational"
    );

    return Response.json({ 
      equipment: equipmentStatus,
      checkComplete,
      ambulance: ambulance.callSign
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching equipment status:", error);
    return Response.json({ error: "Error fetching equipment status" }, { status: 500 });
  }
}