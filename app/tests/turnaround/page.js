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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Test Turnaround Time Analysis</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="bg-white p-6 rounded shadow mb-10">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Visual Chart Overview</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={60} />
                <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Order → Collection" stackId="a" fill="#8884d8" />
                <Bar dataKey="Collection → Result" stackId="a" fill="#82ca9d" />
                <Bar dataKey="Result → Approval" stackId="a" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Detailed Table</h2>
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
          </div>
        </>
      )}
    </div>
  );
}

export default withAuth(TurnaroundTimePage, ["doctor", "labtech"]);
