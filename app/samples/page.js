"use client";

import { useEffect, useState, useRef } from "react";
import withAuth from "@/hoc/withAuth";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";

// Component to render barcode as SVG
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

// Sample item with Store + Export options
function SampleItem({ sample, onExport, onStoreClick }) {
  const [showBarcode, setShowBarcode] = useState(false);

  return (
    <li className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition hover:shadow-2xl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
            {sample.sampleType}
          </span>
          <span className="text-gray-400 text-xs">#{sample.barcode}</span>
        </div>
        <div className="text-gray-700 text-sm">
          <strong>Collected:</strong> {new Date(sample.collectionTime).toLocaleString()}
        </div>
        <div className="text-gray-500 text-xs">
          <strong>Test Order:</strong> {sample.testOrderId?._id || "N/A"}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        {/* Conditionally render storage info or Store button */}
        {sample.storage?.currentLocation?.unit && sample.storage?.currentLocation?.shelf ? (
          <div className="text-sm bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg shadow">
            <strong>Stored at:</strong> {sample.storage.currentLocation.unit} / {sample.storage.currentLocation.shelf}
          </div>
        ) : (
          <button
            onClick={() => onStoreClick(sample)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          >
            Store Sample
          </button>
        )}

        <button
          onClick={() => onExport(sample)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          Export PDF
        </button>

        <button
          onClick={() => setShowBarcode(!showBarcode)}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
        >
          {showBarcode ? "Hide" : "Show"} Barcode
        </button>
      </div>
      {showBarcode && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 flex justify-center">
          <BarcodeSVG value={sample.barcode} />
        </div>
      )}
    </li>
  );
}

export default withAuth(function SamplesPage() {
  const [samples, setSamples] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [pdfDataUrl, setPdfDataUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sampleToExport, setSampleToExport] = useState(null);

  const [storageModalOpen, setStorageModalOpen] = useState(false);
  const [storageUnit, setStorageUnit] = useState("");
  const [storageShelf, setStorageShelf] = useState("");
  const [sampleToStore, setSampleToStore] = useState(null);

  const canvasRef = useRef(null);

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

    pdf.setFontSize(16);
    pdf.setTextColor("#003366");
    pdf.text("Hospital - Lab Barcode", pageWidth / 2, 40, { align: "center" });
    pdf.setDrawColor("#003366");
    pdf.setLineWidth(1);
    pdf.line(40, 50, pageWidth - 40, 50);

    const barcodeImg = generateBarcodeDataUrl(sample.barcode);
    const imgWidth = 300;
    const imgHeight = 80;
    const imgX = (pageWidth - imgWidth) / 2;
    const imgY = 80;

    pdf.addImage(barcodeImg, "PNG", imgX, imgY, imgWidth, imgHeight);

    pdf.setFontSize(12);
    pdf.setTextColor("#000");
    pdf.text(`Barcode: ${sample.barcode}`, pageWidth / 2, imgY + imgHeight + 30, { align: "center" });
    pdf.text(`Sample Type: ${sample.sampleType}`, pageWidth / 2, imgY + imgHeight + 50, { align: "center" });
    pdf.text(`Collected: ${new Date(sample.collectionTime).toLocaleString()}`, pageWidth / 2, imgY + imgHeight + 70, { align: "center" });

    pdf.setFontSize(10);
    pdf.setTextColor("#666");
    pdf.text("Page 1 of 1", pageWidth - 60, pageHeight - 30);

    return pdf.output("dataurlstring");
  };

  const handleExportPDF = (sample) => {
    const dataUrl = generatePDF(sample);
    setPdfDataUrl(dataUrl);
    setSampleToExport(sample);
    setShowModal(true);
  };

  const handleStoreClick = (sample) => {
    setSampleToStore(sample);
    setStorageUnit("");
    setStorageShelf("");
    setStorageModalOpen(true);
  };

  const submitStorage = async () => {
    if (!sampleToStore || !storageUnit || !storageShelf) {
      alert("Please enter both unit and shelf.");
      return;
    }

    try {
      const res = await fetch(`/api/samples/store/${sampleToStore._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit: storageUnit, shelf: storageShelf }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Sample stored successfully.");
        fetchSamples(); // Refresh list
      } else {
        alert(data.error || "Failed to store sample.");
      }
    } catch (error) {
      alert("Error storing sample.");
    } finally {
      setStorageModalOpen(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const filteredSamples = samples.filter((sample) =>
    [sample.barcode, sample.sampleType].some((val) =>
      (val || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-extrabold mb-6 text-blue-900 tracking-tight">
        Registered Test Samples
      </h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search by barcode or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
          >
            Clear
          </button>
        )}
      </div>

      {message && (
        <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {message}
        </div>
      )}

      {filteredSamples.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No samples found.</div>
      ) : (
        <ul className="space-y-8">
          {filteredSamples.map((sample) => (
            <SampleItem
              key={sample._id}
              sample={sample}
              onExport={handleExportPDF}
              onStoreClick={handleStoreClick}
            />
          ))}
        </ul>
      )}

      {/* PDF Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border-2 border-blue-200">
            <div className="flex justify-between items-center p-6 border-b border-blue-100">
              <h2 className="text-xl font-bold text-blue-900">PDF Preview</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-700 hover:text-blue-700 font-bold text-2xl leading-none focus:outline-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <iframe src={pdfDataUrl} className="w-full h-[60vh] rounded-lg border" title="PDF Preview" />
            </div>

            <div className="flex justify-end gap-4 p-6 border-t border-blue-100">
              <a
                href={pdfDataUrl}
                download={`Barcode_${sampleToExport?.barcode}.pdf`}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                Download PDF
              </a>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Modal */}
      {storageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border-2 border-green-200">
            <h2 className="text-2xl font-bold mb-6 text-green-800">Store Sample</h2>

            <input
              type="text"
              placeholder="Storage Unit"
              value={storageUnit}
              onChange={(e) => setStorageUnit(e.target.value)}
              className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            />
            <input
              type="text"
              placeholder="Shelf"
              value={storageShelf}
              onChange={(e) => setStorageShelf(e.target.value)}
              className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStorageModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitStorage}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}, ["labtech", "doctor"]);
