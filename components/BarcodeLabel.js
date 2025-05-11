"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function BarcodeLabel({ value, label }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, value, {
        format: "CODE128",
        displayValue: true,
        fontSize: 16,
        height: 60,
      });
    }
  }, [value]);

  return (
    <div className="p-4 border rounded bg-white w-fit text-center">
      {label && <p className="font-semibold mb-2">{label}</p>}
      <svg ref={barcodeRef}></svg>
    </div>
  );
}
