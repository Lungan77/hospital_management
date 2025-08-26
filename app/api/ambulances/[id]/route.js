import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function PUT(req, { params }) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { id } = params;
    const updateData = await req.json();

    // Validate required fields
    if (!updateData.vehicleNumber || !updateData.callSign) {
      return Response.json({ error: "Vehicle number and call sign are required" }, { status: 400 });
    }

    // Check for duplicate vehicle number or call sign (excluding current ambulance)
    const existingAmbulance = await Ambulance.findOne({
      $and: [
        { _id: { $ne: id } },
        {
          $or: [
            { vehicleNumber: updateData.vehicleNumber },
            { callSign: updateData.callSign }
          ]
        }
      ]
    });

    if (existingAmbulance) {
      return Response.json({ 
        error: "Vehicle number or call sign already exists" 
      }, { status: 400 });
    }

    // Update ambulance
    const ambulance = await Ambulance.findByIdAndUpdate(
      id,
      {
        ...updateData,
        year: updateData.year ? parseInt(updateData.year) : null,
        fuelLevel: updateData.fuelLevel ? parseInt(updateData.fuelLevel) : 100
      },
      { new: true, runValidators: true }
    ).populate("crew.memberId", "name");

    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    return Response.json({ 
      message: "Ambulance updated successfully",
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating ambulance:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return Response.json({ 
        error: `Validation error: ${validationErrors.join(', ')}` 
      }, { status: 400 });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return Response.json({ 
        error: `${field} already exists` 
      }, { status: 400 });
    }

    return Response.json({ error: "Error updating ambulance" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = await isAuthenticated(req, ["admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { id } = params;

    const ambulance = await Ambulance.findById(id);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    // Check if ambulance is currently assigned to an emergency
    if (ambulance.currentEmergency) {
      return Response.json({ 
        error: "Cannot delete ambulance - currently assigned to emergency" 
      }, { status: 400 });
    }

    // Check if ambulance has active crew
    if (ambulance.crew && ambulance.crew.length > 0) {
      return Response.json({ 
        error: "Cannot delete ambulance - crew members assigned. Remove crew first." 
      }, { status: 400 });
    }

    await Ambulance.findByIdAndDelete(id);

    return Response.json({ 
      message: "Ambulance deleted successfully" 
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting ambulance:", error);
    return Response.json({ error: "Error deleting ambulance" }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher", "driver", "paramedic"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { id } = params;

    const ambulance = await Ambulance.findById(id)
      .populate("crew.memberId", "name email role")
      .populate("currentEmergency", "incidentNumber priority status");

    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    return Response.json({ ambulance }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ambulance:", error);
    return Response.json({ error: "Error fetching ambulance" }, { status: 500 });
  }
}