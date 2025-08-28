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

    console.log("Equipment add request:", { name, quantity, minQuantity, status, location, expiryDate, addedBy });
    console.log("User ID:", auth.session?.user?.id);
    console.log("Adding equipment:", { name, quantity, minQuantity, status, location, expiryDate, addedBy });

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
      console.log("Using first available ambulance for testing:", ambulance.callSign);
    }

    // Check if equipment already exists
    const existingEquipmentIndex = ambulance.equipment.findIndex(item => item.name === name);
    
    if (existingEquipmentIndex >= 0) {
      // Update existing equipment
      ambulance.equipment[existingEquipmentIndex] = {
        ...ambulance.equipment[existingEquipmentIndex],
        quantity: parseInt(quantity),
        minQuantity: parseInt(minQuantity) || 1,
        status: status || "Operational",
        location: location || "Unknown",
        expiryDate: expiryDate || null,
        lastChecked: new Date(),
        lastUpdatedBy: auth.session.user.id
      };
      console.log("Updated existing equipment:", name);
    } else {
      // Add new equipment
      ambulance.equipment.push({
        name,
        quantity: parseInt(quantity),
        minQuantity: parseInt(minQuantity) || 1,
        status: status || "Operational",
        location: location || "Unknown",
        expiryDate: expiryDate || null,
        lastChecked: new Date(),
        addedBy: auth.session.user.id
      });
      console.log("Added new equipment:", name);
    }

    await ambulance.save();
    console.log("Equipment saved successfully");

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