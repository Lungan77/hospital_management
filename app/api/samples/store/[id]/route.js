import { connectDB } from "@/lib/mongodb";
import { isAuthenticated } from "@/hoc/protectedRoute";
import Sample from "@/models/Sample";

export const POST = async (req, { params }) => {
  const auth = await isAuthenticated(req, ["labtech"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  const { id } = params;
  const { unit, shelf } = await req.json();
  console.log("Storing sample:", id, "Unit:", unit, "Shelf:", shelf);

  if (!unit || !shelf) {
    return Response.json({ error: "Storage unit and shelf are required." }, { status: 400 });
  }

  try {
    await connectDB();

    const sample = await Sample.findById(id);
    if (!sample) return Response.json({ error: "Sample not found." }, { status: 404 });

    const storageEntry = {
      unit,
      shelf,
      storedAt: new Date(),
      storedBy: auth.session.user.id,
    };

    sample.storage.currentLocation = { unit, shelf };
    sample.storage.history.push(storageEntry);
    sample.status = "Stored";

    await sample.save();

    return Response.json({ message: "Sample storage logged.", sample }, { status: 200 });
  } catch (error) {
    console.error("Error logging sample storage:", error);
    return Response.json({ error: "Failed to log sample storage." }, { status: 500 });
  }
};
