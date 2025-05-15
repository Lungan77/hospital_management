"use client";

import { useEffect, useState, useRef } from "react";
import withAuth from "@/hoc/withAuth";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";

function SampleItem({ sample, onExport }) {
  const [showBarcode, setShowBarcode] = useState(false);

  return (
    <li className="bg-white p-4 rounded shadow">
      <p><strong>Barcode:</strong> {sample.barcode}</p>
      <p><strong>Sample Type:</strong> {sample.sampleType}</p>
      <p><strong>Collected:</strong> {new Date(sample.collectionTime).toLocaleString()}</p>
      <p><strong>Test Order:</strong> {sample.testOrderId?._id || "N/A"}</p>

      <div className="flex gap-4 mt-4">
        <button
          onClick={() => onExport(sample)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export PDF
        </button>
        <button
          onClick={() => setShowBarcode(!showBarcode)}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          {showBarcode ? "Hide" : "Show"} Barcode
        </button>
      </div>

      {showBarcode && (
        <div className="mt-4 p-2 border rounded bg-gray-50">
          {/* Display barcode SVG here */}
          <BarcodeSVG value={sample.barcode} />
        </div>
      )}
    </li>
  );
}

// Component to render barcode as SVG using JsBarcode
function BarcodeSVG({ value }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, value, {
        format: "code128",
        displayValue: true,
        fontSize: 14,
        height: 60,
        margin: 0,
      });
    }
  }, [value]);

  return <svg ref={svgRef} />;
}

export default withAuth(function SamplesPage() {
  const [samples, setSamples] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [pdfDataUrl, setPdfDataUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sampleToExport, setSampleToExport] = useState(null);

  // Hidden canvas to generate barcode images for PDF
  const canvasRef = useRef(null);

  // Generate barcode image on canvas and return dataURL
  const generateBarcodeDataUrl = (barcodeValue) => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    JsBarcode(canvasRef.current, barcodeValue, {
      format: "code128",
      displayValue: false,
      width: 2,
      height: 60,
      margin: 0,
    });
    return canvasRef.current.toDataURL("image/png");
  };

  const generatePDF = (sample) => {
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Header
    pdf.setFontSize(16);
    pdf.setTextColor("#003366");
    pdf.text("Hospital - Lab Barcode", pageWidth / 2, 40, { align: "center" });
    pdf.setDrawColor("#003366");
    pdf.setLineWidth(1);
    pdf.line(40, 50, pageWidth - 40, 50);

    // Generate barcode image
    const barcodeImg = generateBarcodeDataUrl(sample.barcode);

    // Barcode image dimensions
    const imgWidth = 300;
    const imgHeight = 80;
    const imgX = (pageWidth - imgWidth) / 2;
    const imgY = 80;

    // Add barcode image to PDF
    pdf.addImage(barcodeImg, "PNG", imgX, imgY, imgWidth, imgHeight);

    // Details below barcode
    pdf.setFontSize(12);
    pdf.setTextColor("#000");
    pdf.text(`Barcode: ${sample.barcode}`, pageWidth / 2, imgY + imgHeight + 30, { align: "center" });
    pdf.text(`Sample Type: ${sample.sampleType}`, pageWidth / 2, imgY + imgHeight + 50, { align: "center" });
    pdf.text(`Collected: ${new Date(sample.collectionTime).toLocaleString()}`, pageWidth / 2, imgY + imgHeight + 70, { align: "center" });

    // Footer with page number
    pdf.setFontSize(10);
    pdf.setTextColor("#666");
    const footerText = `Page 1 of 1`;
    pdf.text(footerText, pageWidth - 60, pageHeight - 30);

    return pdf.output("dataurlstring");
  };

  const handleExportPDF = (sample) => {
    const dataUrl = generatePDF(sample);
    setPdfDataUrl(dataUrl);
    setSampleToExport(sample);
    setShowModal(true);
  };

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

  const filteredSamples = samples.filter((sample) =>
    [sample.barcode, sample.sampleType].some((val) =>
      val.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registered Test Samples</h1>

      {/* Search */}
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
            <SampleItem
              key={sample._id}
              sample={sample}
              onExport={handleExportPDF}
            />
          ))}
        </ul>
      )}

      {/* PDF Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">PDF Preview</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-700 hover:text-gray-900 font-bold text-xl leading-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <iframe
                src={pdfDataUrl}
                title="PDF Preview"
                className="w-full h-full"
                frameBorder="0"
              />
            </div>
            <div className="flex justify-end gap-4 p-4 border-t">
              <a
                href={pdfDataUrl}
                download={`Barcode_${sampleToExport?.barcode}.pdf`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Download PDF
              </a>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}, ["labtech", "doctor"]);
