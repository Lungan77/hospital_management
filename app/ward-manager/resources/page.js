"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Users,
  Stethoscope,
  Activity,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  Settings
} from "lucide-react";

function ResourceManagement() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignType, setAssignType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes, nursesRes] = await Promise.all([
        fetch("/api/admission/resources"),
        fetch("/api/doctors"),
        fetch("/api/staff/available?role=nurse")
      ]);

      const patientsData = await patientsRes.json();
      const doctorsData = await doctorsRes.json();
      const nursesData = await nursesRes.json();

      if (patientsRes.ok && patientsData.patients) {
        setPatients(patientsData.patients);
      }
      if (doctorsRes.ok && doctorsData.doctors) {
        setDoctors(doctorsData.doctors);
      }
      if (nursesRes.ok && nursesData.allStaff) {
        setNurses(nursesData.allStaff);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignResource = async (resourceId, resourceType) => {
    if (!selectedPatient) return;

    setSubmitting(true);
    try {
      const updateData = {};
      if (resourceType === "doctor") {
        updateData.assignedDoctor = resourceId;
      } else if (resourceType === "nurse") {
        updateData.assignedNurse = resourceId;
      }

      const response = await fetch(`/api/admission/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionId: selectedPatient._id,
          ...updateData
        })
      });

      if (response.ok) {
        await fetchData();
        setShowAssignModal(false);
        setSelectedPatient(null);
      }
    } catch (error) {
      console.error("Error assigning resource:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const openAssignModal = (patient, type) => {
    setSelectedPatient(patient);
    setAssignType(type);
    setShowAssignModal(true);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "unassigned" && !patient.assignedDoctor && !patient.assignedNurse) ||
      (filterStatus === "assigned" && (patient.assignedDoctor || patient.assignedNurse));

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading resource management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Settings className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Resource Management</h1>
                <p className="text-gray-600 text-xl">Assign doctors and nurses to admitted patients</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients by name, ID, or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="all">All Patients</option>
                <option value="unassigned">Unassigned</option>
                <option value="assigned">Assigned</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <Users className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{patients.length}</div>
                <div className="text-blue-100">Total Patients</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <Stethoscope className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{doctors.length}</div>
                <div className="text-green-100">Available Doctors</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <Activity className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{nurses.length}</div>
                <div className="text-purple-100">Available Nurses</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-600" />
            Admitted Patients
          </h2>

          {filteredPatients.length > 0 ? (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        {patient.admissionNumber && (
                          <span className="font-semibold">ID: {patient.admissionNumber}</span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          patient.triageLevel?.includes("1") ? "bg-red-100 text-red-700" :
                          patient.triageLevel?.includes("2") ? "bg-orange-100 text-orange-700" :
                          patient.triageLevel?.includes("3") ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {patient.triageLevel || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Chief Complaint</div>
                      <div className="font-semibold text-gray-900">{patient.chiefComplaint || "N/A"}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Admission Type</div>
                      <div className="font-semibold text-gray-900">{patient.admissionType || "N/A"}</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">Assigned Doctor</span>
                        </div>
                        {patient.assignedDoctor ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div className="text-gray-700 mb-3">
                        {patient.assignedDoctor ?
                          `Dr. ${patient.assignedDoctor.firstName} ${patient.assignedDoctor.lastName}` :
                          "Not assigned"}
                      </div>
                      <button
                        onClick={() => openAssignModal(patient, "doctor")}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        {patient.assignedDoctor ? "Reassign" : "Assign"} Doctor
                      </button>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-gray-900">Assigned Nurse</span>
                        </div>
                        {patient.assignedNurse ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div className="text-gray-700 mb-3">
                        {patient.assignedNurse ?
                          `${patient.assignedNurse.firstName} ${patient.assignedNurse.lastName}` :
                          "Not assigned"}
                      </div>
                      <button
                        onClick={() => openAssignModal(patient, "nurse")}
                        className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        {patient.assignedNurse ? "Reassign" : "Assign"} Nurse
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No patients found</p>
            </div>
          )}
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Assign {assignType === "doctor" ? "Doctor" : "Nurse"}
                </h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              {selectedPatient && (
                <p className="text-gray-600 mt-2">
                  Patient: {selectedPatient.firstName} {selectedPatient.lastName}
                </p>
              )}
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {assignType === "doctor" ? (
                  doctors.length > 0 ? (
                    doctors.map((doctor) => (
                      <button
                        key={doctor._id}
                        onClick={() => handleAssignResource(doctor._id, "doctor")}
                        disabled={submitting}
                        className="w-full flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
                      >
                        <div className="text-left flex-1">
                          <div className="font-bold text-gray-900 text-lg mb-1">
                            {doctor.title && doctor.title !== "None" ? `${doctor.title}. ` : ""}{doctor.name}
                          </div>
                          <div className="text-sm text-blue-600 font-medium mb-1">{doctor.email}</div>
                          {doctor.phone && (
                            <div className="text-xs text-gray-500">{doctor.phone}</div>
                          )}
                        </div>
                        <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 ml-4" />
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No doctors available</p>
                    </div>
                  )
                ) : (
                  nurses.length > 0 ? (
                    nurses.map((nurse) => (
                      <button
                        key={nurse._id}
                        onClick={() => handleAssignResource(nurse._id, "nurse")}
                        disabled={submitting}
                        className="w-full flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50"
                      >
                        <div className="text-left flex-1">
                          <div className="font-bold text-gray-900 text-lg mb-1">
                            {nurse.title && nurse.title !== "None" ? `${nurse.title}. ` : ""}{nurse.name}
                          </div>
                          <div className="text-sm text-purple-600 font-medium mb-1">{nurse.email}</div>
                          {nurse.phone && (
                            <div className="text-xs text-gray-500">{nurse.phone}</div>
                          )}
                        </div>
                        <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 ml-4" />
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No nurses available</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(ResourceManagement, ["ward_manager", "admin"]);
