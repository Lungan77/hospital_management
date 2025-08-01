"use client"

import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Timer
} from "lucide-react";

function EmergencyReports() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState("week");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      const res = await fetch("/api/emergency/list");
      const data = await res.json();
      if (res.ok) {
        setEmergencies(data.emergencies);
      }
    } catch (error) {
      console.error("Error fetching emergencies");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Completed": "bg-green-100 text-green-700 border-green-200",
      "Cancelled": "bg-gray-100 text-gray-700 border-gray-200",
      "Transporting": "bg-blue-100 text-blue-700 border-blue-200",
      "On Scene": "bg-orange-100 text-orange-700 border-orange-200"
    };
    return colors[status] || "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      "Critical": "bg-red-100 text-red-700 border-red-200",
      "High": "bg-orange-100 text-orange-700 border-orange-200",
      "Medium": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Low": "bg-green-100 text-green-700 border-green-200"
    };
    return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const calculateResponseTime = (emergency) => {
    if (!emergency.dispatchedAt || !emergency.onSceneAt) return "N/A";
    const diff = new Date(emergency.onSceneAt) - new Date(emergency.dispatchedAt);
    return `${Math.floor(diff / 60000)} min`;
  };

  const calculateTransportTime = (emergency) => {
    if (!emergency.transportStartedAt || !emergency.arrivedHospitalAt) return "N/A";
    const diff = new Date(emergency.arrivedHospitalAt) - new Date(emergency.transportStartedAt);
    return `${Math.floor(diff / 60000)} min`;
  };

  const filteredEmergencies = emergencies.filter(emergency => {
    const matchesSearch = emergency.incidentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emergency.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emergency.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" || emergency.status === filter;
    
    // Date range filtering
    const emergencyDate = new Date(emergency.reportedAt);
    const now = new Date();
    let matchesDate = true;
    
    if (dateRange === "today") {
      matchesDate = emergencyDate.toDateString() === now.toDateString();
    } else if (dateRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = emergencyDate >= weekAgo;
    } else if (dateRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = emergencyDate >= monthAgo;
    }
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  const generateReport = () => {
    // In a real application, this would generate a PDF or Excel report
    const reportData = filteredEmergencies.map(emergency => ({
      incidentNumber: emergency.incidentNumber,
      date: new Date(emergency.reportedAt).toLocaleDateString(),
      priority: emergency.priority,
      status: emergency.status,
      responseTime: calculateResponseTime(emergency),
      transportTime: calculateTransportTime(emergency),
      location: emergency.address
    }));
    
    console.log("Report data:", reportData);
    alert("Report generation would be implemented here");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading emergency reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Emergency Reports</h1>
                  <p className="text-gray-600 text-xl">Comprehensive emergency response analytics and reporting</p>
                </div>
              </div>
              <button
                onClick={generateReport}
                className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
              >
                <Download className="w-6 h-6" />
                Generate Report
              </button>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{filteredEmergencies.length}</div>
                <div className="text-sm text-blue-600">Total Incidents</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{filteredEmergencies.filter(e => e.status === "Completed").length}</div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">{filteredEmergencies.filter(e => e.priority === "Critical").length}</div>
                <div className="text-sm text-red-600">Critical Cases</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredEmergencies.filter(e => e.onSceneAt && e.dispatchedAt).length > 0 ? 
                    Math.round(filteredEmergencies
                      .filter(e => e.onSceneAt && e.dispatchedAt)
                      .reduce((sum, e) => sum + (new Date(e.onSceneAt) - new Date(e.dispatchedAt)), 0) / 
                      (filteredEmergencies.filter(e => e.onSceneAt && e.dispatchedAt).length * 60000)
                    ) : 0
                  } min
                </div>
                <div className="text-sm text-purple-600">Avg Response</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by incident number, patient, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Transporting">Transporting</option>
                <option value="On Scene">On Scene</option>
              </select>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Emergency Response Reports</h2>
            <p className="text-purple-100">Detailed incident reports and response analytics</p>
          </div>

          <div className="overflow-x-auto">
            {filteredEmergencies.length === 0 ? (
              <div className="p-16 text-center">
                <FileText className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Reports Found</h3>
                <p className="text-gray-600">No emergency reports match your current filters</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Incident</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date/Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Patient</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Response Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Transport Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmergencies.map((emergency) => (
                    <tr key={emergency._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{emergency.incidentNumber}</div>
                          <div className="text-sm text-gray-600">{emergency.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {new Date(emergency.reportedAt).toLocaleDateString()}
                          </div>
                          <div className="text-gray-600">
                            {new Date(emergency.reportedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(emergency.priority)}`}>
                          {emergency.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(emergency.status)}`}>
                          {emergency.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{emergency.patientName || "Unknown"}</div>
                          <div className="text-gray-600">
                            {emergency.patientAge ? `${emergency.patientAge} years` : "Age unknown"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {emergency.address}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {calculateResponseTime(emergency)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {calculateTransportTime(emergency)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((filteredEmergencies.filter(e => e.status === "Completed").length / filteredEmergencies.length) * 100) || 0}%
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Completion Rate</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {filteredEmergencies.filter(e => e.priority === "Critical").length}
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Critical Cases</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Timer className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {filteredEmergencies.filter(e => e.transportStartedAt && e.arrivedHospitalAt).length > 0 ? 
                    Math.round(filteredEmergencies
                      .filter(e => e.transportStartedAt && e.arrivedHospitalAt)
                      .reduce((sum, e) => sum + (new Date(e.arrivedHospitalAt) - new Date(e.transportStartedAt)), 0) / 
                      (filteredEmergencies.filter(e => e.transportStartedAt && e.arrivedHospitalAt).length * 60000)
                    ) : 0
                  } min
                </div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Avg Transport Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(EmergencyReports, ["admin", "dispatcher"]);