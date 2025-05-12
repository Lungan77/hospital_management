"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useReactToPrint } from "react-to-print";
import BarcodeLabel from "@/components/BarcodeLabel";
import withAuth from "@/hoc/withAuth";

// Dynamically import the scanner to avoid SSR issues
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
    if (result) {
      const barcode = result.text;
      setScannedCode(barcode);
      fetchSample(barcode);
    }
  };

  // Fetch sample by barcode
  const fetchSample = async (barcode) => {
    try {
      const res = await fetch(`/api/samples/barcode/${barcode}`);
      const data = await res.json();
      if (res.ok) {
        setSample(data.sample);
        setMessage("");
      } else {
        setMessage(data.error || "Sample not found.");
      }
    } catch (error) {
      setMessage("Error fetching sample.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Scan Sample Barcode</h1>
      {message && <p className="text-red-500 mb-4">{message}</p>}

      {!sample && (
        <div className="mb-4 border rounded overflow-hidden">
          <BarcodeScannerComponent
            width={500}
            height={300}
            onUpdate={handleScan}
          />
          <p className="text-sm text-center text-gray-600">Align barcode in the frame</p>
        </div>
      )}

      {sample && (
        <div className="bg-white p-4 shadow rounded">
          <div ref={componentRef} className="mb-4">
            <BarcodeLabel
              value={sample.barcode}
              label={`Sample for ${sample.sampleType}`}
            />
          </div>

          <p className="mb-2"><strong>Barcode:</strong> {sample.barcode}</p>
          <p className="mb-2"><strong>Sample Type:</strong> {sample.sampleType}</p>
          <p className="mb-2"><strong>Collected:</strong> {new Date(sample.collectionTime).toLocaleString()}</p>

          <button
            onClick={handlePrint}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Print Sample Barcode
          </button>
        </div>
      )}
    </div>
  );
}

export default withAuth(BarcodeScannerPage, ["labtech"]);
