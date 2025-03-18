import { connectDB } from "@/lib/mongodb";
import TimeSlot from "@/models/TimeSlot";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
    const auth = await isAuthenticated(req, ["doctor"]);
    if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });
    console.log(auth.session.user.id)
  
    try {
      await connectDB();
      
      const slots = await TimeSlot.find({ doctorId: auth.session.user.id }).sort({ date: 1 })
    
      return Response.json({ slots }, { status: 200 });
    } catch (error) {
      return Response.json({ error: "Error fetching time slots" }, { status: 500 });
    }
  }
  