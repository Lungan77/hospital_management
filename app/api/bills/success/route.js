import { connectDB } from "@/lib/mongodb";
import Bill from "@/models/Bill";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["patient"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { billId } = await req.json();

    const bill = await Bill.findById(billId);
    if (!bill) return Response.json({ error: "Bill not found" }, { status: 404 });

    if (bill.status === "paid") return Response.json({ error: "Bill is already paid" }, { status: 400 });

    bill.status = "paid";
    bill.paymentDate = new Date();
    bill.paymentMethod = "paystack"; 
    await bill.save();

    return Response.json({ message: "Payment confirmed", bill }, { status: 200 });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return Response.json({ error: "Payment confirmation failed" }, { status: 500 });
  }
}
