import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["paramedic", "driver", "admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { equipmentName, quantity, updatedBy } = await req.json();

    if (!equipmentName || quantity === undefined) {
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

    // Find and update equipment quantity
    const equipmentIndex = ambulance.equipment.findIndex(item => item.name === equipmentName);
    
    if (equipmentIndex >= 0) {
      ambulance.equipment[equipmentIndex].quantity = Math.max(0, parseInt(quantity));
      ambulance.equipment[equipmentIndex].lastChecked = new Date();
      ambulance.equipment[equipmentIndex].lastUpdatedBy = updatedBy;
    } else {
      // Add equipment if it doesn't exist
      ambulance.equipment.push({
        name: equipmentName,
        quantity: Math.max(0, parseInt(quantity)),
        minQuantity: 1,
        status: "Operational",
        location: "Unknown",
        lastChecked: new Date(),
        addedBy: updatedBy
      });
    }

    await ambulance.save();

    // Check for low stock
    const updatedItem = ambulance.equipment.find(item => item.name === equipmentName);
    const isLowStock = updatedItem && updatedItem.quantity <= updatedItem.minQuantity;

    return Response.json({ 
      message: `${equipmentName} quantity updated to ${quantity}`,
      isLowStock,
      ambulance: ambulance.callSign
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating equipment quantity:", error);
    return Response.json({ error: "Error updating equipment quantity" }, { status: 500 });
  }
}