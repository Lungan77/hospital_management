import { connectDB } from "@/lib/mongodb";
import TimeSlot from "@/models/TimeSlot";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["doctor"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    const { date, slots } = await req.json();
    await connectDB();

    let timeSlotEntry = await TimeSlot.findOne({ doctorId: auth.session.user.id, date });

    if (timeSlotEntry) {
      // Update existing slots
      timeSlotEntry.slots = [...new Set([...timeSlotEntry.slots, ...slots])];
      await timeSlotEntry.save();
    } else {
      // Create new entry
      timeSlotEntry = await TimeSlot.create({
        doctorId: auth.session.user.id,
        date,
        slots,
      });
    }

    return Response.json({ message: "Time slots saved successfully", slot: timeSlotEntry }, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Error saving time slots" }, { status: 500 });
  }
}
