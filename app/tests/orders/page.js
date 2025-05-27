"use client";

import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import Link from "next/link";

function statusColor(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function TestOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetch("/api/tests/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.data || []);
        setFilteredOrders(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) <= end
      );
    }

    setFilteredOrders(filtered);
  }, [statusFilter, startDate, endDate, orders]);

  return (
    <div className="p-8 mx-auto bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-2">
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 0 1 4-4h6M9 17a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9z" /></svg>
        My Test Orders
      </h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-6 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-40 border border-gray-300 rounded-md shadow-sm px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-40 border border-gray-300 rounded-md shadow-sm px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block w-40 border border-gray-300 rounded-md shadow-sm px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-6 w-6 text-blue-500 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-gray-600">Loading...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="mx-auto mb-2 w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 0 1 4-4h6M9 17a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9z" /></svg>
          No test orders found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full table-auto text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Patient</th>
                <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Appointment</th>
                <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Created At</th>
                <th className="border-b px-4 py-3 text-left font-semibold text-gray-700">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">
                      {order.appointmentId.patientId || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.appointmentId?.date
                      ? new Date(order.appointmentId.date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColor(order.tests[0].status)}`}>
                      {order.tests[0].status.charAt(0).toUpperCase() + order.tests[0].status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/test-orders/${order._id}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12H3m0 0l4-4m-4 4l4 4" /></svg>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default withAuth(TestOrdersPage, ["doctor"]);
