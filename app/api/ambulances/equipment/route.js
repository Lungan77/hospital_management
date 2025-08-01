import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher", "nurse", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { ambulanceId, equipment } = await req.json();

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    // Add equipment
    ambulance.equipment.push({
      name: equipment.name,
      status: equipment.status || "Operational",
      lastChecked: new Date()
    });

    await ambulance.save();

    return Response.json({ 
      message: "Equipment added successfully",
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error adding equipment:", error);
    return Response.json({ error: "Error adding equipment" }, { status: 500 });
  }
}

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher", "nurse", "doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { ambulanceId, equipmentIndex, status } = await req.json();

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    if (!ambulance.equipment[equipmentIndex]) {
      return Response.json({ error: "Equipment not found" }, { status: 404 });
    }

    // Update equipment status
    ambulance.equipment[equipmentIndex].status = status;
    ambulance.equipment[equipmentIndex].lastChecked = new Date();

    await ambulance.save();

    return Response.json({ 
      message: "Equipment status updated successfully",
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating equipment:", error);
    return Response.json({ error: "Error updating equipment" }, { status: 500 });
  }
}