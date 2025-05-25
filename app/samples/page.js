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
    <li className="bg-white p-4 rounded shadow">
      <p><strong>Barcode:</strong> {sample.barcode}</p>
      <p><strong>Sample Type:</strong> {sample.sampleType}</p>
      <p><strong>Collected:</strong> {new Date(sample.collectionTime).toLocaleString()}</p>
      <p><strong>Test Order:</strong> {sample.testOrderId?._id || "N/A"}</p>

      <div className="flex gap-4 mt-4">
        <button
          onClick={() => onStoreClick(sample)}
          className="bg-green-600 text-white px-3 py-2 rounded"
        >
          Store Sample
        </button>

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
      console.log(sampleToStore._id)
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
      console.error("Error:", error);
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

      {message && <p className="text-green-600 mb-4">{message}</p>}

      {filteredSamples.length === 0 ? (
        <p>No samples found.</p>
      ) : (
        <ul className="space-y-6">
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
              <iframe src={pdfDataUrl} className="w-full h-full" title="PDF Preview" />
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

      {/* Storage Modal */}
      {storageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Store Sample</h2>

            <input
              type="text"
              placeholder="Storage Unit"
              value={storageUnit}
              onChange={(e) => setStorageUnit(e.target.value)}
              className="w-full mb-2 px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Shelf"
              value={storageShelf}
              onChange={(e) => setStorageShelf(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setStorageModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitStorage}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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
