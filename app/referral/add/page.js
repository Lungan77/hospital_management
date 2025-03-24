"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import withAuth from "@/hoc/withAuth";

function AddReferral() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const diagnosisId = searchParams.get("diagnosisId");

  const [specialistName, setSpecialistName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [reasonForReferral, setReasonForReferral] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [message, setMessage] = useState("");

  const submitReferral = async () => {
    if (!diagnosisId || !specialistName || !hospitalName || !reasonForReferral) {
      setMessage("Please provide all required fields.");
      return;
    }

    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diagnosisId, specialistName, hospitalName, reasonForReferral, additionalNotes }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Referral document created successfully.");
      setTimeout(() => router.push("/diagnosis"), 2000); // Redirect after success
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Create Referral Document</h1>
      {message && <p className="mt-2 text-red-500">{message}</p>}

      <input type="text" placeholder="Specialist Name" className="p-2 border w-full mt-4" onChange={(e) => setSpecialistName(e.target.value)} />
      <input type="text" placeholder="Hospital Name" className="p-2 border w-full mt-4" onChange={(e) => setHospitalName(e.target.value)} />
      <textarea placeholder="Reason for Referral" className="p-2 border w-full mt-4" onChange={(e) => setReasonForReferral(e.target.value)} />
      <textarea placeholder="Additional Notes (optional)" className="p-2 border w-full mt-4" onChange={(e) => setAdditionalNotes(e.target.value)} />

      <button onClick={submitReferral} className="mt-6 p-2 bg-blue-600 text-white w-full rounded-lg hover:bg-blue-700">
        Save Referral
      </button>
    </div>
  );
}

export default withAuth(AddReferral, ["doctor"]);
