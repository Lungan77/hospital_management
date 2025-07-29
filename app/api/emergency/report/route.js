import { connectDB } from "@/lib/mongodb";
import Emergency from "@/models/Emergency";

export async function POST(req) {
  try {
    await connectDB();
    const emergencyData = await req.json();

    // Create new emergency report
    const emergency = await Emergency.create({
      ...emergencyData,
      reportedAt: new Date()
    });

    return Response.json({ 
      message: "Emergency reported successfully", 
      emergency: {
        _id: emergency._id,
        incidentNumber: emergency.incidentNumber
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating emergency report:", error);
    return Response.json({ error: "Error creating emergency report" }, { status: 500 });
  }
}