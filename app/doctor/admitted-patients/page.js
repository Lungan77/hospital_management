"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Users,
  Activity,
  Clock,
  Bed,
  Heart,
  AlertCircle,
  Search,
  Calendar,
  Phone,
  ChevronRight,
  FileText,
  Home
} from "lucide-react";

function AdmittedPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchAdmittedPatients();
  }, []);

  const fetchAdmittedPatients = async () => {
    try {
      const res = await fetch("/api/doctor/admitted-patients");
      const data = await res.json();
      if (res.ok) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName} ${patient.admissionNumber}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getTriageColor = (level) => {
    const colors = {
      "1 - Resuscitation": "bg-red-100 text-red-700 border-red-300",
      "2 - Emergency": "bg-orange-100 text-orange-700 border-orange-300",
      "3 - Urgent": "bg-yellow-100 text-yellow-700 border-yellow-300",
      "4 - Less Urgent": "bg-green-100 text-green-700 border-green-300",
      "5 - Non-Urgent": "bg-blue-100 text-blue-700 border-blue-300"
    };
    return colors[level] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getStatusColor = (status) => {
    const colors = {
      "Admitted": "bg-blue-100 text-blue-700",
      "In Treatment": "bg-green-100 text-green-700",
      "Waiting": "bg-yellow-100 text-yellow-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading admitted patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gray-900">My Admitted Patients</h1>
              <p className="text-gray-600 text-xl mt-2">Manage treatment plans and patient care</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <Users className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Admitted Patients</h3>
            <p className="text-gray-600">
              {searchTerm ? "No patients match your search" : "You don't have any admitted patients at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => router.push(`/doctor/treatment-plan/${patient._id}`)}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                          <span className="font-mono font-semibold">{patient.admissionNumber}</span>
                          <span>•</span>
                          <span>{patient.gender}</span>
                          {patient.dateOfBirth && (
                            <>
                              <span>•</span>
                              <span>{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getTriageColor(patient.triageLevel)}`}>
                            {patient.triageLevel}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(patient.status)}`}>
                            {patient.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-600 font-semibold">Chief Complaint</span>
                      </div>
                      <p className="text-sm text-blue-900 font-medium">{patient.chiefComplaint}</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Bed className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-semibold">Bed Assignment</span>
                      </div>
                      <p className="text-sm text-green-900 font-medium">
                        {patient.assignedWard && patient.assignedBed
                          ? `${patient.assignedWard} - ${patient.assignedBed}`
                          : "Not assigned"}
                      </p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-xs text-orange-600 font-semibold">Admitted</span>
                      </div>
                      <p className="text-sm text-orange-900 font-medium">
                        {new Date(patient.arrivalTime).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {patient.presentingSymptoms && (
                    <div className="p-4 bg-gray-50 rounded-2xl mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Presenting Symptoms</h4>
                      <p className="text-sm text-gray-700">{patient.presentingSymptoms}</p>
                    </div>
                  )}

                  {patient.alerts && patient.alerts.length > 0 && (
                    <div className="flex items-start gap-2 p-4 bg-red-50 rounded-2xl border border-red-200">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-1">Alerts</h4>
                        <div className="space-y-1">
                          {patient.alerts.map((alert, idx) => (
                            <p key={idx} className="text-sm text-red-700">
                              <span className="font-semibold">{alert.type}:</span> {alert.description}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid md:grid-cols-3 gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/patient/care/${patient._id}`);
                        }}
                        className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-3"
                      >
                        <Activity className="w-5 h-5" />
                        Medications & Procedures
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/doctor/treatment-plan/${patient._id}`);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-3"
                      >
                        <FileText className="w-5 h-5" />
                        Treatment Plan
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/doctor/discharge/${patient._id}`);
                        }}
                        className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-3"
                      >
                        <Home className="w-5 h-5" />
                        Discharge Patient
                      </button>
                    </div>
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

export default withAuth(AdmittedPatients, ["doctor"]);
