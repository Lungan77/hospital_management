"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import jsPDF from "jspdf";

function ReferralDetails() {
  const { diagnosisId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return; // Wait for authentication check

    if (!session || !["doctor", "patient"].includes(session?.user.role)) {
      router.push("/unauthorized"); // ✅ Redirect unauthorized users
      return;
    }

    if (diagnosisId) {
      fetchReferral(diagnosisId);
    }
  }, [status, session, diagnosisId]);

  const fetchReferral = async (diagnosisId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/referrals/${diagnosisId}`);
      const data = await res.json();
      if (res.ok) {
        setReferral(data.referral);
      } else {
        setError(data.error || "Referral not found.");
      }
    } catch (err) {
      setError("Error fetching referral.");
    }
    setLoading(false);
  };

  // ✅ Generate structured PDF with jsPDF (No html2canvas, No "oklch" errors)
  const downloadReferral = () => {
    if (!referral) return;

    const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Referral Document", 105, 20, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text(`Specialist: ${referral.specialistName}`, 20, 40);
    pdf.text(`Hospital: ${referral.hospitalName}`, 20, 50);
    pdf.text(`Reason: ${referral.reasonForReferral}`, 20, 60);
    pdf.text(`Notes: ${referral.additionalNotes || "None"}`, 20, 70);
    pdf.text(`Date: ${new Date(referral.createdAt).toLocaleDateString()}`, 20, 80);

    pdf.save(`Referral_${diagnosisId}.pdf`);
  };

  if (status === "loading" || loading) {
    return <p className="p-6 text-center text-gray-600">Loading referral details...</p>;
  }

  if (error) {
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-blue-700">Referral Details</h1>

      {referral ? (
        <div className="mt-6 p-6 bg-gray-50 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Referral Document</h2>
          <p className="text-gray-700"><strong>Specialist:</strong> {referral.specialistName}</p>
          <p className="text-gray-700"><strong>Hospital:</strong> {referral.hospitalName}</p>
          <p className="text-gray-700"><strong>Reason:</strong> {referral.reasonForReferral}</p>
          <p className="text-gray-700"><strong>Notes:</strong> {referral.additionalNotes || "None"}</p>
          <p className="text-gray-700"><strong>Date:</strong> {new Date(referral.createdAt).toLocaleDateString()}</p>
        </div>
      ) : (
        <p className="text-center text-red-500 mt-4">No referral found for this diagnosis.</p>
      )}

      {referral && (
        <button 
          onClick={downloadReferral}
          className="mt-6 w-full bg-blue-600 text-white p-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition"
        >
          Download PDF
        </button>
      )}

      <Link 
        href="/diagnosis" 
        className="mt-6 block w-full bg-gray-500 text-white p-3 rounded-lg text-center font-semibold hover:bg-gray-600 transition"
      >
        Back to Diagnoses
      </Link>
    </div>
  );
}

export default ReferralDetails;
