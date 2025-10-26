"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  ClipboardCheck,
  Search,
  Calendar,
  User,
  AlertTriangle,
  TrendingUp,
  FileText,
  Plus
} from "lucide-react";

function DieticianAssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await fetch("/api/nutrition/assessments");
      const data = await res.json();
      if (res.ok) {
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "Critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const patientName = assessment.patientId?.name || "";
    return patientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <ClipboardCheck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Nutritional Assessments</h1>
                <p className="text-gray-600 text-xl">View and manage patient assessments</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/nutrition/patients")}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Assessment
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Assessment History</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No assessments found</p>
              <button
                onClick={() => router.push("/nutrition/patients")}
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
              >
                Create First Assessment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssessments.map((assessment) => (
                <div
                  key={assessment._id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/dietician/assessment/${assessment._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {assessment.patientId?.name?.[0] || "?"}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {assessment.patientId?.name || "Unknown Patient"}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(assessment.assessmentDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{assessment.assessedBy?.name || "Unknown"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${
                            assessment.nutritionalRisk?.riskLevel === "Critical" ||
                            assessment.nutritionalRisk?.riskLevel === "High"
                              ? "text-red-600"
                              : "text-gray-400"
                          }`} />
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            getRiskColor(assessment.nutritionalRisk?.riskLevel)
                          }`}>
                            {assessment.nutritionalRisk?.riskLevel || "Unknown"} Risk
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>{assessment.status}</span>
                        </div>

                        {assessment.anthropometricData?.bmi && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span>BMI: {assessment.anthropometricData.bmi.toFixed(1)}</span>
                          </div>
                        )}

                        {assessment.recommendedDietType && (
                          <div className="flex items-center gap-2 text-sm text-purple-600">
                            <span className="font-semibold">{assessment.recommendedDietType}</span>
                          </div>
                        )}
                      </div>

                      {assessment.nutritionalDiagnosis && assessment.nutritionalDiagnosis.length > 0 && (
                        <div className="mt-3 bg-blue-50 rounded-lg p-3">
                          <p className="text-sm font-semibold text-gray-900 mb-1">Primary Diagnosis:</p>
                          <p className="text-sm text-gray-700">{assessment.nutritionalDiagnosis[0].problem}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(DieticianAssessmentsPage, ["dietician", "admin"]);
