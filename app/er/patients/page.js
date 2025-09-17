"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  Users, 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Stethoscope,
  FileText,
  Eye,
  Edit,
  Bed,
  Shield,
  Star,
  RefreshCw
} from "lucide-react";

function ERPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => {
    fetchPatients();
    // Set up real-time updates
    const interval = setInterval(fetchPatients, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/er/admission");
      const data = await res.json();
      if (res.ok) {
        setPatients(data.admissions || []);
      } else {
        setMessage("Error loading patients");
      }
    } catch (error) {
      setMessage("Error fetching patient data");
    } finally {
      setLoading(false);
    }
  };

  const updatePatientStatus = async (patientId, status) => {
    try {
      const res = await fetch("/api/er/patient/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, status }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Patient status updated to ${status}`);
        fetchPatients();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Error updating patient status");
    }
  };

  const getTriageColor = (level) => {
    const colors = {
      "1 - Resuscitation": "bg-red-100 text-red-700 border-red-200",
      "2 - Emergency": "bg-orange-100 text-orange-700 border-orange-200",
      "3 - Urgent": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "4 - Less Urgent": "bg-green-100 text-green-700 border-green-200",
      "5 - Non-Urgent": "bg-blue-100 text-blue-700 border-blue-200"
    };
    return colors[level] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusColor = (status) => {
    const colors = {
      "Admitted": "bg-blue-100 text-blue-700 border-blue-200",
      "In Treatment": "bg-purple-100 text-purple-700 border-purple-200",
      "Waiting": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Discharged": "bg-green-100 text-green-700 border-green-200",
      "Transferred": "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "critical") return patient.triageLevel.startsWith("1") || patient.triageLevel.startsWith("2");
    if (filter === "waiting") return patient.status === "Waiting";
    if (filter === "treatment") return patient.status === "In Treatment";
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading ER patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">ER Patients</h1>
                  <p className="text-gray-600 text-xl">Emergency department patient management</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={fetchPatients}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh
                </button>
                <a
                  href="/er/admission"
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                >
                  <Users className="w-6 h-6" />
                  Admit New Patient
                </a>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
                <div className="text-sm text-blue-600">Total Patients</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {patients.filter(p => p.triageLevel.startsWith("1") || p.triageLevel.startsWith("2")).length}
                </div>
                <div className="text-sm text-red-600">Critical/Emergency</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {patients.filter(p => p.status === "In Treatment").length}
                </div>
                <div className="text-sm text-purple-600">In Treatment</div>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {patients.filter(p => p.status === "Waiting").length}
                </div>
                <div className="text-sm text-yellow-600">Waiting</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, patient ID, or complaint..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { key: "all", label: "All Patients", count: patients.length },
                { key: "critical", label: "Critical", count: patients.filter(p => p.triageLevel.startsWith("1") || p.triageLevel.startsWith("2")).length },
                { key: "waiting", label: "Waiting", count: patients.filter(p => p.status === "Waiting").length },
                { key: "treatment", label: "In Treatment", count: patients.filter(p => p.status === "In Treatment").length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
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
        </div>

        {message && (
          <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl shadow-lg">
            <p className="text-blue-700 font-semibold text-lg">{message}</p>
          </div>
        )}

        {/* Patient List */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <Users className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Patients Found</h3>
            <p className="text-gray-600 text-lg">
              {searchTerm || filter !== "all" ? "No patients match your current filters." : "No patients currently in the ER."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPatients.map((patient) => (
              <div key={patient._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                {/* Patient Header */}
                <div className="p-8 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                        {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {patient.firstName} {patient.lastName}
                        </h2>
                        <div className="flex items-center gap-4 mb-3">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getTriageColor(patient.triageLevel)}`}>
                            {patient.triageLevel.startsWith("1") && <Heart className="w-4 h-4" />}
                            {patient.triageLevel.startsWith("2") && <AlertTriangle className="w-4 h-4" />}
                            {patient.triageLevel.startsWith("3") && <Clock className="w-4 h-4" />}
                            {patient.triageLevel.startsWith("4") && <CheckCircle className="w-4 h-4" />}
                            {patient.triageLevel.startsWith("5") && <Activity className="w-4 h-4" />}
                            {patient.triageLevel}
                          </span>
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(patient.status)}`}>
                            {patient.status}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4 text-green-500" />
                            <span><strong>ID:</strong> {patient.patientId}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span><strong>Arrived:</strong> {new Date(patient.arrivalTime).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Bed className="w-4 h-4 text-purple-500" />
                            <span><strong>Bed:</strong> {patient.assignedBed || "Not assigned"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowPatientModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                        View Details
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updatePatientStatus(patient._id, "In Treatment")}
                          disabled={patient.status === "In Treatment"}
                          className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors disabled:opacity-50"
                        >
                          Start Treatment
                        </button>
                        <button
                          onClick={() => updatePatientStatus(patient._id, "Discharged")}
                          className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors"
                        >
                          Discharge
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Summary */}
                <div className="p-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Chief Complaint */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-200">
                      <h4 className="font-bold text-red-900 mb-3 text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Chief Complaint
                      </h4>
                      <p className="text-red-800">{patient.chiefComplaint}</p>
                      {patient.presentingSymptoms && (
                        <div className="mt-3">
                          <p className="text-red-700 font-medium text-sm">Symptoms:</p>
                          <p className="text-red-800 text-sm">{patient.presentingSymptoms}</p>
                        </div>
                      )}
                    </div>

                    {/* Vital Signs */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-3 text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Vital Signs
                      </h4>
                      {patient.vitalSigns ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-2 text-center">
                            <div className="text-sm font-bold text-blue-900">{patient.vitalSigns.bloodPressure || "N/A"}</div>
                            <div className="text-xs text-blue-600">BP</div>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center">
                            <div className="text-sm font-bold text-blue-900">{patient.vitalSigns.heartRate || "N/A"}</div>
                            <div className="text-xs text-blue-600">HR</div>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center">
                            <div className="text-sm font-bold text-blue-900">{patient.vitalSigns.temperature || "N/A"}°C</div>
                            <div className="text-xs text-blue-600">Temp</div>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center">
                            <div className="text-sm font-bold text-blue-900">{patient.vitalSigns.oxygenSaturation || "N/A"}%</div>
                            <div className="text-xs text-blue-600">SpO2</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-blue-600">
                          <Stethoscope className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                          <p className="text-sm">No vitals recorded</p>
                        </div>
                      )}
                    </div>

                    {/* Assignment Info */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
                      <h4 className="font-bold text-green-900 mb-3 text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Assignment
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-green-600 font-medium">Bed</p>
                          <p className="text-green-900">{patient.assignedBed || "Not assigned"}</p>
                        </div>
                        <div>
                          <p className="text-green-600 font-medium">Ward</p>
                          <p className="text-green-900">{patient.assignedWard || "Not assigned"}</p>
                        </div>
                        <div>
                          <p className="text-green-600 font-medium">Pain Level</p>
                          <p className="text-green-900">{patient.painScale}/10</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Patient Detail Modal */}
        {showPatientModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h2>
                    <p className="text-blue-100">Patient ID: {selectedPatient.patientId}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPatientModal(false);
                      setSelectedPatient(null);
                    }}
                    className="p-2 text-white hover:text-blue-200 transition-colors"
                  >
                    <AlertTriangle className="w-6 h-6 rotate-45" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Patient Information */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Patient Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date of Birth:</span>
                          <span className="font-semibold">{selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : "Not provided"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-semibold">{selectedPatient.gender || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID Number:</span>
                          <span className="font-semibold">{selectedPatient.idNumber || "Not provided"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-semibold">{selectedPatient.phone || "Not provided"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-semibold">{selectedPatient.address || "Not provided"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    {selectedPatient.emergencyContact?.name && (
                      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">Emergency Contact</h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-blue-800"><strong>Name:</strong> {selectedPatient.emergencyContact.name}</p>
                          <p className="text-blue-800"><strong>Relationship:</strong> {selectedPatient.emergencyContact.relationship}</p>
                          <p className="text-blue-800"><strong>Phone:</strong> {selectedPatient.emergencyContact.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Medical Information */}
                  <div className="space-y-6">
                    <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                      <h3 className="text-xl font-bold text-red-900 mb-4">Medical Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-red-700 font-medium">Chief Complaint</p>
                          <p className="text-red-800">{selectedPatient.chiefComplaint}</p>
                        </div>
                        {selectedPatient.allergies && (
                          <div>
                            <p className="text-red-700 font-medium">Allergies</p>
                            <p className="text-red-800">{selectedPatient.allergies}</p>
                          </div>
                        )}
                        {selectedPatient.currentMedications && (
                          <div>
                            <p className="text-red-700 font-medium">Current Medications</p>
                            <p className="text-red-800">{selectedPatient.currentMedications}</p>
                          </div>
                        )}
                        {selectedPatient.medicalHistory && (
                          <div>
                            <p className="text-red-700 font-medium">Medical History</p>
                            <p className="text-red-800">{selectedPatient.medicalHistory}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Triage Information */}
                    <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                      <h3 className="text-xl font-bold text-purple-900 mb-4">Triage Assessment</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-purple-700 font-medium">Triage Time</p>
                          <p className="text-purple-800">{new Date(selectedPatient.triageTime).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-purple-700 font-medium">Triage Nurse</p>
                          <p className="text-purple-800">{selectedPatient.triageNurse?.name || "Unknown"}</p>
                        </div>
                        {selectedPatient.triageNotes && (
                          <div>
                            <p className="text-purple-700 font-medium">Triage Notes</p>
                            <p className="text-purple-800">{selectedPatient.triageNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ERPatients, ["receptionist", "nurse", "er", "doctor", "admin"]);