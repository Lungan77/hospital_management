import { connectDB } from "@/lib/mongodb";
import Bed from "@/models/Bed";
import Ward from "@models/Ward";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin", "nurse", "receptionist", "ward_manager", "housekeeper"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Get beds cleaned today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bedsCleanedToday = await Bed.find({
      "housekeeping.lastCleaned": {
        $gte: today,
        $lt: tomorrow
      },
      "housekeeping.cleaningStatus": "Clean"
    })
    .populate("wardId", "wardName")
    .populate("housekeeping.cleanedBy", "name")
    .sort({ "housekeeping.lastCleaned": -1 });

    return Response.json({ 
      beds: bedsCleanedToday,
      count: bedsCleanedToday.length 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching completed cleaning tasks:", error);
    return Response.json({ error: "Error fetching completed tasks" }, { status: 500 });
  }
}