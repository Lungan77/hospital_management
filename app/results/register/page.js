"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/loader";

export default function RegisterTestResult() {
  const [barcode, setBarcode] = useState("");
  const [sampleInfo, setSampleInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([
    { parameter: "", value: "", unit: "", referenceRange: "", interpretation: "" },
  ]);
  const [comments, setComments] = useState("");
  const router = useRouter();

  const handleBarcodeSearch = async () => {
    if (!barcode.trim()) {
      toast.error("Please enter a barcode.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/samples/barcode/${barcode}`);
      const data = await res.json();
      if (res.ok && data.sample) {
        setSampleInfo(data.sample);
        toast.success("Sample found");
      } else {
        setSampleInfo(null);
        toast.error(data.error || "Sample not found");
      }
    } catch (error) {
      toast.error("Error fetching sample");
    } finally {
      setLoading(false);
    }
  };

  const handleResultChange = (index, field, value) => {
    const updatedResults = [...results];
    updatedResults[index][field] = value;
    setResults(updatedResults);
  };

  const addResultRow = () => {
    setResults([...results, { parameter: "", value: "", unit: "", referenceRange: "", interpretation: "" }]);
  };

  const removeResultRow = (index) => {
    if (results.length === 1) return; // Always keep at least one row
    setResults(results.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sampleInfo) {
      toast.error("Please search and load a sample first.");
      return;
    }
    if (results.some(r => !r.parameter || !r.value)) {
      toast.error("Parameter and Value fields are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/results/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode,
          testOrderId: sampleInfo.testOrderId,
          testName: sampleInfo.testName,
          results,
          comments,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Test result registered successfully");
        router.push(`/lab/results/${sampleInfo.testOrderId}`);
      } else {
        toast.error(data.message || "Submission failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Register Test Results</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">Enter Sample Barcode</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="Scan or enter barcode"
          />
          <button
            onClick={handleBarcodeSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            Search
          </button>
        </div>
      </div>

      {loading && <Loader />}

      {sampleInfo && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-semibold text-lg mb-2">Sample Information</h3>
          <p><strong>Test Name:</strong> {sampleInfo.testName}</p>
        </div>
      )}

      {sampleInfo && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
          <h3 className="text-lg font-semibold">Test Results</h3>

          {results.map((result, i) => (
            <div key={i} className="grid grid-cols-6 gap-3 items-center">
              <input
                type="text"
                placeholder="Parameter"
                value={result.parameter}
                onChange={e => handleResultChange(i, "parameter", e.target.value)}
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Value"
                value={result.value}
                onChange={e => handleResultChange(i, "value", e.target.value)}
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Unit"
                value={result.unit}
                onChange={e => handleResultChange(i, "unit", e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Reference Range"
                value={result.referenceRange}
                onChange={e => handleResultChange(i, "referenceRange", e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Interpretation"
                value={result.interpretation}
                onChange={e => handleResultChange(i, "interpretation", e.target.value)}
                className="border p-2 rounded"
              />
              {results.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeResultRow(i)}
                  className="text-red-600"
                  title="Remove row"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addResultRow}
            className="text-blue-600 underline"
          >
            + Add Another Parameter
          </button>

          <div className="mt-4">
            <label className="block font-medium mb-1">Comments (optional)</label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="border p-2 w-full rounded"
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded mt-4 hover:bg-green-700"
            disabled={loading}
          >
            Submit Results
          </button>
        </form>
      )}
    </div>
  );
}
