"use client";

import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function TurnaroundTimePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tests/turnaround")
      .then((res) => res.json())
      .then((resData) => {
        setRecords(resData.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load turnaround time data:", err);
        setLoading(false);
      });
  }, []);

  const chartData = records.map((r) => ({
    name: r.testName,
    "Order → Collection": r.turnaroundHours.orderToCollection || 0,
    "Collection → Result": r.turnaroundHours.collectionToResult || 0,
    "Result → Approval": r.turnaroundHours.resultToApproval || 0,
  }));

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div>
        <h1 className="text-4xl font-extrabold mb-8 text-gray-900 text-center drop-shadow">
          Test Turnaround Time Analysis
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-8 w-8 text-blue-600 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-lg text-gray-700 font-medium">Loading...</span>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-12 border border-blue-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7m0 4l-4-4m4 4l4-4" />
                </svg>
                Visual Chart Overview
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={60} tick={{ fontSize: 13, fill: "#6b7280" }} />
                  <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft", fontSize: 14, fill: "#6b7280" }} tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{ background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb", color: "#374151" }}
                    labelStyle={{ fontWeight: "bold", color: "#2563eb" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 14, color: "#6b7280" }} />
                  <Bar dataKey="Order → Collection" stackId="a" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Collection → Result" stackId="a" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Result → Approval" stackId="a" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
                </svg>
                Detailed Table
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 text-sm rounded-lg overflow-hidden shadow-sm">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="border px-4 py-3 text-left font-semibold text-gray-800">Test Name</th>
                      <th className="border px-4 py-3 text-left font-semibold text-gray-800">Order → Collection (hrs)</th>
                      <th className="border px-4 py-3 text-left font-semibold text-gray-800">Collection → Result (hrs)</th>
                      <th className="border px-4 py-3 text-left font-semibold text-gray-800">Order → Result (hrs)</th>
                      <th className="border px-4 py-3 text-left font-semibold text-gray-800">Result → Approval (hrs)</th>
                      <th className="border px-4 py-3 text-left font-semibold text-gray-800">Order → Approval (hrs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((item, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0
                            ? "bg-white hover:bg-blue-50 transition"
                            : "bg-blue-50 hover:bg-blue-100 transition"
                        }
                      >
                        <td className="border px-4 py-2 font-medium text-gray-700">{item.testName}</td>
                        <td className="border px-4 py-2 text-gray-700">{item.turnaroundHours.orderToCollection?.toFixed(2) || "N/A"}</td>
                        <td className="border px-4 py-2 text-gray-700">{item.turnaroundHours.collectionToResult?.toFixed(2) || "N/A"}</td>
                        <td className="border px-4 py-2 text-gray-700">{item.turnaroundHours.orderToResult?.toFixed(2) || "N/A"}</td>
                        <td className="border px-4 py-2 text-gray-700">{item.turnaroundHours.resultToApproval?.toFixed(2) || "N/A"}</td>
                        <td className="border px-4 py-2 text-gray-700">{item.turnaroundHours.orderToApproval?.toFixed(2) || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default withAuth(TurnaroundTimePage, ["doctor", "labtech"]);
