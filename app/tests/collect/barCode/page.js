"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import BarcodeLabel from "@/components/BarcodeLabel";

export default function PrintSampleBarcodePage() {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div className="border p-4 bg-white rounded max-w-md mx-auto mt-10">
      <div ref={componentRef}>
        <BarcodeLabel value="SMP-123456" label="Sample for Blood Test" />
      </div>
      <button
        onClick={handlePrint}
        className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
      >
        Print Barcode
      </button>
    </div>
  );
}
