"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";

function CollectSample() {
  const { testOrderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [testIndex, setTestIndex] = useState("");
  const [barcode, setBarcode] = useState("");
  const [sampleType, setSampleType] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (testOrderId) fetchOrder();
  }, [testOrderId]);

  const fetchOrder = async () => {
    const res = await fetch("/api/tests/all");
    const data = await res.json();
    if (res.ok) {
      const found = data.orders.find((o) => o._id === testOrderId);
      setOrder(found);
    } else {
      setMessage(data.error);
    }
  };

  const submitSample = async () => {
    if (testIndex === "") return setMessage("Please select a test.");
    if (!barcode || !sampleType) return setMessage("Barcode and sample type required.");

    const res = await fetch("/api/tests/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testOrderId, testIndex, barcode, sampleType, notes }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) router.push("/tests/collect");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Collect and Register Sample</h1>
      {message && <p className="mt-2 text-red-500">{message}</p>}

      {order ? (
        <>
          <label className="block mt-4 font-semibold">Select Test</label>
          <select
            className="p-2 border w-full"
            onChange={(e) => setTestIndex(e.target.value)}
            value={testIndex}
          >
            <option value="">-- Choose a test --</option>
            {order.tests.map((test, index) =>
              test.status === "Pending Sample Collection" ? (
                <option key={index} value={index}>
                  {test.name} (Sample: {test.sampleType})
                </option>
              ) : null
            )}
          </select>

          <input
            type="text"
            placeholder="Sample Barcode"
            className="mt-4 p-2 border w-full"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          <input
            type="text"
            placeholder="Sample Type"
            className="mt-4 p-2 border w-full"
            value={sampleType}
            onChange={(e) => setSampleType(e.target.value)}
          />
          <textarea
            placeholder="Additional Notes (optional)"
            className="mt-4 p-2 border w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button
            onClick={submitSample}
            className="mt-4 bg-blue-600 text-white p-2 w-full rounded hover:bg-blue-700"
          >
            Submit Sample
          </button>
        </>
      ) : (
        <p className="mt-4">Loading test order...</p>
      )}
    </div>
  );
}

export default withAuth(CollectSample, ["labtech"]);
