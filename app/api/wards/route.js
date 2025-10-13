import { connectDB } from "@/lib/mongodb";
import Ward from "@/models/Ward";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["receptionist", "nurse", "admin", "er", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const wards = await Ward.find({ isActive: true })
      .populate("staff.wardManager", "name")
      .populate("staff.headNurse", "name")
      .sort({ "location.floor": 1, wardName: 1 });

    return Response.json({ wards }, { status: 200 });
  } catch (error) {
    console.error("Error fetching wards:", error);
    return Response.json({ error: "Error fetching wards" }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const wardData = await req.json();

    // Check if ward name or code already exists
    const existingWard = await Ward.findOne({
      $or: [
        { wardName: wardData.wardName },
        { wardCode: wardData.wardCode }
      ]
    });

    if (existingWard) {
      return Response.json({ error: "Ward name or code already exists" }, { status: 400 });
    }

    const ward = await Ward.create(wardData);

    return Response.json({ 
      message: "Ward created successfully",
      ward 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating ward:", error);
    return Response.json({ error: "Error creating ward" }, { status: 500 });
  }
}