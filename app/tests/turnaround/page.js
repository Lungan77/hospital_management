"use client";

import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";

function TurnaroundTimePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tests/turnaround")
      .then((res) => res.json())
      .then((resData) => {
        setRecords(resData.data || []); // Use the correct key from the API
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load turnaround time data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Test Turnaround Times</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Test Name</th>
              <th className="border px-3 py-2">Order → Collection (hrs)</th>
              <th className="border px-3 py-2">Collection → Result (hrs)</th>
              <th className="border px-3 py-2">Order → Result (hrs)</th>
              <th className="border px-3 py-2">Result → Approval (hrs)</th>
              <th className="border px-3 py-2">Order → Approval (hrs)</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border px-3 py-2">{item.testName}</td>
                <td className="border px-3 py-2">{item.turnaroundHours.orderToCollection?.toFixed(2) || "N/A"}</td>
                <td className="border px-3 py-2">{item.turnaroundHours.collectionToResult?.toFixed(2) || "N/A"}</td>
                <td className="border px-3 py-2">{item.turnaroundHours.orderToResult?.toFixed(2) || "N/A"}</td>
                <td className="border px-3 py-2">{item.turnaroundHours.resultToApproval?.toFixed(2) || "N/A"}</td>
                <td className="border px-3 py-2">{item.turnaroundHours.orderToApproval?.toFixed(2) || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default withAuth(TurnaroundTimePage, ["doctor", "labtech"]);
