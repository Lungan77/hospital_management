import { connectDB } from "@/lib/mongodb";
import Bed from "@/models/Bed";
import Ward from "@/models/Ward";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "admin", "er"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const beds = await Bed.find()
      .populate("wardId", "wardName wardType")
      .populate("currentPatient", "firstName lastName patientId chiefComplaint triageLevel")
      .populate("assignedBy", "name")
      .sort({ "location.floor": 1, "location.room": 1, bedNumber: 1 });

    return Response.json({ beds }, { status: 200 });
  } catch (error) {
    console.error("Error fetching beds:", error);
    return Response.json({ error: "Error fetching beds" }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { bedNumber, wardId, bedType, floor, room, position, features } = await req.json();

    // Check if bed number already exists
    const existingBed = await Bed.findOne({ bedNumber });
    if (existingBed) {
      return Response.json({ error: "Bed number already exists" }, { status: 400 });
    }

    // Verify ward exists
    const ward = await Ward.findById(wardId);
    if (!ward) {
      return Response.json({ error: "Ward not found" }, { status: 404 });
    }

    const bed = await Bed.create({
      bedNumber,
      wardId,
      bedType,
      location: {
        floor: parseInt(floor),
        room,
        position
      },
      features: features || [],
      housekeeping: {
        cleaningStatus: "Clean",
        lastCleaned: new Date()
      }
    });

    // Update ward capacity
    await ward.updateCapacity();

    return Response.json({ 
      message: "Bed added successfully",
      bed 
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding bed:", error);
    return Response.json({ error: "Error adding bed" }, { status: 500 });
  }
}