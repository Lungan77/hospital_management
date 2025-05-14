"use client";

import { useEffect, useRef, useState } from "react";
import withAuth from "@/hoc/withAuth";
import BarcodeLabel from "@/components/BarcodeLabel";
import { useReactToPrint } from "react-to-print";

// Component for individual sample item
function SampleItem({ sample }) {
  const componentRef = useRef(null);
  const [visibleBarcode, setVisibleBarcode] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <li className="bg-white p-4 rounded shadow">
      <p><strong>Barcode:</strong> {sample.barcode}</p>
      <p><strong>Sample Type:</strong> {sample.sampleType}</p>
      <p><strong>Collected:</strong> {new Date(sample.collectionTime).toLocaleString()}</p>
      <p><strong>Test Order:</strong> {sample.testOrderId?._id || "N/A"}</p>

      {/* Hidden printable barcode */}
      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          <BarcodeLabel
            value={sample.barcode}
            label={`Sample for ${sample.sampleType}`}
          />
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Print Barcode
        </button>

        <button
          onClick={() => setVisibleBarcode(!visibleBarcode)}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {visibleBarcode ? "Hide" : "Show"} Barcode
        </button>
      </div>

      {visibleBarcode && (
        <div className="mt-4 p-2 border rounded bg-gray-50">
          <BarcodeLabel
            value={sample.barcode}
            label={`Sample for ${sample.sampleType}`}
          />
        </div>
      )}
    </li>
  );
}

// Main component for the samples list
function SamplesList() {
  const [samples, setSamples] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await fetch("/api/samples");
      const data = await res.json();
      if (res.ok) {
        setSamples(data.samples);
      } else {
        setMessage(data.error || "Failed to fetch samples.");
      }
    } catch {
      setMessage("Error fetching samples.");
    }
  };

  const filteredSamples = samples.filter(
    (sample) =>
      sample.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.sampleType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registered Test Samples</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by barcode or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border rounded"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="px-3 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Clear
          </button>
        )}
      </div>

      {message && <p className="text-red-500 mb-4">{message}</p>}

      {filteredSamples.length === 0 ? (
        <p>No samples found.</p>
      ) : (
        <ul className="space-y-6">
          {filteredSamples.map((sample) => (
            <SampleItem key={sample._id} sample={sample} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default withAuth(SamplesList, ["labtech", "doctor"]);
