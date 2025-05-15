"use client";

import { useEffect, useState, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useReactToPrint } from "react-to-print";
import BarcodeLabel from "@/components/BarcodeLabel";
import withAuth from "@/hoc/withAuth";

function BarcodeScannerPage() {
  const [scannedCode, setScannedCode] = useState("");
  const [sample, setSample] = useState(null);
  const [message, setMessage] = useState("");
  const videoRef = useRef(null);
  const codeReader = useRef(null);
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

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    codeReader.current
      .decodeFromVideoDevice(
        null, // null selects default camera
        videoRef.current,
        (result, err) => {
          if (result) {
            const text = result.getText();
            if (text !== scannedCode) {
              setScannedCode(text);
              fetchSample(text);
            }
          }
          // You can handle errors here if you want
        }
      )
      .catch((err) => {
        console.error("Camera initialization error:", err);
        setMessage("Cannot access camera or no camera found.");
      });

    return () => {
      if (codeReader.current) {
        // Stop all video tracks to release camera
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
        // Call reset if function exists (avoid error)
        if (typeof codeReader.current.reset === "function") {
          codeReader.current.reset();
        }
      }
    };
  }, [scannedCode]);

  // Reset scannedCode and message when sample is cleared
  useEffect(() => {
    if (!sample) {
      setScannedCode("");
      setMessage("");
    }
  }, [sample]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Scan Sample Barcode</h1>

      {message && <p className="text-center text-red-500 mb-4">{message}</p>}

      {!sample && (
        <div
          className="bg-black rounded-lg overflow-hidden shadow-lg relative"
          style={{ aspectRatio: "16 / 9" }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            autoPlay
          />
          <p className="text-sm text-center text-gray-300 py-2 bg-gray-800 absolute bottom-0 left-0 right-0">
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
            <p>
              <strong>Barcode:</strong> {sample.barcode}
            </p>
            <p>
              <strong>Sample Type:</strong> {sample.sampleType}
            </p>
            <p>
              <strong>Collected:</strong>{" "}
              {new Date(sample.collectionTime).toLocaleString()}
            </p>
            <p>
              <strong>Test Name:</strong> {sample.testName}
            </p>
            <p>
              <strong>Priority:</strong> {sample.priority}
            </p>
            <p>
              <strong>Reason:</strong> {sample.reason}
            </p>
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
