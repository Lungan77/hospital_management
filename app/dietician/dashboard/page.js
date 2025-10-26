"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Utensils,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Calendar,
  Activity,
  TrendingUp,
  CheckCircle,
  Clock,
  Apple,
  Heart,
  Droplet,
  Plus,
  ArrowRight,
  Search,
  Filter
} from "lucide-react";

function DieticianDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    highRisk: 0,
    needingAssessment: 0,
    activeMealPlans: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("All");

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/nutrition/patients");
      const data = await res.json();
      if (res.ok) {
        setPatients(data.patients || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterRisk === "All" || patient.riskLevel === filterRisk;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading dietician dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Apple className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Dietician Dashboard</h1>
                  <p className="text-gray-600 text-xl">Nutrition & Dietary Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.totalPatients}</div>
                <div className="text-blue-100">Total Patients</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Under nutrition care</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.highRisk}</div>
                <div className="text-red-100">High Risk</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-red-100 text-sm">
              <Heart className="w-4 h-4" />
              <span>Requires attention</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <ClipboardCheck className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.needingAssessment}</div>
                <div className="text-yellow-100">Need Assessment</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-yellow-100 text-sm">
              <Clock className="w-4 h-4" />
              <span>Assessments due</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Utensils className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.activeMealPlans}</div>
                <div className="text-green-100">Active Meal Plans</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-100 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Currently active</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push("/dietician/assessments")}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <ClipboardCheck className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900">Assessments</h3>
                  <p className="text-gray-600 text-sm">Nutritional evaluations</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          <button
            onClick={() => router.push("/dietician/meal-plans")}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <Utensils className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900">Meal Plans</h3>
                  <p className="text-gray-600 text-sm">Plan and manage meals</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          <button
            onClick={() => router.push("/dietician/analytics")}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900">Analytics</h3>
                  <p className="text-gray-600 text-sm">Track outcomes</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-7 h-7 text-green-600" />
              Patient List
            </h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="All">All Risk Levels</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No patients found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/dietician/patient/${patient._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {patient.firstName?.[0]}{patient.lastName?.[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">Admission: {patient.admissionNumber}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${
                            patient.riskLevel === "Critical" || patient.riskLevel === "High"
                              ? "text-red-600"
                              : "text-gray-400"
                          }`} />
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(patient.riskLevel)}`}>
                            {patient.riskLevel} Risk
                          </span>
                        </div>

                        {patient.latestMealPlan && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Utensils className="w-4 h-4 text-green-600" />
                            <span>{patient.latestMealPlan.dietType}</span>
                          </div>
                        )}

                        {patient.pendingMeals.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <Clock className="w-4 h-4" />
                            <span>{patient.pendingMeals.length} pending meals</span>
                          </div>
                        )}

                        {patient.needsAssessment && (
                          <div className="flex items-center gap-2 text-sm text-yellow-600">
                            <ClipboardCheck className="w-4 h-4" />
                            <span>Assessment due</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dietician/assess/${patient._id}`);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        Assess
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/meal-planning/${patient._id}`);
                        }}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors text-sm"
                      >
                        <Utensils className="w-4 h-4" />
                        Meal Plan
                      </button>
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

export default withAuth(DieticianDashboard, ["dietician", "admin"]);
