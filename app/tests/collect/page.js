"use client";

import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { useRouter } from "next/navigation";

function RegisterSamples() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch("/api/tests/all");
    const data = await res.json();
    if (res.ok) {
      const pending = data.orders.map((o) => ({
        ...o,
        tests: o.tests.map((t, idx) => ({ ...t, testIndex: idx })),
      })).filter(o => o.tests.some(t => t.status === "Pending Sample Collection"));
      setOrders(pending);
    } else {
      setMessage(data.error);
    }
  };

  const registerSample = async (orderId) => {
    router.push(`/tests/collect/${orderId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Register Test Samples</h1>
      {message && <p className="text-green-600 mb-4">{message}</p>}

      {orders.length === 0 ? (
        <p>No tests awaiting sample collection.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order._id} className="bg-gray-100 p-4 rounded shadow">
              <p className="font-semibold">Appointment Date: {new Date(order.appointmentId.date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Patient: {order.appointmentId.patientId.name}</p>
              <p className="text-sm text-gray-600">Doctor: {order.appointmentId.doctorId.name}</p>
              <ul className="mt-2 space-y-2">
                {order.tests
                  .filter((t) => t.status === "Pending Sample Collection")
                  .map((test) => (
                    <li key={test.testIndex} className="bg-white p-3 border rounded">
                      <p><strong>Test:</strong> {test.name}</p>
                      <p><strong>Sample Type:</strong> {test.sampleType}</p>
                      <p><strong>Instructions:</strong> {test.instructions}</p>
                      <p><strong>Priority:</strong> {test.priority}</p>
                      <p><strong>Status:</strong> {test.status}</p>
                      <button
                        className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                        onClick={() => registerSample(order._id, test.testIndex)}
                      >
                        Register Sample
                      </button>
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

export default withAuth(RegisterSamples, ["labtech", "nurse"]);
