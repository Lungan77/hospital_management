"use client";

import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";

function MyTestOrders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch("/api/tests/my");
    const data = await res.json();
    if (res.ok) {
      setOrders(data.orders);
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Medical Test Orders</h1>
      {message && <p className="text-red-500">{message}</p>}

      {orders.length === 0 ? (
        <p>No test orders found.</p>
      ) : (
        <ul className="space-y-6">
          {orders.map((order) => (
            <li key={order._id} className="bg-gray-100 p-4 rounded-lg shadow">
              <p className="font-semibold">Appointment Date: {new Date(order.appointmentId.date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 mb-2">Ordered on {new Date(order.createdAt).toLocaleString()}</p>
              <ul className="space-y-2">
                {order.tests.map((test, idx) => (
                  <li key={idx} className="border p-3 rounded bg-white">
                    <p><strong>Test:</strong> {test.name}</p>
                    <p><strong>Sample:</strong> {test.sampleType}</p>
                    <p><strong>Priority:</strong> {test.priority}</p>
                    <p><strong>Status:</strong> <span className={
                      test.status === "Completed" ? "text-green-600" :
                      test.status === "In Progress" ? "text-yellow-600" : "text-red-600"
                    }>{test.status}</span></p>
                    <p><strong>Expected Results:</strong> {test.expectedResultDate ? new Date(test.expectedResultDate).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Reason:</strong> {test.reason}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default withAuth(MyTestOrders, ["doctor", "patient"]);