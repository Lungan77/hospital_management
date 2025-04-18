"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import withAuth from "@/hoc/withAuth";

function OrderMedicalTest() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [message, setMessage] = useState("");

  const testCatalog = ["Blood Test", "Urine Test", "X-ray", "CT Scan"];

  useEffect(() => {
    if (appointmentId) {
      fetch(`/api/appointments/${appointmentId}`)
        .then(res => res.json())
        .then(data => setAppointment(data.appointment))
        .catch(() => setMessage("Failed to load appointment."));
    }
  }, [appointmentId]);

  const toggleTest = (test) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const submitOrder = async () => {
    if (!selectedTests.length) {
      setMessage("Please select at least one test.");
      return;
    }

    const res = await fetch("/api/tests/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, tests: selectedTests }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Order Medical Test</h1>
      {message && <p className="text-red-500 mt-2">{message}</p>}

      {appointment && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p><strong>Patient:</strong> {appointment.patientId.name}</p>
          <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {appointment.timeSlot}</p>
        </div>
      )}

      <div className="mt-4">
        <p className="font-semibold">Select Tests:</p>
        {testCatalog.map((test) => (
          <label key={test} className="block mt-2">
            <input
              type="checkbox"
              value={test}
              onChange={() => toggleTest(test)}
              checked={selectedTests.includes(test)}
              className="mr-2"
            />
            {test}
          </label>
        ))}
      </div>

      <button
        onClick={submitOrder}
        className="mt-6 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 w-full"
      >
        Submit Test Order
      </button>
    </div>
  );
}

export default withAuth(OrderMedicalTest, ["doctor"]);
