import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import TimeSlot from "@/models/TimeSlot";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
    const auth = await isAuthenticated(req, ["patient"]);
    if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });
  
    try {
      const { doctorId, date, timeSlot } = await req.json();
      await connectDB();
  
      const timeSlotEntry = await TimeSlot.findOne({ doctorId, date });
      
      if (!timeSlotEntry || !timeSlotEntry.slots.includes(timeSlot)) {
        return Response.json({ error: "Time slot not available" }, { status: 400 });
      }

      // Remove booked slot
      timeSlotEntry.slots = timeSlotEntry.slots.filter((slot) => slot !== timeSlot);
      await timeSlotEntry.save();
  
      // Book appointment
      const appointment = await Appointment.create({
        patientId: auth.session.user.id,
        doctorId,
        date,
        timeSlot,
      });
  
      return Response.json({ message: "Appointment booked", appointment }, { status: 201 });
    } catch (error) {
      return Response.json({ error: "Error booking appointment" }, { status: 500 });
    }
  }
  