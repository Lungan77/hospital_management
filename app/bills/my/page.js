"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import withAuth from "@/hoc/withAuth";

function MyBills() {
  const { data: session } = useSession();
  const [bills, setBills] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const res = await fetch("/api/bills/my");
    const data = await res.json();
    if (res.ok) {
      setBills(data.bills);
    } else {
      setMessage("Failed to fetch bills.");
    }
  };

  const payBill = async (billId) => {
    const res = await fetch("/api/bills/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billId }),
    });

    const data = await res.json();
    if (res.ok) {
      window.location.href = data.url; // Redirect to Stripe Checkout
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center">My Bills</h1>

      {/* ✅ Show "Create Bill" button for doctors */}
      {session?.user.role === "doctor" && (
        <Link
          href="/bills/generate"
          className="mt-4 block bg-green-600 text-white p-2 rounded-lg text-center hover:bg-green-700"
        >
          + Create Bill
        </Link>
      )}

      {message && <p className="mt-2 text-red-500">{message}</p>}

      {bills.length === 0 ? (
        <p className="text-center mt-4">No bills available.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {bills.map((bill) => (
            <li key={bill._id} className="bg-gray-100 p-4 rounded-lg">
              <p><strong>Amount:</strong> ZAR {bill.totalAmount}</p>
              <p><strong>Payment Status:</strong> <span className={`font-bold ${bill.status === "paid" ? "text-green-600" : "text-red-500"}`}>{bill.status}</span></p>
              <p><strong>Payment Method:</strong> {bill.paymentMethod || "Not Paid"}</p>
              <p><strong>Payment Date:</strong> {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString() : "N/A"}</p>
              <p><strong>Doctor:</strong> {bill.doctorId?.name || "N/A"}</p>

              {bill.status === "pending" && session?.user.role === "patient" && (
                <button 
                  onClick={() => payBill(bill._id)} 
                  className="mt-2 w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                >
                  Pay Now
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default withAuth(MyBills, ["patient", "doctor"]);
