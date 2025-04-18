"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import withAuth from "@/hoc/withAuth";
import { FileText, Plus } from "lucide-react";

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
      window.location.href = data.url;
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Bills</h1>

        {session?.user.role === "doctor" && (
          <Link
            href="/bills/generate"
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus className="w-5 h-5" />
            Create Bill
          </Link>
        )}
      </div>

      {message && <p className="text-red-500 mb-4">{message}</p>}

      {bills.length === 0 ? (
        <p className="text-gray-600 text-center">No bills available.</p>
      ) : (
        <div className="grid gap-6">
          {bills.map((bill) => (
            <div key={bill._id} className="bg-white border p-5 rounded-xl shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                <FileText className="w-5 h-5" />
                Bill Details
              </div>
              <p><strong>Amount:</strong> ZAR {bill.totalAmount.toLocaleString()}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`font-semibold ${bill.status === "paid" ? "text-green-600" : "text-red-600"}`}>
                  {bill.status.toUpperCase()}
                </span>
              </p>
              <p><strong>Method:</strong> {bill.paymentMethod || "Not Paid"}</p>
              <p><strong>Date:</strong> {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString() : "N/A"}</p>
              <p><strong>Doctor:</strong> {bill.doctorId?.name || "N/A"}</p>

              {bill.status === "pending" && session?.user.role === "patient" && (
                <button
                  onClick={() => payBill(bill._id)}
                  className="w-full mt-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Pay Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAuth(MyBills, ["patient", "doctor"]);
