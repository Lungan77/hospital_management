import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(["paramedic", "driver", "admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Find ambulance assigned to this user
    const ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id
    });

    console.log("🔍 Found ambulance for equipment status:", ambulance ? ambulance.callSign : "None");
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

      const defaultInventory = {
        "Defibrillator": { quantity: 1, minQuantity: 1, location: "Main Compartment", expiryDate: null },
        "Oxygen Tank": { quantity: 2, minQuantity: 2, location: "Side Compartment", expiryDate: null },
        "IV Supplies": { quantity: 3, minQuantity: 5, location: "Medical Kit", expiryDate: "2025-12-31" },
        "Medications": { quantity: 1, minQuantity: 2, location: "Secure Box", expiryDate: "2025-06-30" },
        "Airway Kit": { quantity: 1, minQuantity: 1, location: "Main Compartment", expiryDate: null },
        "Trauma Kit": { quantity: 2, minQuantity: 1, location: "Rear Compartment", expiryDate: null },
        "Cardiac Monitor": { quantity: 1, minQuantity: 1, location: "Main Compartment", expiryDate: null },
        "Suction Unit": { quantity: 1, minQuantity: 1, location: "Side Compartment", expiryDate: null }
      };
      
      console.log("📦 Returning default equipment status");
      return Response.json({ 
        equipment: defaultEquipment,
        inventory: defaultInventory,
        checkComplete: false,
        testMode: true
      }, { status: 200 });
    }

    // Initialize equipment array if it doesn't exist
    if (!ambulance.equipment) {
      ambulance.equipment = [];
    }

    // Convert equipment array to status object
    const equipmentStatus = {};
    const equipmentInventory = {};
    
    ambulance.equipment.forEach(item => {
      equipmentStatus[item.name] = item.status;
      equipmentInventory[item.name] = {
        quantity: item.quantity || 1,
        minQuantity: item.minQuantity || 1,
        location: item.location || "Unknown",
        expiryDate: item.expiryDate ? item.expiryDate.toISOString().split('T')[0] : null
      };
    });

    console.log("📊 Equipment status:", equipmentStatus);
    console.log("📋 Equipment inventory:", equipmentInventory);
    // Add default equipment if not present
    const requiredEquipment = [
      { name: "Defibrillator", defaultQty: 1, minQty: 1, location: "Main Compartment" },
      { name: "Oxygen Tank", defaultQty: 2, minQty: 2, location: "Side Compartment" },
      { name: "IV Supplies", defaultQty: 10, minQty: 5, location: "Medical Kit" },
      { name: "Medications", defaultQty: 1, minQty: 2, location: "Secure Box" },
      { name: "Airway Kit", defaultQty: 1, minQty: 1, location: "Main Compartment" },
      { name: "Trauma Kit", defaultQty: 2, minQty: 1, location: "Rear Compartment" },
      { name: "Cardiac Monitor", defaultQty: 1, minQty: 1, location: "Main Compartment" },
      { name: "Suction Unit", defaultQty: 1, minQty: 1, location: "Side Compartment" }
    ];

    requiredEquipment.forEach(eq => {
      if (!equipmentStatus[eq.name]) {
        equipmentStatus[eq.name] = "Operational";
        equipmentInventory[eq.name] = {
          quantity: eq.defaultQty,
          minQuantity: eq.minQty,
          location: eq.location,
          expiryDate: null
        };
      }
    });

    // Check if all required equipment is operational
    const checkComplete = requiredEquipment.every(eq => 
      equipmentStatus[eq.name] === "Operational"
    );

    return Response.json({ 
      equipment: equipmentStatus,
      inventory: equipmentInventory,
      checkComplete,
      ambulance: ambulance.callSign
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching equipment status:", error);
    return Response.json({ error: "Error fetching equipment status" }, { status: 500 });
  }
}