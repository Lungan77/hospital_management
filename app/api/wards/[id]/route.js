import { connectDB } from "@/lib/mongodb";
import Ward from "@/models/Ward";
import Bed from "@/models/Bed";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["admin", "ward_manager", "nurse", "er"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { id } = await params;

    const ward = await Ward.findById(id)
      .populate("staff.wardManager", "name email")
      .populate("staff.headNurse", "name email")
      .populate("staff.assignedNurses", "name email")
      .populate("staff.assignedDoctors", "name email");

    if (!ward) {
      return Response.json({ error: "Ward not found" }, { status: 404 });
    }

    const beds = await Bed.find({ wardId: id })
      .populate("currentPatient", "firstName lastName patientId")
      .sort({ bedNumber: 1 });

    return Response.json({ ward, beds }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ward details:", error);
    return Response.json({ error: "Error fetching ward details" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const auth = await isAuthenticated(req, ["admin", "ward_manager"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { id } = await params;
    const updates = await req.json();

    const ward = await Ward.findById(id);
    if (!ward) {
      return Response.json({ error: "Ward not found" }, { status: 404 });
    }

    Object.assign(ward, updates);
    await ward.save();

    return Response.json({
      message: "Ward updated successfully",
      ward
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating ward:", error);
    return Response.json({ error: "Error updating ward" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = await isAuthenticated(req, ["admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { id } = await params;

    const bedsInWard = await Bed.countDocuments({ wardId: id, status: "Occupied" });
    if (bedsInWard > 0) {
      return Response.json({
        error: "Cannot delete ward with occupied beds. Please discharge all patients first."
      }, { status: 400 });
    }

    const ward = await Ward.findByIdAndUpdate(
      id,
      { isActive: false, wardStatus: "Closed" },
      { new: true }
    );

    if (!ward) {
      return Response.json({ error: "Ward not found" }, { status: 404 });
    }

    return Response.json({
      message: "Ward deactivated successfully",
      ward
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting ward:", error);
    return Response.json({ error: "Error deleting ward" }, { status: 500 });
  }
}
