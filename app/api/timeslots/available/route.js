import { connectDB } from "@/lib/mongodb";
import TimeSlot from "@/models/TimeSlot";

export async function POST(req) {
    try {
      const { doctorId, date } = await req.json();
      await connectDB();
  
      const timeSlot = await TimeSlot.findOne({ doctorId, date });
      if (!timeSlot) return Response.json({ slots: [] }, { status: 200 });
  
      return Response.json({ slots: timeSlot.slots }, { status: 200 });
    } catch (error) {
      return Response.json({ error: "Error fetching time slots" }, { status: 500 });
    }
  }
  