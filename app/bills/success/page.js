"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentSuccessWrapper() {
  return (
    <Suspense fallback={<p className="text-center text-lg">Loading...</p>}>
      <PaymentSuccess />
    </Suspense>
  );
}

function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const billId = searchParams.get("billId");
  const [message, setMessage] = useState("Processing payment...");

  useEffect(() => {
    if (billId) {
      confirmPayment(billId);
    }
  }, [billId]);

  const confirmPayment = async (billId) => {
    if (!billId) return; // ✅ Prevents running if billId is missing

    try {
      const res = await fetch("/api/bills/success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId }),
      });

      const data = await res.json();
      setMessage(data.message || "Payment confirmed!");

      setTimeout(() => {
        router.push("/bills/my");
      }, 3000);
    } catch (error) {
      setMessage("Error confirming payment.");
    }
  };

  return <p className="text-center text-lg">{message}</p>;
}
