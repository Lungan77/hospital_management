"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import jsPDF from "jspdf";
import withAuth from "@/hoc/withAuth";

function MyReferrals() {
  const { data: session } = useSession();
  const [referrals, setReferrals] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    const res = await fetch("/api/referrals/my");
    const data = await res.json();
    if (res.ok) {
      setReferrals(data.referrals);
    } else {
      setMessage("Failed to fetch referrals.");
    }
  };

  // ✅ Generate PDF without html2canvas
  const downloadReferral = (referral) => {
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

    pdf.save(`Referral_${referral._id}.pdf`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Referrals</h1>
      {message && <p className="mt-2 text-red-500">{message}</p>}

      {referrals.length === 0 ? (
        <p>No referrals recorded.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {referrals.map((referral) => (
            <li key={referral._id} className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-lg font-semibold">Referral Document</h2>
              <p>Specialist: <span className="font-bold">{referral.specialistName}</span></p>
              <p>Hospital: <span className="font-bold">{referral.hospitalName}</span></p>
              <p>Reason: {referral.reasonForReferral}</p>
              <p>Notes: {referral.additionalNotes || "None"}</p>
              <p>Date: {new Date(referral.createdAt).toLocaleDateString()}</p>

              <button 
                onClick={() => downloadReferral(referral)}
                className="mt-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              >
                Download PDF
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default withAuth(MyReferrals, ["doctor", "patient"]);
