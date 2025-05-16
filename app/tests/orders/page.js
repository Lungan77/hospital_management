"use client";

import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import Link from "next/link";

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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Test Orders</h1>

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
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
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

      {/* Orders Table */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No test orders found.</p>
      ) : (
        <table className="w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Patient</th>
              <th className="border px-3 py-2">Appointment</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Created At</th>
              <th className="border px-3 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border px-3 py-2">
                  {order.appointmentId.patientId || "N/A"}
                </td>
                <td className="border px-3 py-2">
                  {order.appointmentId?.date
                    ? new Date(order.appointmentId.date).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="border px-3 py-2">{order.tests[0].status}</td>
                <td className="border px-3 py-2">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="border px-3 py-2">
                  <Link
                    href={`/test-orders/${order._id}`}
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

export default withAuth(TestOrdersPage, ["doctor"]);
