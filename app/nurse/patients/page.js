"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Users,
  Search,
  Activity,
  Heart,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Bed,
  Stethoscope,
  ClipboardList,
  FileText,
  Pill,
  TrendingUp
} from "lucide-react";

function NursePatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/admission/resources");
      const data = await res.json();
      if (res.ok) {
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTriageColor = (level) => {
    if (!level) return "bg-gray-100 text-gray-700 border-gray-200";
    if (level.startsWith("1") || level.startsWith("2")) return "bg-red-100 text-red-700 border-red-200";
    if (level.startsWith("3")) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Critical": return "bg-red-100 text-red-700 border-red-200";
      case "In Treatment": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Admitted": return "bg-green-100 text-green-700 border-green-200";
      case "Stable": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "critical") {
      return matchesSearch && (patient.triageLevel?.startsWith("1") || patient.triageLevel?.startsWith("2"));
    }
    if (filter === "admitted") {
      return matchesSearch && (patient.status === "Admitted" || patient.status === "In Treatment");
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">My Patients</h1>
                <p className="text-gray-600 text-xl">Monitor and assess assigned patients</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 font-semibold mb-1">Total Patients</p>
                  <p className="text-4xl font-bold text-blue-900">{patients.length}</p>
                </div>
                <Users className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 font-semibold mb-1">Critical</p>
                  <p className="text-4xl font-bold text-red-900">
                    {patients.filter(p => p.triageLevel?.startsWith("1") || p.triageLevel?.startsWith("2")).length}
                  </p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 font-semibold mb-1">Admitted</p>
                  <p className="text-4xl font-bold text-green-900">
                    {patients.filter(p => p.status === "Admitted" || p.status === "In Treatment").length}
                  </p>
                </div>
                <Bed className="w-12 h-12 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              {[
                { key: "all", label: "All Patients" },
                { key: "critical", label: "Critical" },
                { key: "admitted", label: "Admitted" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    filter === tab.key
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
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
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                          {patient.firstName?.[0]}{patient.lastName?.[0]}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTriageColor(patient.triageLevel)}`}>
                              {patient.triageLevel || "N/A"}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(patient.status)}`}>
                              {patient.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4 text-blue-500" />
                          <span><strong>Admission:</strong> {patient.admissionNumber || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-green-500" />
                          <span><strong>Arrived:</strong> {new Date(patient.arrivalTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Bed className="w-4 h-4 text-purple-500" />
                          <span><strong>Bed:</strong> {patient.assignedBed || "Not assigned"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4 text-orange-500" />
                          <span><strong>Ward:</strong> {patient.assignedWard || "N/A"}</span>
                        </div>
                      </div>

                      {patient.chiefComplaint && (
                        <div className="bg-red-50 rounded-xl p-4 mb-4">
                          <p className="text-sm font-semibold text-red-700 mb-1">Chief Complaint</p>
                          <p className="text-sm text-red-900">{patient.chiefComplaint}</p>
                        </div>
                      )}

                      {patient.vitalSigns && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {patient.vitalSigns.bloodPressure && (
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                              <p className="text-xs text-blue-600 font-semibold mb-1">BP</p>
                              <p className="text-sm font-bold text-blue-900">{patient.vitalSigns.bloodPressure}</p>
                            </div>
                          )}
                          {patient.vitalSigns.heartRate && (
                            <div className="bg-red-50 rounded-lg p-3 text-center">
                              <p className="text-xs text-red-600 font-semibold mb-1">HR</p>
                              <p className="text-sm font-bold text-red-900">{patient.vitalSigns.heartRate}</p>
                            </div>
                          )}
                          {patient.vitalSigns.temperature && (
                            <div className="bg-orange-50 rounded-lg p-3 text-center">
                              <p className="text-xs text-orange-600 font-semibold mb-1">Temp</p>
                              <p className="text-sm font-bold text-orange-900">{patient.vitalSigns.temperature}</p>
                            </div>
                          )}
                          {patient.vitalSigns.oxygenSaturation && (
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                              <p className="text-xs text-green-600 font-semibold mb-1">SpO2</p>
                              <p className="text-sm font-bold text-green-900">{patient.vitalSigns.oxygenSaturation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 lg:w-64">
                      <button
                        onClick={() => router.push(`/patient/care/${patient._id}`)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-4 rounded-xl font-bold hover:from-green-700 hover:to-teal-700 transition-all shadow-lg"
                      >
                        <Stethoscope className="w-5 h-5" />
                        Assess Patient
                      </button>

                      <button
                        onClick={() => router.push(`/nurse/vitals?patientId=${patient._id}`)}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <Activity className="w-5 h-5" />
                        Record Vitals
                      </button>

                      <button
                        onClick={() => router.push(`/clinical/data-capture?patientId=${patient._id}`)}
                        className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                      >
                        <ClipboardList className="w-5 h-5" />
                        Clinical Data
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

export default withAuth(NursePatientsPage, ["nurse", "admin"]);
