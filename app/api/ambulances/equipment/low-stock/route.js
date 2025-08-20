import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["paramedic", "driver", "admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Find ambulance assigned to this user
    let ambulance = await Ambulance.findOne({
      "crew.memberId": auth.session.user.id
    });

    if (!ambulance) {
      // For testing: use first ambulance if no assignment
      ambulance = await Ambulance.findOne({});
      
      if (!ambulance) {
        return Response.json({ lowStockItems: [] }, { status: 200 });
      }
    }

    // Check for low stock items
    const lowStockItems = [];
    
    ambulance.equipment.forEach(item => {
      if (item.quantity <= item.minQuantity) {
        lowStockItems.push([item.name, {
          quantity: item.quantity,
          minQuantity: item.minQuantity,
          location: item.location,
          expiryDate: item.expiryDate,
          status: item.status
        }]);
      }
    });

    // Also check for expired items
    const expiredItems = [];
    ambulance.equipment.forEach(item => {
      if (item.expiryDate && new Date(item.expiryDate) <= new Date()) {
        expiredItems.push([item.name, {
          quantity: item.quantity,
          expiryDate: item.expiryDate,
          location: item.location
        }]);
      }
    });

    return Response.json({ 
      lowStockItems,
      expiredItems,
      ambulance: ambulance.callSign
    }, { status: 200 });
  } catch (error) {
    console.error("Error checking low stock:", error);
    return Response.json({ error: "Error checking low stock" }, { status: 500 });
  }
}