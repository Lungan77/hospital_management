"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Shield,
  AlertTriangle,
  Users,
  Activity,
  TrendingUp,
  MapPin,
  Search,
  Filter,
  Plus,
  Eye,
  RefreshCw
} from "lucide-react";

function InfectionControlDashboard() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/infection-control");
      const data = await res.json();
      if (res.ok) {
        setCases(data.cases || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Error fetching infection control cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    const colors = {
      "Critical": "bg-red-600 text-white",
      "High": "bg-orange-500 text-white",
      "Medium": "bg-yellow-500 text-white",
      "Low": "bg-green-500 text-white"
    };
    return colors[risk] || "bg-gray-500 text-white";
  };

  const getStatusColor = (status) => {
    const colors = {
      "Active": "bg-red-100 text-red-700",
      "Monitoring": "bg-yellow-100 text-yellow-700",
      "Resolved": "bg-green-100 text-green-700",
      "Transferred": "bg-blue-100 text-blue-700",
      "Deceased": "bg-gray-100 text-gray-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getIsolationColor = (type) => {
    const colors = {
      "Contact": "bg-blue-100 text-blue-700",
      "Droplet": "bg-teal-100 text-teal-700",
      "Airborne": "bg-red-100 text-red-700",
      "Protective": "bg-green-100 text-green-700",
      "Standard": "bg-gray-100 text-gray-700",
      "Combined": "bg-purple-100 text-purple-700"
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch =
      c.patientAdmissionId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.patientAdmissionId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.patientAdmissionId?.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.infectionType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesRisk = filterRisk === "all" || c.riskLevel === filterRisk;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading infection control dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Infection Control</h1>
                <p className="text-gray-600 text-xl">Monitor and manage infection risks</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchCases}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
              <button
                onClick={() => router.push("/infection-control/new")}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Case
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.active || 0}</div>
                <div className="text-red-100 text-sm">Active Cases</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.monitoring || 0}</div>
                <div className="text-orange-100 text-sm">Under Monitoring</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.requiresIsolation || 0}</div>
                <div className="text-yellow-100 text-sm">Requires Isolation</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.critical || 0}</div>
                <div className="text-red-100 text-sm">Critical Risk</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name, admission number, or infection type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none bg-white"
              >
                <option value="all">All Risk Levels</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Shield className="w-7 h-7 text-red-600" />
            Infection Control Cases
          </h2>

          {filteredCases.length > 0 ? (
            <div className="space-y-4">
              {filteredCases.map((c) => (
                <div
                  key={c._id}
                  className="border-2 border-gray-200 rounded-2xl p-6 hover:border-red-300 transition-all cursor-pointer"
                  onClick={() => router.push(`/infection-control/case/${c._id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {c.patientAdmissionId?.firstName} {c.patientAdmissionId?.lastName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(c.riskLevel)}`}>
                          {c.riskLevel} Risk
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Admission: {c.patientAdmissionId?.admissionNumber}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/infection-control/case/${c._id}`);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                      <p className="text-xs text-red-600 font-semibold mb-1">Infection Type</p>
                      <p className="font-bold text-red-900">{c.infectionType}</p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                      <p className="text-xs text-orange-600 font-semibold mb-1">Category</p>
                      <p className="font-bold text-orange-900">{c.infectionCategory}</p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Isolation Type</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getIsolationColor(c.isolationType)}`}>
                        {c.isolationType}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    {c.isolationRequired && (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-600" />
                        <span className="font-semibold text-red-600">Isolation Required</span>
                      </div>
                    )}
                    {c.specialWardRequired && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        <span className="font-semibold text-orange-600">Special Ward Required</span>
                      </div>
                    )}
                    {c.assignedWard && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          Assigned: {c.assignedWard.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
                    Identified by: {c.identifiedBy?.title ? `${c.identifiedBy.title}. ` : ""}{c.identifiedBy?.name} on {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No infection control cases found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(InfectionControlDashboard, ["doctor", "nurse", "ward_manager", "admin"]);
