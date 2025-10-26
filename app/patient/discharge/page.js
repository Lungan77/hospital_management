"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  FileText,
  Download,
  Calendar,
  Pill,
  MessageSquare,
  CheckCircle,
  Clock,
  User,
  Home,
  Activity,
  ArrowRight,
  Star,
  Heart,
  ThumbsUp
} from "lucide-react";

function PatientDischargePage() {
  const router = useRouter();
  const [discharges, setDischarges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDischarges();
  }, []);

  const fetchDischarges = async () => {
    try {
      const res = await fetch("/api/discharge/patient");
      const data = await res.json();
      if (res.ok) {
        setDischarges(data.discharges || []);
      }
    } catch (error) {
      console.error("Error fetching discharges:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewDischarge = (summaryId) => {
    router.push(`/patient/discharge/${summaryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading discharge summaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl flex items-center justify-center shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">My Discharge Summaries</h1>
              <p className="text-gray-600 text-xl">View your discharge reports, prescriptions, and follow-up care</p>
            </div>
          </div>
        </div>

        {discharges.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Discharge Summaries</h3>
            <p className="text-gray-600 text-lg">You don&apos;t have any discharge summaries yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {discharges.map((discharge) => (
              <div
                key={discharge._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => viewDischarge(discharge._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Discharge Summary
                        </h3>
                        <p className="text-gray-600">
                          Discharged on {new Date(discharge.dischargeDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl">
                        <User className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Discharged By</p>
                          <p className="font-semibold text-gray-900">{discharge.dischargedBy?.name || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl">
                        <Activity className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Condition</p>
                          <p className="font-semibold text-gray-900">{discharge.conditionAtDischarge}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-xl">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Length of Stay</p>
                          <p className="font-semibold text-gray-900">{discharge.lengthOfStay} days</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-xl">
                        <Home className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-sm text-gray-600">Destination</p>
                          <p className="font-semibold text-gray-900">{discharge.dischargeDestination}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-1">Final Diagnosis</p>
                      <p className="text-gray-900 font-medium">{discharge.finalDiagnosis}</p>
                    </div>

                    <div className="flex gap-3">
                      {discharge.dischargeMedications && discharge.dischargeMedications.length > 0 && (
                        <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold">
                          <Pill className="w-4 h-4" />
                          {discharge.dischargeMedications.length} Medications
                        </div>
                      )}
                      {discharge.followUpCare?.required && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
                          <Calendar className="w-4 h-4" />
                          Follow-up Required
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewDischarge(discharge._id);
                      }}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      View Details
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(PatientDischargePage, ["patient"]);
