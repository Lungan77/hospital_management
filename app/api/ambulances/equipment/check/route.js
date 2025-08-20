import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["paramedic", "driver", "admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { equipmentName, status, checkedBy } = await req.json();

    if (!equipmentName || !status) {
      return Response.json({ error: "Equipment name and status are required" }, { status: 400 });
    }

    // Find ambulance assigned to this user
    let ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id
    });

    if (!ambulance) {
      // For testing: use first ambulance if no assignment
      ambulance = await Ambulance.findOne({});
      
      if (!ambulance) {
        return Response.json({ error: "No ambulance found" }, { status: 404 });
      }
    }

    // Find existing equipment or add new
    const equipmentIndex = ambulance.equipment.findIndex(item => item.name === equipmentName);
    
    if (equipmentIndex >= 0) {
      // Update existing equipment
      ambulance.equipment[equipmentIndex].status = status;
      ambulance.equipment[equipmentIndex].lastChecked = new Date();
    } else {
      // Add new equipment
      ambulance.equipment.push({
        name: equipmentName,
        status: status,
        lastChecked: new Date()
      });
    }

    await ambulance.save();

    // Check if all required equipment is operational
    const requiredEquipment = [
      "Defibrillator", "Oxygen Tank", "IV Supplies", "Medications", 
      "Airway Kit", "Trauma Kit", "Cardiac Monitor", "Suction Unit"
    ];
    
    const equipmentStatus = {};
    ambulance.equipment.forEach(item => {
      equipmentStatus[item.name] = item.status;
    });
    
    const allOperational = requiredEquipment.every(eq => 
      equipmentStatus[eq] === "Operational"
    );

    return Response.json({ 
      message: `${equipmentName} status updated to ${status}`,
      equipment: equipmentStatus,
      checkComplete: allOperational,
      ambulance: ambulance.callSign
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating equipment status:", error);
    return Response.json({ error: "Error updating equipment status" }, { status: 500 });
  }
}