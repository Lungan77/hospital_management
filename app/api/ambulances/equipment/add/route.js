import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["paramedic", "driver", "admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { 
      name, 
      quantity, 
      minQuantity, 
      status, 
      location, 
      expiryDate,
      addedBy 
    } = await req.json();

    if (!name || !quantity) {
      return Response.json({ error: "Equipment name and quantity are required" }, { status: 400 });
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

    // Check if equipment already exists
    const existingEquipmentIndex = ambulance.equipment.findIndex(item => item.name === name);
    
    if (existingEquipmentIndex >= 0) {
      // Update existing equipment
      ambulance.equipment[existingEquipmentIndex] = {
        ...ambulance.equipment[existingEquipmentIndex],
        quantity: quantity,
        minQuantity: minQuantity || 1,
        status: status || "Operational",
        location: location || "Unknown",
        expiryDate: expiryDate || null,
        lastChecked: new Date(),
        lastUpdatedBy: addedBy
      };
    } else {
      // Add new equipment
      ambulance.equipment.push({
        name,
        quantity,
        minQuantity: minQuantity || 1,
        status: status || "Operational",
        location: location || "Unknown",
        expiryDate: expiryDate || null,
        lastChecked: new Date(),
        addedBy: addedBy
      });
    }

    await ambulance.save();

    return Response.json({ 
      message: `${name} added successfully`,
      ambulance: ambulance.callSign,
      equipment: ambulance.equipment
    }, { status: 200 });
  } catch (error) {
    console.error("Error adding equipment:", error);
    return Response.json({ error: "Error adding equipment" }, { status: 500 });
  }
}