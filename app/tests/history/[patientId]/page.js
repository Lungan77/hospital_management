"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import "jspdf-autotable"; // optional for tables formatting
import withAuth from "@/hoc/withAuth";

function LabHistoryPage() {
  const { patientId } = useParams();
  const [history, setHistory] = useState([]);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/patients/lab-tests/${patientId}`);
        const contentType = res.headers.get("content-type");
        if (!res.ok) {
          const data = contentType?.includes("application/json") ? await res.json() : {};
          setError(data.error || "Failed to fetch lab history.");
          return;
        }
        const data = await res.json();
        setHistory(data.results || []);
        setPatient(data.patient || null);
      } catch (err) {
        console.error(err);
        setError("Server error while fetching lab history.");
      }
    };

    if (patientId) fetchHistory();
  }, [patientId]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(patient ? `${patient.name} Lab History` : "Lab History", 14, 22);

    let y = 30;

    history.forEach((record) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.text(record.testName, 14, y);
      doc.setFontSize(11);
      doc.text(`Date: ${new Date(record.completedAt).toLocaleDateString()}`, 160, y);
      y += 10;

      // Header
      const header = ["Parameter", "Value", "Unit", "Reference", "Note"].join(" | ");
      doc.setFontSize(12);
      doc.text(header, 14, y);
      y += 8;

      // Rows
      (record.results || []).forEach((r) => {
        const row = [
          r.parameter || "-",
          r.value || "-",
          r.unit || "-",
          r.referenceRange || "-",
          r.interpretation || "-",
        ].join(" | ");
        doc.setFontSize(10);
        doc.text(row, 14, y);
        y += 7;

        if (y > 260) {
          doc.addPage();
          y = 20;
        }
      });

      y += 10;
    });

    doc.save(patient ? `${patient.name}_Lab_History.pdf` : "Lab_History.pdf");
  };


  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold text-black text-center mb-6">🧪 Patient Lab History</h1>

        {error && <p className="text-red-600 text-center font-semibold mb-4">{error}</p>}

        {patient && (
          <div className="mb-6">
            <p className="text-lg font-semibold text-black text-center">{patient.name}</p>
            <p className="text-sm text-center text-gray-600">Patient ID: {patient._id}</p>
          </div>
        )}

        <div>
          {history.map((record) => (
            <div key={record._id} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-black">{record.testName}</h3>
                <p className="text-sm text-gray-600">{new Date(record.completedAt).toLocaleDateString()}</p>
              </div>
              <table className="w-full text-sm border-t border-gray-200">
                <thead>
                  <tr className="bg-gray-200 text-black">
                    <th className="py-2 px-2 text-left">Parameter</th>
                    <th className="py-2 px-2 text-left">Value</th>
                    <th className="py-2 px-2 text-left">Unit</th>
                    <th className="py-2 px-2 text-left">Reference</th>
                    <th className="py-2 px-2 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(record.results) &&
                    record.results.map((r, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                        <td className="py-2 px-2 text-black">{r.parameter}</td>
                        <td className="py-2 px-2 text-black">{r.value}</td>
                        <td className="py-2 px-2 text-black">{r.unit || "-"}</td>
                        <td className="py-2 px-2 text-black">{r.referenceRange || "-"}</td>
                        <td className="py-2 px-2 text-black">{r.interpretation || "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={generatePDF}
            className="bg-black text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-gray-800 transition"
          >
            📄 Download PDF Summary
          </button>
        </div>
      </div>
    </div>
  );
}

export default withAuth(LabHistoryPage, ["doctor", "patient"]);
