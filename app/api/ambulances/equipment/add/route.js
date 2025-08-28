import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(["paramedic", "driver", "admin", "dispatcher"]);
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

    console.log("🔧 Adding equipment:", { name, quantity, minQuantity, status, location, expiryDate, addedBy });

    if (!name || !quantity) {
      return Response.json({ error: "Equipment name and quantity are required" }, { status: 400 });
    }

    // Validate quantity is a number
    const qty = parseInt(quantity);
    const minQty = parseInt(minQuantity) || 1;
    
    if (isNaN(qty) || qty < 0) {
      return Response.json({ error: "Invalid quantity provided" }, { status: 400 });
    }
    // Find ambulance assigned to this user
    let ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id
    });

    if (!ambulance) {
      console.log("⚠️ No ambulance assigned to user, using first available for testing");
      ambulance = await Ambulance.findOne({});
      
      if (!ambulance) {
        return Response.json({ error: "No ambulance found" }, { status: 404 });
      }
      console.log("🚑 Using ambulance:", ambulance.callSign);
    }

    // Initialize equipment array if it doesn't exist
    if (!ambulance.equipment) {
      ambulance.equipment = [];
    }

    // Check if equipment already exists
    const existingEquipmentIndex = ambulance.equipment.findIndex(item => item.name === name);
    
    if (existingEquipmentIndex >= 0) {
      // Update existing equipment
      ambulance.equipment[existingEquipmentIndex] = {
        ...ambulance.equipment[existingEquipmentIndex],
        quantity: qty,
        minQuantity: minQty,
        status: status || "Operational",
        location: location || "Unknown",
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        lastChecked: new Date(),
        lastUpdatedBy: addedBy || auth.session.user.id
      };
      console.log("✅ Updated existing equipment:", name);
    } else {
      // Add new equipment
      ambulance.equipment.push({
        name,
        quantity: qty,
        minQuantity: minQty,
        status: status || "Operational",
        location: location || "Unknown",
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        lastChecked: new Date(),
        addedBy: addedBy || auth.session.user.id,
        lastUpdatedBy: addedBy || auth.session.user.id
      });
      console.log("✅ Added new equipment:", name);
    }

    await ambulance.save();
    console.log("💾 Equipment saved to database successfully");

    return Response.json({ 
      message: `${name} ${existingEquipmentIndex >= 0 ? 'updated' : 'added'} successfully`,
      ambulance: ambulance.callSign,
      equipment: ambulance.equipment,
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error("Error adding equipment:", error);
    return Response.json({ error: "Error adding equipment" }, { status: 500 });
  }
}