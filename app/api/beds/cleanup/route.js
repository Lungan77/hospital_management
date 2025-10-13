import { connectDB } from "@/lib/mongodb";
import Bed from "@/models/Bed";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const beds = await Bed.find({ status: "Occupied" }).populate("currentPatient");

    let fixedCount = 0;
    const fixedBeds = [];

    for (const bed of beds) {
      if (!bed.currentPatient) {
        bed.status = "Available";
        bed.assignedAt = null;
        bed.assignedBy = null;
        await bed.save();

        fixedCount++;
        fixedBeds.push({
          bedNumber: bed.bedNumber,
          previousStatus: "Occupied (no patient)",
          newStatus: "Available"
        });
      }
    }

    if (fixedCount === 0) {
      return Response.json({
        message: "No orphaned beds found. All occupied beds have valid patient assignments.",
        fixedCount: 0
      }, { status: 200 });
    }

    return Response.json({
      message: `Successfully fixed ${fixedCount} orphaned bed(s)`,
      fixedCount,
      fixedBeds
    }, { status: 200 });
  } catch (error) {
    console.error("Error cleaning up beds:", error);
    console.error("Error details:", error.message);
    return Response.json({
      error: "Error cleaning up beds",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
