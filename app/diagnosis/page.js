"use client"; 
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link"; // ✅ Import Link
import withAuth from "@/hoc/withAuth";

function DiagnosisList() {
  const { data: session, status } = useSession();
  const [diagnoses, setDiagnoses] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchDiagnoses();
    }
  }, [status]);

  const fetchDiagnoses = async () => {
    try {
      const res = await fetch("/api/diagnosis/my");
      const data = await res.json();
      if (res.ok) {
        setDiagnoses(data.diagnoses);
      } else {
        setMessage("Failed to fetch diagnoses.");
      }
    } catch (error) {
      setMessage("Error fetching diagnoses.");
    }
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        {session?.user.role === "doctor" ? "Diagnoses I've Made" : "My Diagnoses"}
      </h1>
      <Link 
        href={'/doctor/diagnosis'} 
        className="mt-4 block bg-blue-500 text-white p-2 rounded-lg text-center hover:bg-blue-600"
      >
        + Add Diagnosis
      </Link>
      {message && <p className="mt-2 text-red-500">{message}</p>}

      {diagnoses.length === 0 ? (
        <p>No diagnoses recorded.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {diagnoses.map((diag) => (
            <li key={diag._id} className="bg-gray-100 p-4 rounded-lg">
              <p className="text-lg font-semibold">Diagnosis: {diag.diagnosis}</p>
              <p>Symptoms: {diag.symptoms}</p>
              <p>Severity: {diag.severity}</p>
              <p>Lab Tests Ordered: {diag.labTestsOrdered || "None"}</p>
              <p>Notes: {diag.notes || "No additional notes"}</p>
              <p>
                Date: {diag.appointmentId ? new Date(diag.appointmentId.date).toLocaleDateString() : "N/A"} 
                at {diag.appointmentId?.timeSlot || "N/A"}
              </p>
              {session?.user.role === "doctor" ? (
                <p>
                  Patient:{" "}
                  <span className="font-bold">
                    {diag.appointmentId?.patientId?.name || "Unknown"}
                  </span>
                </p>
              ) : (
                <p>
                  Doctor: <span className="font-bold">{diag.doctorId?.name || "Unknown"}</span>
                </p>
              )}

              {/* Prescription Section */}
              {diag.prescriptionId ? (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <h2 className="text-lg font-bold">Prescriptions</h2>
                  {diag.prescriptionId.medications.map((med, index) => (
                    <p key={index}>
                      {med.name} - {med.dosage}, {med.frequency} for {med.duration}
                    </p>
                  ))}
                </div>
              ) : session?.user.role === "doctor" && (
                <Link 
                  href={`/prescriptions/add?diagnosisId=${diag._id}`} 
                  className="mt-4 block bg-blue-500 text-white p-2 rounded-lg text-center hover:bg-blue-600"
                >
                  + Add Prescription
                </Link>
              )}

              {/* Treatment Plan Section */}
              {diag.treatmentPlanId ? (
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <h2 className="text-lg font-bold">Treatment Plan</h2>
                  <p>Lifestyle: {diag.treatmentPlanId.lifestyleRecommendations || "N/A"}</p>
                  <p>Physiotherapy: {diag.treatmentPlanId.physiotherapy || "N/A"}</p>
                  <p>
                    Follow-Up:{" "}
                    {diag.treatmentPlanId.followUpDate
                      ? new Date(diag.treatmentPlanId.followUpDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              ) : session?.user.role === "doctor" && (
                <Link 
                  href={`/treatment/add?diagnosisId=${diag._id}`} 
                  className="mt-4 block bg-green-500 text-white p-2 rounded-lg text-center hover:bg-green-600"
                >
                  + Add Treatment Plan
                </Link>
              )}

              {diag.referralId ? (
                <Link 
                  href={`/referral/${diag._id}`} 
                  className="mt-4 block bg-gray-500 text-white p-2 rounded-lg text-center hover:bg-gray-600"
                >
                  View Referral Details
                </Link>
              ) : session?.user.role === "doctor" && (
                <Link 
                  href={`/referral/add?diagnosisId=${diag._id}`} 
                  className="mt-4 block bg-blue-500 text-white p-2 rounded-lg text-center hover:bg-blue-600"
                >
                  + Add Referral
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default withAuth(DiagnosisList, ["doctor", "patient"]);
