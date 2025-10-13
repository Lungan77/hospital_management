import { connectDB } from "@/lib/mongodb";
import Ward from "@/models/Ward";
import Bed from "@/models/Bed";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { bedId, wardId } = await req.json();

    const bed = await Bed.findById(bedId);
    if (!bed) {
      return Response.json({ error: "Bed not found" }, { status: 404 });
    }

    const ward = await Ward.findById(wardId);
    if (!ward) {
      return Response.json({ error: "Ward not found" }, { status: 404 });
    }

    if (bed.status === "Occupied") {
      return Response.json({
        error: "Cannot reassign an occupied bed. Please discharge the patient first."
      }, { status: 400 });
    }

    const oldWardId = bed.wardId;
    bed.wardId = wardId;
    await bed.save();

    if (oldWardId) {
      const oldWard = await Ward.findById(oldWardId);
      if (oldWard) {
        await oldWard.updateCapacity();
      }
    }

    await ward.updateCapacity();

    return Response.json({
      message: `Bed ${bed.bedNumber} successfully assigned to ${ward.wardName}`,
      bed
    }, { status: 200 });
  } catch (error) {
    console.error("Error assigning bed to ward:", error);
    return Response.json({ error: "Error assigning bed to ward" }, { status: 500 });
  }
}
