import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const doctors = await User.find({ role: "doctor" }).select("name _id title email phone");
    return Response.json({ doctors }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Error fetching doctors" }, { status: 500 });
  }
}
