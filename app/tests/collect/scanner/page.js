"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useReactToPrint } from "react-to-print";
import BarcodeLabel from "@/components/BarcodeLabel";
import withAuth from "@/hoc/withAuth";

// Dynamically import the scanner (client-only)
const BarcodeScannerComponent = dynamic(
  () => import("react-qr-barcode-scanner"),
  { ssr: false }
);

function BarcodeScannerPage() {
  const [scannedCode, setScannedCode] = useState("");
  const [sample, setSample] = useState(null);
  const [message, setMessage] = useState("");
  const componentRef = useRef();

  // Print handler
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Handle barcode scan
  const handleScan = async (err, result) => {
    if (result?.text && result.text !== scannedCode) {
      const barcode = result.text;
      setScannedCode(barcode);
      await fetchSample(barcode);
    }
  };

  // Fetch sample from server
  const fetchSample = async (barcode) => {
    try {
      const res = await fetch(`/api/samples/barcode/${barcode}`);
      const data = await res.json();
      if (res.ok) {
        setSample(data.sample);
        setMessage("");
      } else {
        setSample(null);
        setMessage(data.error || "Sample not found.");
      }
    } catch (error) {
      console.error("Error fetching sample:", error);
      setMessage("Server error while fetching sample.");
      setSample(null);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Scan Sample Barcode</h1>

      {message && <p className="text-center text-red-500 mb-4">{message}</p>}

      {!sample && (
        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
          <BarcodeScannerComponent
            width={600}
            height={300}
            onUpdate={handleScan}
          />
          <p className="text-sm text-center text-gray-300 py-2 bg-gray-800">
            Align the barcode within the frame
          </p>
        </div>
      )}

      {sample && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <div ref={componentRef} className="mb-4 border p-4 rounded bg-gray-50">
            <BarcodeLabel
              value={sample.barcode}
              label={`Sample for ${sample.sampleType}`}
              priority={sample.priority}
              reason={sample.reason}
            />
          </div>

          <div className="space-y-2 text-sm">
            <p><strong>Barcode:</strong> {sample.barcode}</p>
            <p><strong>Sample Type:</strong> {sample.sampleType}</p>
            <p><strong>Collected:</strong> {new Date(sample.collectionTime).toLocaleString()}</p>
            <p><strong>Test Name:</strong> {sample.testName}</p>
            <p><strong>Priority:</strong> {sample.priority}</p>
            <p><strong>Reason:</strong> {sample.reason}</p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              🖨️ Print Barcode
            </button>

            <button
              onClick={() => {
                setSample(null);
                setScannedCode("");
                setMessage("");
              }}
              className="bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
            >
              🔄 Scan Another Sample
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(BarcodeScannerPage, ["labtech"]);
