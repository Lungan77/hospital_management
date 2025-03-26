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

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: auth.session.user.email, // Patient's email
        amount: bill.totalAmount * 100, // Convert to kobo
        currency: "ZAR", // Use the correct currency
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/bills/success?billId=${bill._id}`,
      }),
    });

    const data = await paystackResponse.json();
    if (!data.status) return Response.json({ error: "Failed to initialize payment" }, { status: 500 });

    return Response.json({ url: data.data.authorization_url }, { status: 200 });
  } catch (error) {
    console.error("Error processing payment:", error);
    return Response.json({ error: "Payment error" }, { status: 500 });
  }
}
