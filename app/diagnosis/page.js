"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import withAuth from "@/hoc/withAuth";
import { Plus, FileText, Stethoscope, ClipboardList, Share2 } from "lucide-react";

function DiagnosisList() {
  const { data: session, status } = useSession();
  const [diagnoses, setDiagnoses] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated") fetchDiagnoses();
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

  if (status === "loading") return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {session?.user.role === "doctor" ? "Diagnoses I've Made" : "My Diagnoses"}
        </h1>
        {session?.user.role === "doctor" && (
          <Link
            href="/doctor/diagnosis"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Diagnosis
          </Link>
        )}
      </div>

      {message && <p className="text-red-500 mb-4">{message}</p>}

      {diagnoses.length === 0 ? (
        <p className="text-gray-600">No diagnoses recorded.</p>
      ) : (
        <div className="grid gap-6">
          {diagnoses.map((diag) => (
            <div key={diag._id} className="bg-white border rounded-xl shadow-sm p-5 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-blue-900">{diag.diagnosis}</h2>
                  <p className="text-gray-700">Symptoms: <strong>{diag.symptoms}</strong></p>
                  <p className="text-gray-700">Severity: <strong>{diag.severity}</strong></p>
                  <p className="text-gray-700">Lab Tests: <strong>{diag.labTestsOrdered || "None"}</strong></p>
                  <p className="text-gray-700">Notes: <span className="italic">{diag.notes || "No additional notes"}</span></p>
                  <p className="text-gray-600 text-sm">
                    {diag.appointmentId ? (
                      <>
                        Date: {new Date(diag.appointmentId.date).toLocaleDateString()} at {diag.appointmentId.timeSlot}
                      </>
                    ) : (
                      "Date: N/A"
                    )}
                  </p>
                </div>

                <div>
                  {session?.user.role === "doctor" ? (
                    <p className="text-sm text-gray-600">
                      Patient: <strong>{diag.appointmentId?.patientId?.name || "Unknown"}</strong>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Doctor: <strong>{diag.doctorId?.name || "Unknown"}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Prescription */}
              {diag.prescriptionId ? (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Prescriptions
                  </h3>
                  {diag.prescriptionId.medications.map((med, i) => (
                    <p key={i} className="text-sm text-gray-700">
                      {med.name} - {med.dosage}, {med.frequency} for {med.duration}
                    </p>
                  ))}
                </div>
              ) : session?.user.role === "doctor" && (
                <Link
                  href={`/prescriptions/add?diagnosisId=${diag._id}`}
                  className="block bg-blue-600 text-white p-2 rounded-lg text-center hover:bg-blue-700"
                >
                  + Add Prescription
                </Link>
              )}

              {/* Treatment Plan */}
              {diag.treatmentPlanId ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-green-800 font-bold mb-2 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" /> Treatment Plan
                  </h3>
                  <p>Lifestyle: {diag.treatmentPlanId.lifestyleRecommendations || "N/A"}</p>
                  <p>Physiotherapy: {diag.treatmentPlanId.physiotherapy || "N/A"}</p>
                  <p>Follow-Up: {diag.treatmentPlanId.followUpDate ? new Date(diag.treatmentPlanId.followUpDate).toLocaleDateString() : "N/A"}</p>
                </div>
              ) : session?.user.role === "doctor" && (
                <Link
                  href={`/treatment/add?diagnosisId=${diag._id}`}
                  className="block bg-green-600 text-white p-2 rounded-lg text-center hover:bg-green-700"
                >
                  + Add Treatment Plan
                </Link>
              )}

              {/* Referral */}
              {diag.referralId ? (
                <Link
                  href={`/referral/${diag._id}`}
                  className="block bg-gray-600 text-white p-2 rounded-lg text-center hover:bg-gray-700"
                >
                  View Referral Details
                </Link>
              ) : session?.user.role === "doctor" && (
                <Link
                  href={`/referral/add?diagnosisId=${diag._id}`}
                  className="block bg-purple-600 text-white p-2 rounded-lg text-center hover:bg-purple-700"
                >
                  + Add Referral
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAuth(DiagnosisList, ["doctor", "patient"]);
