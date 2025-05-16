"use client";

import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import Link from "next/link";

function DoctorTestResults() {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetch("/api/results/doctor")
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setFilteredResults(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = results;

    if (statusFilter) {
      filtered = filtered.filter((result) => result.status === statusFilter);
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(
        (result) => new Date(result.recordedAt) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(
        (result) => new Date(result.recordedAt) <= end
      );
    }

    setFilteredResults(filtered);
  }, [statusFilter, startDate, endDate, results]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Patients&apos; Test Results</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="recorded">Recorded</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredResults.length === 0 ? (
        <p>No test results found.</p>
      ) : (
        <table className="w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Patient</th>
              <th className="border px-3 py-2">Test</th>
              <th className="border px-3 py-2">Recorded By</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border px-3 py-2">
                  {result.testOrderId.appointmentId.patientId?.name}
                </td>
                <td className="border px-3 py-2">{result.testName}</td>
                <td className="border px-3 py-2">{result.recordedBy?.name}</td>
                <td className="border px-3 py-2">{result.status}</td>
                <td className="border px-3 py-2">
                  {new Date(result.recordedAt).toLocaleString()}
                </td>
                <td className="border px-3 py-2">
                  <Link
                    href={`/results/doctor/${result._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default withAuth(DoctorTestResults, ["doctor"]);
