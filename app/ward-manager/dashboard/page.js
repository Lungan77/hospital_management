"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Bed,
  Building,
  Users,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Plus,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";

function WardManagerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    cleaningBeds: 0,
    maintenanceBeds: 0,
    occupancyRate: 0
  });
  const [wards, setWards] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bedsRes, wardsRes] = await Promise.all([
        fetch("/api/beds"),
        fetch("/api/wards")
      ]);

      const bedsData = await bedsRes.json();
      const wardsData = await wardsRes.json();

      if (bedsRes.ok && bedsData.beds) {
        const beds = bedsData.beds;
        const occupied = beds.filter(b => b.status === "Occupied").length;
        const available = beds.filter(b => b.status === "Available").length;
        const cleaning = beds.filter(b => b.status === "Cleaning").length;
        const maintenance = beds.filter(b => b.status === "Maintenance" || b.status === "Out of Service").length;

        setStats({
          totalBeds: beds.length,
          occupiedBeds: occupied,
          availableBeds: available,
          cleaningBeds: cleaning,
          maintenanceBeds: maintenance,
          occupancyRate: beds.length > 0 ? ((occupied / beds.length) * 100).toFixed(1) : 0
        });

        const recent = beds
          .filter(b => b.assignedAt || b.housekeeping?.lastCleaned)
          .sort((a, b) => {
            const dateA = new Date(a.assignedAt || a.housekeeping?.lastCleaned);
            const dateB = new Date(b.assignedAt || b.housekeeping?.lastCleaned);
            return dateB - dateA;
          })
          .slice(0, 10);
        setRecentActivity(recent);
      }

      if (wardsRes.ok && wardsData.wards) {
        setWards(wardsData.wards);
      }
    } catch (error) {
      console.error("Error fetching dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading ward manager dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Building className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">Ward Manager Dashboard</h1>
                  <p className="text-gray-600 text-xl">Manage beds, wards, and patient allocation</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Bed className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.totalBeds}</div>
                <div className="text-blue-100">Total Beds</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>System capacity</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.availableBeds}</div>
                <div className="text-green-100">Available Beds</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-100 text-sm">
              <Activity className="w-4 h-4" />
              <span>Ready for assignment</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.occupiedBeds}</div>
                <div className="text-orange-100">Occupied Beds</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-100 text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>{stats.occupancyRate}% occupancy</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Sparkles className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.cleaningBeds}</div>
                <div className="text-purple-100">Being Cleaned</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <Clock className="w-4 h-4" />
              <span>In progress</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.maintenanceBeds}</div>
                <div className="text-red-100">Maintenance</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-red-100 text-sm">
              <Activity className="w-4 h-4" />
              <span>Out of service</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <Building className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{wards.length}</div>
                <div className="text-teal-100">Total Wards</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-teal-100 text-sm">
              <Activity className="w-4 h-4" />
              <span>Active facilities</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Building className="w-7 h-7 text-blue-600" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/beds/management")}
                className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 p-4 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Bed className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-900">Manage All Beds</span>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/beds/management")}
                className="w-full flex items-center justify-between bg-green-50 hover:bg-green-100 p-4 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-gray-900">Assign Bed to Patient</span>
                </div>
                <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/housekeeping/dashboard")}
                className="w-full flex items-center justify-between bg-yellow-50 hover:bg-yellow-100 p-4 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-yellow-600" />
                  <span className="font-semibold text-gray-900">Housekeeping Management</span>
                </div>
                <ArrowRight className="w-5 h-5 text-yellow-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/beds/management")}
                className="w-full flex items-center justify-between bg-purple-50 hover:bg-purple-100 p-4 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-900">Housekeeping Tasks</span>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/beds/management")}
                className="w-full flex items-center justify-between bg-orange-50 hover:bg-orange-100 p-4 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-orange-600" />
                  <span className="font-semibold text-gray-900">Transfer Patient</span>
                </div>
                <ArrowRight className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/ward-manager/resources")}
                className="w-full flex items-center justify-between bg-teal-50 hover:bg-teal-100 p-4 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-teal-600" />
                  <span className="font-semibold text-gray-900">Manage Resources</span>
                </div>
                <ArrowRight className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Clock className="w-7 h-7 text-green-600" />
              Recent Activity
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((bed, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        bed.status === "Occupied" ? "bg-orange-100 text-orange-600" :
                        bed.status === "Available" ? "bg-green-100 text-green-600" :
                        bed.status === "Cleaning" ? "bg-purple-100 text-purple-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        <Bed className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{bed.bedNumber}</div>
                        <div className="text-sm text-gray-600">
                          {bed.wardId?.wardName || "Unknown Ward"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        bed.status === "Occupied" ? "text-orange-600" :
                        bed.status === "Available" ? "text-green-600" :
                        bed.status === "Cleaning" ? "text-purple-600" :
                        "text-gray-600"
                      }`}>
                        {bed.status}
                      </div>
                      <div className="text-xs text-gray-500">
                        {bed.currentPatient ?
                          `${bed.currentPatient.firstName} ${bed.currentPatient.lastName}` :
                          "No patient"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Building className="w-7 h-7 text-blue-600" />
            Ward Overview
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wards.map((ward) => (
              <div
                key={ward._id}
                className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => router.push("/beds/management")}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{ward.wardName}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    ward.wardType === "ICU" ? "bg-red-100 text-red-700" :
                    ward.wardType === "Emergency" ? "bg-orange-100 text-orange-700" :
                    ward.wardType === "Pediatric" ? "bg-pink-100 text-pink-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {ward.wardType}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Beds:</span>
                    <span className="font-semibold text-gray-900">{ward.capacity?.totalBeds || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupied:</span>
                    <span className="font-semibold text-orange-600">{ward.capacity?.occupiedBeds || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold text-green-600">{ward.capacity?.availableBeds || 0}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Occupancy:</span>
                      <span className="font-bold text-blue-600">
                        {ward.capacity?.occupancyRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${ward.capacity?.occupancyRate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {wards.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Building className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No wards found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(WardManagerDashboard, ["ward_manager", "admin"]);
