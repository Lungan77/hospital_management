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
    <div className="p-8 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-3xl font-extrabold mb-6 text-blue-800 flex items-center gap-2">
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h3m4 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        My Patients&apos; Test Results
      </h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-6 items-end bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div>
          <label className="block text-xs font-semibold text-blue-700 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-36 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-2 py-1"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="recorded">Recorded</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-blue-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-36 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-blue-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block w-36 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-2 py-1"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <svg className="animate-spin h-8 w-8 text-blue-500 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span className="text-blue-700 font-semibold">Loading...</span>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-gray-500 font-medium">
            No test results found.
          </div>
        ) : (
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Patient</th>
                <th className="px-4 py-3 text-left font-semibold">Test</th>
                <th className="px-4 py-3 text-left font-semibold">Recorded By</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}
                >
                  <td className="px-4 py-2">
                    {result.testOrderId.appointmentId.patientId?.name}
                  </td>
                  <td className="px-4 py-2">{result.testName}</td>
                  <td className="px-4 py-2">{result.recordedBy?.name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        "inline-block px-2 py-1 rounded-full text-xs font-bold " +
                        (result.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : result.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700")
                      }
                    >
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {new Date(result.recordedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/results/${result._id}`}
                      className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      View 
                    </Link>
                    <Link
                      href={`/results/feedback/${result._id}`}
                      className="inline-block px-3 py-1 ml-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                       Feedback
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default withAuth(DoctorTestResults, ["doctor"]);
