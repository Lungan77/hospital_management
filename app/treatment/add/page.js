"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import withAuth from "@/hoc/withAuth";

function AddTreatmentPlan() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const diagnosisId = searchParams.get("diagnosisId");

  const [lifestyleRecommendations, setLifestyleRecommendations] = useState("");
  const [physiotherapy, setPhysiotherapy] = useState("");
  const [mentalHealthSupport, setMentalHealthSupport] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(null); // ✅ Fix: Track if the request was successful

  const submitTreatmentPlan = async () => {
    if (!diagnosisId || !lifestyleRecommendations) {
      setMessage("Please provide all required fields.");
      setIsSuccess(false);
      return;
    }

    const res = await fetch("/api/treatment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        diagnosisId, 
        lifestyleRecommendations, 
        physiotherapy, 
        mentalHealthSupport, 
        followUpDate, 
        additionalNotes 
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Treatment plan added successfully.");
      setIsSuccess(true);
      setTimeout(() => router.push("/diagnosis"), 2000); // Redirect after success
    } else {
      setMessage(data.error);
      setIsSuccess(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Add Treatment Plan</h1>
      {message && (
        <p className={`mt-2 ${isSuccess ? "text-green-600" : "text-red-500"}`}>{message}</p> // ✅ Fix: Use `isSuccess` state
      )}

      <textarea placeholder="Lifestyle Recommendations" className="p-2 border w-full mt-4" onChange={(e) => setLifestyleRecommendations(e.target.value)} />
      <textarea placeholder="Physiotherapy (if applicable)" className="p-2 border w-full mt-4" onChange={(e) => setPhysiotherapy(e.target.value)} />
      <textarea placeholder="Mental Health Support (if applicable)" className="p-2 border w-full mt-4" onChange={(e) => setMentalHealthSupport(e.target.value)} />
      <input type="date" className="p-2 border w-full mt-4" onChange={(e) => setFollowUpDate(e.target.value)} />
      <textarea placeholder="Additional Notes (optional)" className="p-2 border w-full mt-4" onChange={(e) => setAdditionalNotes(e.target.value)} />

      <button onClick={submitTreatmentPlan} className="mt-6 p-2 bg-green-600 text-white w-full rounded-lg hover:bg-green-700">
        Save Treatment Plan
      </button>
    </div>
  );
}

export default withAuth(AddTreatmentPlan, ["doctor"]);
