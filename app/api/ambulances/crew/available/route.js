import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Ambulance from "@/models/Ambulance";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    // Get all drivers and paramedics
    const drivers = await User.find({ role: "driver" }).select("name _id");
    const paramedics = await User.find({ role: "paramedic" }).select("name _id");

    // Get currently assigned crew members
    const ambulances = await Ambulance.find({}).select("crew");
    const assignedCrewIds = ambulances.flatMap(amb => 
      amb.crew.map(member => member.memberId.toString())
    );

    // Filter out already assigned crew
    const availableDrivers = drivers.filter(driver => 
      !assignedCrewIds.includes(driver._id.toString())
    );
    
    const availableParamedics = paramedics.filter(paramedic => 
      !assignedCrewIds.includes(paramedic._id.toString())
    );

    return Response.json({ 
      drivers: availableDrivers,
      paramedics: availableParamedics 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching available crew:", error);
    return Response.json({ error: "Error fetching available crew" }, { status: 500 });
  }
}