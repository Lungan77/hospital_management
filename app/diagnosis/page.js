"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import withAuth from "@/hoc/withAuth";
import { Plus, FileText, Stethoscope, ClipboardList, Share2, Calendar, User, Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";

function DiagnosisList() {
  const { data: session, status } = useSession();
  const [diagnoses, setDiagnoses] = useState([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

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

  const getSeverityColor = (severity) => {
    const colors = {
      Mild: "bg-green-100 text-green-700 border-green-200",
      Moderate: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Severe: "bg-red-100 text-red-700 border-red-200"
    };
    return colors[severity] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      Mild: <CheckCircle className="w-4 h-4" />,
      Moderate: <Clock className="w-4 h-4" />,
      Severe: <AlertTriangle className="w-4 h-4" />
    };
    return icons[severity] || <Activity className="w-4 h-4" />;
  };

  const filteredDiagnoses = diagnoses.filter(diag => {
    if (filter === "recent") return new Date(diag.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (filter === "severe") return diag.severity === "Severe";
    if (filter === "pending") return !diag.prescriptionId || !diag.treatmentPlanId;
    return true;
  });

  if (status === "loading") return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-600 text-lg">Loading diagnoses...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center gap-4">
                <Stethoscope className="w-12 h-12 text-blue-600" />
                {session?.user.role === "doctor" ? "Diagnoses I've Made" : "My Diagnoses"}
              </h1>
              <p className="text-gray-600 text-xl">
                {session?.user.role === "doctor" 
                  ? "Comprehensive overview of patient diagnoses and treatment plans"
                  : "Your medical diagnoses and treatment history"
                }
              </p>
            </div>
            {session?.user.role === "doctor" && (
              <Link
                href="/doctor/diagnosis"
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
              >
                <Plus className="w-6 h-6" />
                Add Diagnosis
              </Link>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Diagnoses", count: diagnoses.length },
              { key: "recent", label: "Recent (30 days)", count: diagnoses.filter(d => new Date(d.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length },
              { key: "severe", label: "Severe Cases", count: diagnoses.filter(d => d.severity === "Severe").length },
              { key: "pending", label: "Pending Treatment", count: diagnoses.filter(d => !d.prescriptionId || !d.treatmentPlanId).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  filter === tab.key
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-2xl shadow-lg">
            <p className="text-red-700 font-semibold text-lg">{message}</p>
          </div>
        )}

        {filteredDiagnoses.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <FileText className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Diagnoses Found</h3>
            <p className="text-gray-600 text-lg">
              {filter === "all" ? "No diagnoses recorded yet." : `No ${filter} diagnoses found.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredDiagnoses.map((diag) => (
              <div key={diag._id} className="bg-white border rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 group">
                {/* Diagnosis Header */}
                <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-blue-900 mb-2">{diag.diagnosis}</h2>
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getSeverityColor(diag.severity)}`}>
                          {getSeverityIcon(diag.severity)}
                          {diag.severity}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          {diag.appointmentId ? (
                            <>
                              {new Date(diag.appointmentId.date).toLocaleDateString()} at {diag.appointmentId.timeSlot}
                            </>
                          ) : (
                            "Date: N/A"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {session?.user.role === "doctor" ? (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
                        <User className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Patient</p>
                          <p className="font-bold text-blue-900">{diag.appointmentId?.patientId?.name || "Unknown"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl">
                        <Stethoscope className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="text-sm text-green-600 font-medium">Doctor</p>
                          <p className="font-bold text-green-900">{diag.doctorId?.name || "Unknown"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Diagnosis Details */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <h4 className="font-semibold text-gray-800 mb-2">Symptoms</h4>
                      <p className="text-gray-700">{diag.symptoms}</p>
                      {diag.symptomsDuration && (
                        <p className="text-sm text-gray-500 mt-2">Duration: {diag.symptomsDuration}</p>
                      )}
                    </div>
                    {diag.labTestsOrdered && (
                      <div className="p-4 bg-blue-50 rounded-2xl">
                        <h4 className="font-semibold text-blue-800 mb-2">Lab Tests Ordered</h4>
                        <p className="text-blue-700">{diag.labTestsOrdered}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {diag.notes && (
                      <div className="p-4 bg-purple-50 rounded-2xl">
                        <h4 className="font-semibold text-purple-800 mb-2">Additional Notes</h4>
                        <p className="text-purple-700">{diag.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Treatment Sections */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Prescription */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                    {diag.prescriptionId ? (
                      <>
                        <h3 className="text-blue-800 font-bold mb-4 text-xl flex items-center gap-3">
                          <FileText className="w-6 h-6" /> 
                          Prescriptions
                        </h3>
                        <div className="space-y-3">
                          {diag.prescriptionId.medications.map((med, i) => (
                            <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
                              <p className="font-semibold text-blue-900">{med.name}</p>
                              <p className="text-sm text-blue-700">{med.dosage}, {med.frequency} for {med.duration}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : session?.user.role === "doctor" ? (
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                        <Link
                          href={`/prescriptions/add?diagnosisId=${diag._id}`}
                          className="block bg-blue-600 text-white p-4 rounded-xl text-center hover:bg-blue-700 transition-all duration-200 font-semibold"
                        >
                          + Add Prescription
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center text-blue-600">
                        <FileText className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                        <p className="text-sm">No prescription available</p>
                      </div>
                    )}
                  </div>

                  {/* Treatment Plan */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
                    {diag.treatmentPlanId ? (
                      <>
                        <h3 className="text-green-800 font-bold mb-4 text-xl flex items-center gap-3">
                          <ClipboardList className="w-6 h-6" /> 
                          Treatment Plan
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-white rounded-xl p-3 shadow-sm">
                            <p className="text-sm text-green-600 font-medium">Lifestyle</p>
                            <p className="text-green-800">{diag.treatmentPlanId.lifestyleRecommendations || "N/A"}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 shadow-sm">
                            <p className="text-sm text-green-600 font-medium">Follow-Up</p>
                            <p className="text-green-800">
                              {diag.treatmentPlanId.followUpDate ? new Date(diag.treatmentPlanId.followUpDate).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : session?.user.role === "doctor" ? (
                      <div className="text-center">
                        <ClipboardList className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <Link
                          href={`/treatment/add?diagnosisId=${diag._id}`}
                          className="block bg-green-600 text-white p-4 rounded-xl text-center hover:bg-green-700 transition-all duration-200 font-semibold"
                        >
                          + Add Treatment Plan
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center text-green-600">
                        <ClipboardList className="w-12 h-12 text-green-300 mx-auto mb-2" />
                        <p className="text-sm">No treatment plan available</p>
                      </div>
                    )}
                  </div>

                  {/* Referral */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
                    {diag.referralId ? (
                      <div className="text-center">
                        <Share2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                        <Link
                          href={`/referral/${diag._id}`}
                          className="block bg-purple-600 text-white p-4 rounded-xl text-center hover:bg-purple-700 transition-all duration-200 font-semibold"
                        >
                          View Referral Details
                        </Link>
                      </div>
                    ) : session?.user.role === "doctor" ? (
                      <div className="text-center">
                        <Share2 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                        <Link
                          href={`/referral/add?diagnosisId=${diag._id}`}
                          className="block bg-purple-600 text-white p-4 rounded-xl text-center hover:bg-purple-700 transition-all duration-200 font-semibold"
                        >
                          + Add Referral
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center text-purple-600">
                        <Share2 className="w-12 h-12 text-purple-300 mx-auto mb-2" />
                        <p className="text-sm">No referral available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Diagnoses", value: diagnoses.length, color: "blue", icon: <FileText className="w-6 h-6" /> },
            { label: "This Month", value: diagnoses.filter(d => new Date(d.createdAt).getMonth() === new Date().getMonth()).length, color: "green", icon: <Calendar className="w-6 h-6" /> },
            { label: "Severe Cases", value: diagnoses.filter(d => d.severity === "Severe").length, color: "red", icon: <AlertTriangle className="w-6 h-6" /> },
            { label: "Completed Treatment", value: diagnoses.filter(d => d.prescriptionId && d.treatmentPlanId).length, color: "purple", icon: <CheckCircle className="w-6 h-6" /> }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(DiagnosisList, ["doctor", "patient"]);