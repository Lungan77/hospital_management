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

  // Handle barcode scan with correct onUpdate signature
  const handleScan = ({ error, text }) => {
    if (text && text !== scannedCode) {
      setScannedCode(text);
      fetchSample(text);
    }
  };

  // Reset scannedCode when sample is cleared
  useEffect(() => {
    if (!sample) {
      setScannedCode("");
    }
  }, [sample]);

  return (
    <div className="p-4 sm:p-6 max-w-full sm:max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Scan Sample Barcode</h1>

      {message && <p className="text-center text-red-500 mb-4">{message}</p>}

      {!sample && (
        <div className="bg-black rounded-lg overflow-hidden shadow-lg max-w-full mx-auto" style={{ maxWidth: 600 }}>
          <BarcodeScannerComponent
            width={window.innerWidth > 600 ? 600 : window.innerWidth * 0.9}
            height={window.innerWidth > 600 ? 300 : (window.innerWidth * 0.9) / 2}
            onUpdate={handleScan}
            facingMode="environment"
          />
          <p className="text-sm text-center text-gray-300 py-2 bg-gray-800">
            Align the barcode within the frame
          </p>
        </div>
      )}

      {sample && (
        <div className="mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-full mx-auto" style={{ maxWidth: 600 }}>
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
