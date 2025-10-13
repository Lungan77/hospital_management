"use client";
import { useState, useEffect } from "react";
import { Users, Activity, Stethoscope, UserPlus, Plus, X, Search, CheckCircle, AlertCircle } from "lucide-react";

export default function ResourceAssignment() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [availableStaff, setAvailableStaff] = useState({ doctors: [], nurses: [], specialists: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [assignmentData, setAssignmentData] = useState({
    doctorId: "",
    nurseId: "",
    specialistId: "",
    specialty: "",
    equipmentType: "",
    equipmentId: "",
    notes: ""
  });

  useEffect(() => {
    fetchPatients();
    fetchAvailableStaff();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/er/admission");
      const data = await res.json();
      if (res.ok) {
        setPatients(data.admissions || []);
      }
    } catch (error) {
      console.error("Error fetching patients");
    }
  };

  const fetchAvailableStaff = async () => {
    try {
      const res = await fetch("/api/staff/available");
      const data = await res.json();
      if (res.ok) {
        setAvailableStaff(data.staff);
      }
    } catch (error) {
      console.error("Error fetching staff");
    }
  };

  const selectPatient = async (patient) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admission/resources?admissionId=${patient._id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedPatient(data.admission);
      }
    } catch (error) {
      console.error("Error fetching patient details");
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = (type) => {
    setAssignmentType(type);
    setShowAssignModal(true);
    setAssignmentData({
      doctorId: "",
      nurseId: "",
      specialistId: "",
      specialty: "",
      equipmentType: "",
      equipmentId: "",
      notes: ""
    });
  };

  const assignResource = async () => {
    setLoading(true);
    setMessage("");

    let resourceData = {};
    let resourceType = assignmentType;

    switch (assignmentType) {
      case "doctor":
        resourceData = { doctorId: assignmentData.doctorId };
        break;
      case "nurse":
        resourceData = { nurseId: assignmentData.nurseId };
        break;
      case "specialist":
        resourceData = {
          specialistId: assignmentData.specialistId,
          specialty: assignmentData.specialty,
          notes: assignmentData.notes
        };
        break;
      case "equipment":
        resourceData = {
          equipmentType: assignmentData.equipmentType,
          equipmentId: assignmentData.equipmentId,
          notes: assignmentData.notes
        };
        break;
    }

    try {
      const res = await fetch("/api/admission/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionId: selectedPatient._id,
          resourceType,
          resourceData
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setSelectedPatient(data.admission);
        setShowAssignModal(false);
        fetchPatients();
      } else {
        setMessage(data.error || "Error assigning resource");
      }
    } catch (error) {
      setMessage("Error assigning resource");
    } finally {
      setLoading(false);
    }
  };

  const removeResource = async (resourceType, resourceId) => {
    if (!confirm("Remove this resource assignment?")) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/admission/resources?admissionId=${selectedPatient._id}&resourceType=${resourceType}&resourceId=${resourceId}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      if (res.ok) {
        setMessage("Resource removed successfully");
        selectPatient(selectedPatient);
        fetchPatients();
      }
    } catch (error) {
      setMessage("Error removing resource");
    } finally {
      setLoading(false);
    }
  };

  const getTriageColor = (level) => {
    const colors = {
      "1 - Resuscitation": "bg-red-100 text-red-800 border-red-300",
      "2 - Emergency": "bg-orange-100 text-orange-800 border-orange-300",
      "3 - Urgent": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "4 - Less Urgent": "bg-green-100 text-green-800 border-green-300",
      "5 - Non-Urgent": "bg-blue-100 text-blue-800 border-blue-300"
    };
    return colors[level] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const filteredPatients = patients.filter(p =>
    p.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.admissionNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const equipmentTypes = ["Ventilator", "Monitor", "Oxygen", "IV Pump", "Defibrillator", "Suction", "Other"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10 text-blue-600" />
            Resource Assignment
          </h1>
          <p className="text-gray-600">Assign doctors, nurses, specialists, and critical equipment to admitted patients</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${message.includes("Error") || message.includes("error") ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"}`}>
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Admitted Patients
              </h2>
              <p className="text-blue-100 text-sm">{patients.length} patients</p>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    onClick={() => selectPatient(patient)}
                    className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedPatient?._id === patient._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{patient.firstName} {patient.lastName}</h3>
                        <p className="text-xs text-gray-600">{patient.admissionNumber}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${getTriageColor(patient.triageLevel)}`}>
                        {patient.triageLevel?.split(" - ")[0]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{patient.chiefComplaint}</p>
                    <div className="flex gap-2 text-xs">
                      {patient.assignedDoctor && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Doctor
                        </span>
                      )}
                      {patient.assignedNurse && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Nurse
                        </span>
                      )}
                      {!patient.assignedDoctor || !patient.assignedNurse ? (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Needs Assignment
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedPatient ? (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                      <p className="text-gray-600">{selectedPatient.admissionNumber} • {selectedPatient.chiefComplaint}</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold border ${getTriageColor(selectedPatient.triageLevel)}`}>
                        {selectedPatient.triageLevel}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-blue-900 flex items-center gap-2">
                          <Stethoscope className="w-5 h-5" />
                          Primary Doctor
                        </h3>
                        {!selectedPatient.assignedDoctor && (
                          <button
                            onClick={() => openAssignModal("doctor")}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      {selectedPatient.assignedDoctor ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-gray-900 font-medium">
                            {selectedPatient.assignedDoctor.name || "Assigned"}
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">Not assigned</p>
                      )}
                    </div>

                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-green-900 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Primary Nurse
                        </h3>
                        {!selectedPatient.assignedNurse && (
                          <button
                            onClick={() => openAssignModal("nurse")}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      {selectedPatient.assignedNurse ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-gray-900 font-medium">
                            {selectedPatient.assignedNurse.name || "Assigned"}
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">Not assigned</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <UserPlus className="w-6 h-6 text-purple-600" />
                      Specialists
                    </h3>
                    <button
                      onClick={() => openAssignModal("specialist")}
                      className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Specialist
                    </button>
                  </div>

                  {selectedPatient.assignedSpecialists?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPatient.assignedSpecialists.map((specialist) => (
                        <div key={specialist._id} className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-900">{specialist.specialistId?.name || "Specialist"}</p>
                            <p className="text-sm text-gray-600">{specialist.specialty}</p>
                            {specialist.notes && <p className="text-xs text-gray-500 mt-1">{specialist.notes}</p>}
                          </div>
                          <button
                            onClick={() => removeResource("specialist", specialist._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No specialists assigned</p>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Activity className="w-6 h-6 text-red-600" />
                      Critical Equipment
                    </h3>
                    <button
                      onClick={() => openAssignModal("equipment")}
                      className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Equipment
                    </button>
                  </div>

                  {selectedPatient.assignedEquipment?.filter(e => e.status === "Active").length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedPatient.assignedEquipment
                        .filter(e => e.status === "Active")
                        .map((equipment) => (
                          <div key={equipment._id} className="p-4 bg-red-50 rounded-xl border border-red-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">{equipment.equipmentType}</p>
                                <p className="text-xs text-gray-600">{equipment.equipmentId}</p>
                              </div>
                              <button
                                onClick={() => removeResource("equipment", equipment._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {equipment.notes && <p className="text-xs text-gray-500">{equipment.notes}</p>}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No equipment assigned</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <Activity className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Patient</h3>
                <p className="text-gray-600">Choose a patient from the list to assign resources</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Assign {assignmentType.charAt(0).toUpperCase() + assignmentType.slice(1)}
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {assignmentType === "doctor" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Doctor</label>
                  <select
                    value={assignmentData.doctorId}
                    onChange={(e) => setAssignmentData({ ...assignmentData, doctorId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a doctor...</option>
                    {availableStaff.doctors.map((doc) => (
                      <option key={doc._id} value={doc._id}>{doc.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {assignmentType === "nurse" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Nurse</label>
                  <select
                    value={assignmentData.nurseId}
                    onChange={(e) => setAssignmentData({ ...assignmentData, nurseId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a nurse...</option>
                    {availableStaff.nurses.map((nurse) => (
                      <option key={nurse._id} value={nurse._id}>{nurse.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {assignmentType === "specialist" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Specialist</label>
                    <select
                      value={assignmentData.specialistId}
                      onChange={(e) => setAssignmentData({ ...assignmentData, specialistId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a specialist...</option>
                      {availableStaff.specialists.map((spec) => (
                        <option key={spec._id} value={spec._id}>{spec.name} {spec.specialty ? `- ${spec.specialty}` : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty</label>
                    <input
                      type="text"
                      value={assignmentData.specialty}
                      onChange={(e) => setAssignmentData({ ...assignmentData, specialty: e.target.value })}
                      placeholder="e.g., Cardiology, Neurology"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={assignmentData.notes}
                      onChange={(e) => setAssignmentData({ ...assignmentData, notes: e.target.value })}
                      placeholder="Reason for consultation..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {assignmentType === "equipment" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment Type</label>
                    <select
                      value={assignmentData.equipmentType}
                      onChange={(e) => setAssignmentData({ ...assignmentData, equipmentType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose equipment type...</option>
                      {equipmentTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment ID</label>
                    <input
                      type="text"
                      value={assignmentData.equipmentId}
                      onChange={(e) => setAssignmentData({ ...assignmentData, equipmentId: e.target.value })}
                      placeholder="Equipment serial number or ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={assignmentData.notes}
                      onChange={(e) => setAssignmentData({ ...assignmentData, notes: e.target.value })}
                      placeholder="Additional information..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={assignResource}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
