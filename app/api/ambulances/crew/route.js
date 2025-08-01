import { connectDB } from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";
import User from "@/models/User";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { ambulanceId, crewMemberId, role, certificationLevel } = await req.json();

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    const crewMember = await User.findById(crewMemberId);
    if (!crewMember) {
      return Response.json({ error: "Crew member not found" }, { status: 404 });
    }

    // Check if crew member is already assigned
    const existingMember = ambulance.crew.find(member => 
      member.memberId.toString() === crewMemberId
    );
    
    if (existingMember) {
      return Response.json({ error: "Crew member already assigned to this ambulance" }, { status: 400 });
    }

    // Add crew member
    ambulance.crew.push({
      memberId: crewMemberId,
      role,
      certificationLevel
    });

    await ambulance.save();

    return Response.json({ 
      message: "Crew member assigned successfully",
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error assigning crew member:", error);
    return Response.json({ error: "Error assigning crew member" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await isAuthenticated(req, ["admin", "dispatcher"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { ambulanceId, crewMemberId } = await req.json();

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return Response.json({ error: "Ambulance not found" }, { status: 404 });
    }

    // Remove crew member
    ambulance.crew = ambulance.crew.filter(member => 
      member.memberId.toString() !== crewMemberId
    );

    await ambulance.save();

    return Response.json({ 
      message: "Crew member removed successfully",
      ambulance 
    }, { status: 200 });
  } catch (error) {
    console.error("Error removing crew member:", error);
    return Response.json({ error: "Error removing crew member" }, { status: 500 });
  }
}