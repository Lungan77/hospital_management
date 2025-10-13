import { connectDB } from "@/lib/mongodb";
import Bed from "@/models/Bed";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin", "nurse", "receptionist", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Get beds that need cleaning
    const bedsNeedingCleaning = await Bed.find({
      $or: [
        { status: "Cleaning" },
        { "housekeeping.cleaningStatus": "Needs Cleaning" }
      ]
    })
    .populate("wardId", "wardName")
    .populate("housekeeping.cleanedBy", "name")
    .sort({ "housekeeping.nextCleaningDue": 1 });

    return Response.json({ 
      beds: bedsNeedingCleaning,
      count: bedsNeedingCleaning.length 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching housekeeping tasks:", error);
    return Response.json({ error: "Error fetching housekeeping tasks" }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin", "nurse", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { bedId, cleaningType = "Standard", cleaningNotes, cleaningDuration } = await req.json();

    const bed = await Bed.findById(bedId).populate("wardId");
    if (!bed) {
      return Response.json({ error: "Bed not found" }, { status: 404 });
    }

    // Mark cleaning as complete
    bed.status = "Available";
    bed.housekeeping = {
      ...bed.housekeeping,
      cleaningStatus: "Clean",
      lastCleaned: new Date(),
      cleanedBy: auth.session.user.id,
      cleaningType,
      cleaningNotes,
      cleaningDuration: cleaningDuration ? parseInt(cleaningDuration) : null
    };

    await bed.save();

    // Update ward capacity
    await bed.wardId.updateCapacity();

    return Response.json({ 
      message: `Bed ${bed.bedNumber} cleaning completed and marked available`,
      bed 
    }, { status: 200 });
  } catch (error) {
    console.error("Error completing bed cleaning:", error);
    return Response.json({ error: "Error completing bed cleaning" }, { status: 500 });
  }
}