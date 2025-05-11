"use client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export default function CheckInScanner() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: 250
    });

    scanner.render(
      async (decodedText) => {
        try {
          const res = await fetch("/api/checkin/qr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qrCode: decodedText })
          });

          const data = await res.json();
          alert(data.message || "Check-in successful");
        } catch {
          alert("Failed to check in.");
        }
        scanner.clear(); // optional: stop after 1 scan
      },
      (error) => {
        console.log("QR scan error:", error);
      }
    );

    return () => scanner.clear().catch(console.error);
  }, []);

  return <div id="qr-reader" className="mx-auto w-full max-w-sm" />;
}
