"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const billId = searchParams.get("billId");
  const [message, setMessage] = useState("Processing payment...");

  useEffect(() => {
    if (billId) {
      confirmPayment();
    }
  }, [billId]);

  const confirmPayment = async () => {
    const res = await fetch("/api/bills/success", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billId }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);

    setTimeout(() => {
      router.push("/bills/my");
    }, 3000);
  };

  return <p className="text-center text-lg">{message}</p>;
}

export default PaymentSuccess;
