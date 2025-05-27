"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";


function OrderMedicalTest() {
  const router = useRouter();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [testDetails, setTestDetails] = useState({});

  const testCatalog = {
    "Laboratory": [
      { name: "Complete Blood Count", sample: "Blood", instructions: "Fasting not required" },
      { name: "Blood Glucose", sample: "Blood", instructions: "Fasting for 8 hours" },
      { name: "Urine Analysis", sample: "Urine", instructions: "Midstream sample" },
      { name: "Liver Function Test", sample: "Blood", instructions: "No alcohol for 24 hrs" },
    ],
    "Imaging": [
      { name: "Chest X-Ray", sample: "N/A", instructions: "Remove metal items" },
      { name: "CT Scan", sample: "N/A", instructions: "May require contrast" },
      { name: "MRI", sample: "N/A", instructions: "Screen for metal implants" },
      { name: "Ultrasound", sample: "N/A", instructions: "Full bladder if pelvic scan" },
    ],
    "Cardiology": [
      { name: "ECG", sample: "N/A", instructions: "Relax before test" },
      { name: "Echocardiogram", sample: "N/A", instructions: "No special prep" },
      { name: "Stress Test", sample: "N/A", instructions: "Wear running shoes" },
    ],
  };

  useEffect(() => {
    if (appointmentId) {
      fetch(`/api/appointments/${appointmentId}`)
        .then((res) => res.json())
        .then((data) => setAppointment(data.appointment))
        .catch(() => setMessage("Failed to load appointment."));
    }
  }, [appointmentId]);

  const handleSelectTest = (test) => {
    const isSelected = selectedTests.includes(test.name);
    if (isSelected) {
      setSelectedTests(selectedTests.filter((t) => t !== test.name));
      const updatedDetails = { ...testDetails };
      delete updatedDetails[test.name];
      setTestDetails(updatedDetails);
    } else {
      setSelectedTests([...selectedTests, test.name]);
      setTestDetails({
        ...testDetails,
        [test.name]: {
          sampleType: test.sample,
          instructions: test.instructions,
          reason: "",
          priority: "Routine",
          expectedResultDate: "",
        },
      });
    }
  };

  const handleDetailChange = (testName, field, value) => {
    setTestDetails({
      ...testDetails,
      [testName]: {
        ...testDetails[testName],
        [field]: value,
      },
    });
  };

  const handleSubmit = async () => {
    if (!selectedTests.length) {
      setMessage("Please select at least one test.");
      return;
    }

    const orderedTests = selectedTests.map((name) => ({
      name,
      ...testDetails[name],
    }));

    const res = await fetch("/api/tests/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, tests: orderedTests }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
    setTimeout(() => {
        router.push("/appointments");
      }, 1000)
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Order Medical Test</h1>

      {message && <p className="text-red-500">{message}</p>}

      {appointment && (
        <div className="bg-gray-100 p-4 mb-6 rounded">
          <p><strong>Patient:</strong> {appointment.patientId.name}</p>
          <p><strong>Doctor:</strong> {appointment.doctorId.name}</p>
          <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
        </div>
      )}

      {Object.entries(testCatalog).map(([category, tests]) => (
        <div key={category} className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{category}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tests.map((test) => (
              <label key={test.name} className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedTests.includes(test.name)}
                  onChange={() => handleSelectTest(test)}
                />
                {test.name}
              </label>
            ))}
          </div>
        </div>
      ))}

      {selectedTests.map((testName) => (
        <div key={testName} className="border p-4 mb-4 rounded bg-gray-50">
          <h3 className="font-bold mb-2">{testName}</h3>
          <p><strong>Sample:</strong> {testDetails[testName]?.sampleType}</p>
          <p><strong>Instructions:</strong> {testDetails[testName]?.instructions}</p>

          <label className="block mt-2 font-semibold">Reason for Test</label>
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Clinical justification"
            value={testDetails[testName]?.reason || ""}
            onChange={(e) => handleDetailChange(testName, "reason", e.target.value)}
          />

          <label className="block mt-2 font-semibold">Priority</label>
          <select
            className="w-full border p-2 rounded"
            value={testDetails[testName]?.priority}
            onChange={(e) => handleDetailChange(testName, "priority", e.target.value)}
          >
            <option>Routine</option>
            <option>Urgent</option>
            <option>STAT</option>
          </select>

          <label className="block mt-2 font-semibold">Expected Result Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={testDetails[testName]?.expectedResultDate}
            onChange={(e) =>
              handleDetailChange(testName, "expectedResultDate", e.target.value)
            }
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded"
      >
        Submit Order
      </button>
    </div>
  );
}

export default withAuth(OrderMedicalTest, ["doctor"]);
