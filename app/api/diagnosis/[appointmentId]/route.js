import Diagnosis from "@/models/Diagnosis";
import { connectDB } from "@/lib/mongodb";

export async function GET(req, { params }) {
    try {
      await connectDB();
      const { appointmentId } = await params;
  
      const diagnosis = await Diagnosis.findOne({ appointmentId }).populate("doctorId", "name");
  
      if (!diagnosis) {
        return Response.json({ error: "No diagnosis found for this appointment" }, { status: 404 });
      }
  
      return Response.json({ diagnosis }, { status: 200 });
    } catch (error) {
      console.error("Error fetching diagnosis:", error);
      return Response.json({ error: "Error fetching diagnosis" }, { status: 500 });
    }
  }
  