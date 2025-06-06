"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import withAuth from "@/hoc/withAuth";
import jsPDF from "jspdf";
import { CheckCircleIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid"; // Add Heroicons

function TestResultPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchTestResult() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/results/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch test result");
        const data = await res.json();
        setTestResult(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTestResult();
  }, [id]);

  function approveTestResult() {
    async function approve() {
      try {
        const res = await fetch(`/api/results/${id}/approve`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "approved" }),
        });

        if (!res.ok) throw new Error("Failed to approve test result");
        const data = await res.json();

        if (data.message) {
          alert(data.message);
        } else {
          alert("Test result approved successfully.");
        }
      } catch (err) {
        alert(err.message);
      }
    }
    approve();
  }

  
  function generatePDF() {
    if (!testResult) return;
  
    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
    });
  
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - 2 * margin;
  
    // Colors
    const colors = {
      title: "#2c3e50",
      subtitle: "#34495e",
      boxBg: "#ecf0f1",
      boxBorder: "#bdc3c7",
      headerBg: "#3498db",
      headerText: "#fff",
      rowAltBg: "#f4f6f8",
      text: "#34495e",
    };
  
    // Fonts and sizes
    const fonts = {
      titleSize: 22,
      sectionTitleSize: 14,
      normalSize: 11,
      smallSize: 10,
    };
  
    let cursorY = margin;
  
    // Add page footer with page numbers
    function addFooter(pageNum, totalPages) {
      doc.setFontSize(9);
      doc.setTextColor("#888");
      const footerText = `Page ${pageNum} of ${totalPages}`;
      const textWidth = doc.getTextWidth(footerText);
      doc.text(footerText, pageWidth - margin - textWidth, pageHeight - 10);
    }
  
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fonts.titleSize);
    doc.setTextColor(colors.title);
    doc.text("Test Result Details", margin, cursorY);
    cursorY += 30;
  
    // Function to draw info box with title and lines of text
    function drawInfoBox(title, lines) {
      const boxHeight = 18 + lines.length * 18;
      // Background
      doc.setFillColor(colors.boxBg);
      doc.setDrawColor(colors.boxBorder);
      doc.rect(margin - 4, cursorY - 14, contentWidth + 8, boxHeight, "FD");
  
      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(fonts.sectionTitleSize);
      doc.setTextColor(colors.subtitle);
      doc.text(title, margin, cursorY);
  
      // Text lines
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fonts.normalSize);
      doc.setTextColor(colors.text);
  
      let lineY = cursorY + 18;
      lines.forEach((line) => {
        const splitLine = doc.splitTextToSize(line, contentWidth);
        splitLine.forEach((text) => {
          doc.text(text, margin, lineY);
          lineY += 16;
        });
      });
  
      cursorY += boxHeight + 15;
    }
  
    // Test Information box
    drawInfoBox("Test Information", [
      `Test Name: ${testResult.testName || "N/A"}`,
      `Status: ${testResult.status || "N/A"}`,
      `Recorded By: ${testResult.recordedBy?.name || "N/A"}`,
      `Recorded At: ${
        testResult.recordedAt
          ? new Date(testResult.recordedAt).toLocaleString()
          : "N/A"
      }`,
    ]);
  
    // Appointment Details box
    drawInfoBox("Appointment Details", [
      `Appointment ID: ${
        testResult.testOrderId?.appointmentId?._id || "N/A"
      }`,
      `Patient: ${testResult.testOrderId?.appointmentId?.patientId?.name || "N/A"}`,
      `Doctor: ${testResult.testOrderId?.appointmentId?.userId?.name || "N/A"}`,
      `Doctor's Email: ${
        testResult.testOrderId?.appointmentId?.userId?.email || "N/A"
      }`,
    ]);
  
    // Test Results Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fonts.sectionTitleSize);
    doc.setTextColor(colors.title);
    doc.text("Test Results", margin, cursorY);
    cursorY += 18;
  
    // Table setup
    const headers = [
      "Parameter",
      "Value",
      "Unit",
      "Reference Range",
      "Interpretation",
    ];
    const colWidths = [120, 50, 50, 110, 110]; // total ~440pt
    const tableX = margin;
    const rowHeight = 18;
  
    // Draw header background
    doc.setFillColor(colors.headerBg);
    doc.rect(tableX, cursorY - 14, colWidths.reduce((a, b) => a + b), rowHeight, "F");
  
    // Header text
    doc.setFontSize(fonts.normalSize);
    doc.setTextColor(colors.headerText);
    let x = tableX + 4;
    headers.forEach((header, i) => {
      doc.text(header, x, cursorY);
      x += colWidths[i];
    });
    cursorY += rowHeight;
  
    // Draw table rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fonts.smallSize);
    doc.setTextColor(colors.text);
  
    function checkPageSpace(heightNeeded) {
      if (cursorY + heightNeeded > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
        // redraw header on new page
        doc.setFillColor(colors.headerBg);
        doc.rect(tableX, cursorY - 14, colWidths.reduce((a, b) => a + b), rowHeight, "F");
        doc.setFontSize(fonts.normalSize);
        doc.setTextColor(colors.headerText);
        let x = tableX + 4;
        headers.forEach((header, i) => {
          doc.text(header, x, cursorY);
          x += colWidths[i];
        });
        cursorY += rowHeight;
        addFooter(doc.internal.getNumberOfPages(), doc.internal.getNumberOfPages());
      }
    }
  
    testResult.results.forEach((entry, idx) => {
      checkPageSpace(rowHeight);
  
      // Alternate background
      if (idx % 2 === 0) {
        doc.setFillColor(colors.rowAltBg);
        doc.rect(tableX, cursorY - 14, colWidths.reduce((a, b) => a + b), rowHeight, "F");
      }
  
      const rowTexts = [
        entry.parameter || "-",
        entry.value !== undefined && entry.value !== null ? entry.value.toString() : "-",
        entry.unit || "-",
        entry.referenceRange || "-",
        entry.interpretation || "-",
      ];
  
      x = tableX + 4;
      rowTexts.forEach((text, i) => {
        // Wrap text in the cell if too long
        const splitText = doc.splitTextToSize(text, colWidths[i] - 8);
        doc.text(splitText, x, cursorY);
        x += colWidths[i];
      });
  
      cursorY += rowHeight;
    });
  
    // Comments section
    if (testResult.comments) {
      cursorY += 20;
      const commentsTitleHeight = 18;
      checkPageSpace(commentsTitleHeight + 50);
  
      doc.setFont("helvetica", "bold");
      doc.setFontSize(fonts.sectionTitleSize);
      doc.setTextColor(colors.title);
      doc.text("Comments", margin, cursorY);
      cursorY += 20;
  
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fonts.normalSize);
      doc.setTextColor(colors.text);
  
      const splitComments = doc.splitTextToSize(testResult.comments, contentWidth);
      splitComments.forEach((line) => {
        checkPageSpace(16);
        doc.text(line, margin, cursorY);
        cursorY += 16;
      });
    }
  
    // Add footer on every page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addFooter(i, pageCount);
    }
  
    // Save PDF
    doc.save(`TestResult-${testResult.testName || "unknown"}.pdf`);
  } 

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg animate-pulse">Loading test result…</p>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg font-medium">Error: {error}</p>
      </div>
    );
  if (!testResult)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg font-medium">No test result found.</p>
      </div>
    );

  return (
    <main className="px-4 sm:px-8 py-10 bg-gray-50 min-h-screen">
      <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Test Result Details
            {testResult.status === "Approved" && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                Approved
              </span>
            )}
            {testResult.status !== "Approved" && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                Pending
              </span>
            )}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Detailed view of the selected test result.
          </p>
        </div>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          Download PDF
        </button>
      </header>

      <section className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Test Information
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-gray-700 text-base">
          <div>
            <dt className="font-semibold text-gray-900">Test Name</dt>
            <dd className="mt-1">{testResult.testName}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Status</dt>
            <dd className="mt-1">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium 
                ${testResult.status === "Approved"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                }`}>
                {testResult.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Recorded By</dt>
            <dd className="mt-1">{testResult.recordedBy?.name || "N/A"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Recorded At</dt>
            <dd className="mt-1">{new Date(testResult.recordedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Appointment Details
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-gray-700 text-base">
          <div>
            <dt className="font-semibold text-gray-900">Appointment ID</dt>
            <dd className="mt-1">{testResult.testOrderId?.appointmentId?._id || "N/A"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Patient</dt>
            <dd className="mt-1">{testResult.testOrderId?.appointmentId?.patientId?.name || "N/A"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Doctor</dt>
            <dd className="mt-1">{testResult.testOrderId?.appointmentId?.doctorId?.name || "N/A"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Doctor&apos;s Email</dt>
            <dd className="mt-1">{testResult.testOrderId?.appointmentId?.doctorId?.email || "N/A"}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-gray-200 overflow-x-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
          Test Results
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300 text-gray-800 text-left rounded-lg overflow-hidden">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {[
                  "Parameter",
                  "Value",
                  "Unit",
                  "Reference Range",
                  "Interpretation",
                ].map((header) => (
                  <th
                    key={header}
                    className="border border-gray-300 px-6 py-3 font-semibold text-sm uppercase tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {testResult.results.map((entry, idx) => (
                <tr
                  key={idx}
                  className={
                    idx % 2 === 0
                      ? "bg-white hover:bg-gray-50 transition"
                      : "bg-gray-50 hover:bg-gray-100 transition"
                  }
                >
                  <td className="border border-gray-300 px-6 py-3">{entry.parameter}</td>
                  <td className="border border-gray-300 px-6 py-3">{entry.value}</td>
                  <td className="border border-gray-300 px-6 py-3">{entry.unit || "-"}</td>
                  <td className="border border-gray-300 px-6 py-3">{entry.referenceRange || "-"}</td>
                  <td className="border border-gray-300 px-6 py-3">{entry.interpretation || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {testResult.comments && (
        <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Comments
          </h2>
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
            {testResult.comments}
          </p>
        </section>
      )}

      <div className="flex justify-end">
        {session?.user?.role === "labtech" && testResult.status !== "Approved" && (
          <button
            onClick={approveTestResult}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition font-semibold mt-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Approve
          </button>
        )}
      </div>
    </main>
  );
}

export default withAuth(TestResultPage, ["doctor", "labtech"]);
