import { connectDB } from "@/lib/mongodb";
import Bed from "@/models/Bed";
import Ward from "@/models/Ward";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "admin", "er", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const beds = await Bed.find()
      .populate({
        path: "wardId",
        select: "wardName wardType wardStatus",
        strictPopulate: false
      })
      .populate({
        path: "currentPatient",
        select: "firstName lastName patientId chiefComplaint triageLevel arrivalTime status",
        strictPopulate: false
      })
      .populate({
        path: "assignedBy",
        select: "name email",
        strictPopulate: false
      })
      .sort({ "location.floor": 1, "location.room": 1, bedNumber: 1 })
      .lean();

    // Clean up beds with invalid patient references
    const cleanedBeds = beds.map(bed => {
      // If bed is marked as occupied but has no valid patient, reset status
      if (bed.status === "Occupied" && !bed.currentPatient) {
        console.warn(`Bed ${bed.bedNumber} marked as Occupied but has no patient. Status should be corrected.`);
      }
      return bed;
    });

    return Response.json({ beds: cleanedBeds }, { status: 200 });
  } catch (error) {
    console.error("Error fetching beds:", error);
    console.error("Error details:", error.message);
    return Response.json({
      error: "Error fetching beds",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin", "nurse", "ward_manager"]);
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