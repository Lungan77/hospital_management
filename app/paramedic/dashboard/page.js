"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import withAuth from "@/hoc/withAuth";
import { 
  HeartPulse, 
  Activity, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Stethoscope,
  Pill,
  Thermometer,
  Phone,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  BarChart3
} from "lucide-react";

function ParamedicDashboard() {
  const { data: session } = useSession();
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [todayStats, setTodayStats] = useState({
    patientsTreated: 0,
    activeCalls: 0,
    avgResponseTime: 0,
    successRate: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchParamedicData();
    // Set up real-time updates
    const interval = setInterval(fetchParamedicData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchParamedicData = async () => {
    try {
      // Fetch current assignment
      const assignmentRes = await fetch("/api/emergency/paramedic/assignment");
      const assignmentData = await assignmentRes.json();
      if (assignmentRes.ok) {
        setCurrentAssignment(assignmentData.assignment);
      }

      // Mock stats for demonstration
      setTodayStats({
        patientsTreated: 12,
        activeCalls: currentAssignment ? 1 : 0,
        avgResponseTime: 8,
        successRate: 96
      });

      // Mock recent patients
      setRecentPatients([
        { name: "John Smith", condition: "Cardiac Emergency", time: "14:30", outcome: "Stabilized" },
        { name: "Mary Johnson", condition: "Respiratory Distress", time: "12:15", outcome: "Transported" },
        { name: "Robert Davis", condition: "Trauma", time: "10:45", outcome: "Treated" }
      ]);
    } catch (error) {
      setMessage("Error loading paramedic data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading paramedic dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-100 to-pink-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg">
                <HeartPulse className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Paramedic Dashboard</h1>
                <p className="text-gray-600 text-xl">Welcome back, {session?.user.name}</p>
              </div>
            </div>
            
            {/* Today's Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{todayStats.patientsTreated}</div>
                <div className="text-sm text-blue-600">Patients Treated</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">{todayStats.activeCalls}</div>
                <div className="text-sm text-red-600">Active Calls</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{todayStats.avgResponseTime} min</div>
                <div className="text-sm text-green-600">Avg Response Time</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{todayStats.successRate}%</div>
                <div className="text-sm text-purple-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl shadow-lg">
            <p className="text-blue-700 font-semibold text-lg">{message}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current Assignment */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Activity className="w-8 h-8" />
                Current Assignment
              </h2>
              <p className="text-red-100">Active emergency response</p>
            </div>

            <div className="p-8">
              {currentAssignment ? (
                <div className="space-y-6">
                  <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-200">
                    <h3 className="font-bold text-red-900 mb-4 text-xl">{currentAssignment.incidentNumber}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-red-600 font-medium">Priority:</span>
                        <span className="text-red-800 font-bold">{currentAssignment.priority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600 font-medium">Status:</span>
                        <span className="text-red-800 font-bold">{currentAssignment.status}</span>
                      </div>
                      <div>
                        <span className="text-red-600 font-medium">Patient Condition:</span>
                        <p className="text-red-800 mt-1">{currentAssignment.patientCondition}</p>
                      </div>
                      <div>
                        <span className="text-red-600 font-medium">Location:</span>
                        <p className="text-red-800 mt-1">{currentAssignment.address}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => window.location.href = '/emergency/paramedic'}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <HeartPulse className="w-6 h-6" />
                    Open Emergency Interface
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <HeartPulse className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Assignment</h3>
                  <p className="text-gray-600">Standby for emergency dispatch</p>
                </div>
              )}
            </div>
          </div>

          {/* Medical Equipment Status */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Stethoscope className="w-8 h-8" />
                Equipment Status
              </h2>
              <p className="text-blue-100">Medical equipment readiness</p>
            </div>

            <div className="p-8">
              <div className="space-y-4">
                {[
                  { name: "Defibrillator", status: "Operational", lastCheck: "Today 08:00", color: "green" },
                  { name: "Oxygen Tank", status: "Full", lastCheck: "Today 08:00", color: "green" },
                  { name: "IV Supplies", status: "Stocked", lastCheck: "Today 08:00", color: "green" },
                  { name: "Medications", status: "Check Required", lastCheck: "Yesterday", color: "yellow" }
                ].map((equipment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        equipment.color === 'green' ? 'bg-green-500' :
                        equipment.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{equipment.name}</p>
                        <p className="text-sm text-gray-600">{equipment.lastCheck}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      equipment.color === 'green' ? 'bg-green-100 text-green-700' :
                      equipment.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {equipment.status}
                    </span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Complete Equipment Check
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Activity className="w-8 h-8 text-red-600" />
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button className="p-6 border-2 border-gray-200 rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all duration-200 group">
              <HeartPulse className="w-12 h-12 text-red-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Emergency Response</h3>
              <p className="text-gray-600 text-sm">Active emergency interface</p>
            </button>
            
            <button className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Medical Protocols</h3>
              <p className="text-gray-600 text-sm">Treatment guidelines</p>
            </button>
            
            <button className="p-6 border-2 border-gray-200 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 group">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Patient Records</h3>
              <p className="text-gray-600 text-sm">Treatment history</p>
            </button>
            
            <button className="p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group">
              <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Contact</h3>
              <p className="text-gray-600 text-sm">Medical control & dispatch</p>
            </button>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-red-600" />
            Recent Patients
          </h2>
          <div className="space-y-4">
            {recentPatients.map((patient, index) => (
              <div key={index} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{patient.name}</h3>
                    <p className="text-gray-600">{patient.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{patient.time}</p>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700 border border-green-200">
                    <CheckCircle className="w-3 h-3" />
                    {patient.outcome}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-100 text-red-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{todayStats.patientsTreated}</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Patients Treated Today</div>
            <div className="text-sm text-green-600 font-semibold">+3 from yesterday</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{todayStats.avgResponseTime}</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Avg Response Time (min)</div>
            <div className="text-sm text-green-600 font-semibold">-2 min improvement</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{todayStats.successRate}%</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Treatment Success Rate</div>
            <div className="text-sm text-green-600 font-semibold">Excellent performance</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">A+</div>
              </div>
            </div>
            <div className="text-gray-600 font-medium">Performance Grade</div>
            <div className="text-sm text-purple-600 font-semibold">Top performer</div>
          </div>
        </div>

        {/* Medical Protocols Quick Reference */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Quick Protocol Reference
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Cardiac Arrest", steps: "CPR → Defibrillation → Epinephrine", priority: "Critical", color: "red" },
              { title: "Respiratory Distress", steps: "Oxygen → Albuterol → Position", priority: "High", color: "orange" },
              { title: "Trauma Assessment", steps: "ABC → Spinal → Bleeding Control", priority: "High", color: "yellow" },
              { title: "Stroke Protocol", steps: "FAST → IV Access → Hospital Alert", priority: "Critical", color: "red" },
              { title: "Chest Pain", steps: "Oxygen → Aspirin → Nitroglycerin", priority: "High", color: "orange" },
              { title: "Allergic Reaction", steps: "Epinephrine → Benadryl → Steroids", priority: "Medium", color: "blue" }
            ].map((protocol, index) => (
              <div key={index} className={`p-4 border-2 rounded-xl hover:shadow-lg transition-all duration-200 ${
                protocol.color === 'red' ? 'border-red-200 hover:border-red-400 bg-red-50' :
                protocol.color === 'orange' ? 'border-orange-200 hover:border-orange-400 bg-orange-50' :
                protocol.color === 'yellow' ? 'border-yellow-200 hover:border-yellow-400 bg-yellow-50' :
                'border-blue-200 hover:border-blue-400 bg-blue-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{protocol.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    protocol.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                    protocol.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {protocol.priority}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{protocol.steps}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ParamedicDashboard, ["paramedic"]);