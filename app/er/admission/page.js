"use client";
import { useState, useEffect } from "react";
import withAuth from "@/hoc/withAuth";
import {
  UserPlus,
  Heart,
  Activity,
  Clock,
  User,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Stethoscope,
  FileText,
  Save,
  Search,
  Filter,
  Calendar,
  Truck,
  Shield,
  Star,
  Plus,
  Thermometer,
  Droplets,
  Zap,
  Bed
} from "lucide-react";

function EmergencyAdmission() {
  const [admissionData, setAdmissionData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    idNumber: "",
    phone: "",
    address: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: ""
    },
    admissionType: "Emergency",
    arrivalMethod: "Ambulance",
    chiefComplaint: "",
    presentingSymptoms: "",
    painScale: 0,
    allergies: "",
    currentMedications: "",
    medicalHistory: "",
    triageLevel: "",
    triageNotes: "",
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
      height: ""
    },
    insurance: {
      provider: "",
      policyNumber: "",
      groupNumber: ""
    }
  });

  const [handoverPatients, setHandoverPatients] = useState([]);
  const [selectedHandover, setSelectedHandover] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchHandoverPatients();
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchHandoverPatients();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHandoverPatients = async () => {
    try {
      const res = await fetch("/api/er/handovers");
      const data = await res.json();
      if (res.ok) {
        const verifiedHandovers = (data.handovers || []).filter(h => h.erVerified && !h.admitted);
        setHandoverPatients(verifiedHandovers);
      }
    } catch (error) {
      console.error("Error fetching handover patients");
    }
  };


  const selectHandoverPatient = (handover) => {
    setSelectedHandover(handover);
    // Pre-populate form with handover data
    setAdmissionData(prev => ({
      ...prev,
      firstName: handover.firstName || "",
      lastName: handover.lastName || "",
      dateOfBirth: handover.dateOfBirth || "",
      gender: handover.gender || "",
      phone: handover.phone || "",
      address: handover.address || "",
      chiefComplaint: handover.chiefComplaint || "",
      presentingSymptoms: handover.presentingSymptoms || "",
      medicalHistory: handover.medicalHistory || "",
      allergies: handover.allergies || "",
      currentMedications: handover.currentMedications || "",
      triageLevel: handover.triageLevel || "",
      admissionType: "Emergency",
      arrivalMethod: "Ambulance",
      emergencyId: handover.emergencyId?._id || handover.emergencyId
    }));

    // Pre-populate vitals if available
    if (handover.vitalSigns) {
      setAdmissionData(prev => ({
        ...prev,
        vitalSigns: {
          bloodPressure: handover.vitalSigns.bloodPressure || "",
          heartRate: handover.vitalSigns.heartRate?.toString() || "",
          temperature: handover.vitalSigns.temperature?.toString() || "",
          respiratoryRate: handover.vitalSigns.respiratoryRate?.toString() || "",
          oxygenSaturation: handover.vitalSigns.oxygenSaturation?.toString() || "",
          weight: "",
          height: ""
        },
        painScale: handover.painScale || 0
      }));
    }

    setStep(2);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setAdmissionData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setAdmissionData(prev => ({ ...prev, [field]: value }));
    }
  };

  const submitAdmission = async () => {
    // Validate required fields
    if (!admissionData.firstName || !admissionData.lastName || !admissionData.chiefComplaint || !admissionData.triageLevel) {
      setMessage("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/er/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(admissionData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        // Reset form
        setAdmissionData({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          gender: "",
          idNumber: "",
          phone: "",
          address: "",
          emergencyContact: { name: "", relationship: "", phone: "" },
          admissionType: "Emergency",
          arrivalMethod: "Ambulance",
          chiefComplaint: "",
          presentingSymptoms: "",
          painScale: 0,
          allergies: "",
          currentMedications: "",
          medicalHistory: "",
          triageLevel: "",
          triageNotes: "",
          vitalSigns: {
            bloodPressure: "",
            heartRate: "",
            temperature: "",
            respiratoryRate: "",
            oxygenSaturation: "",
            weight: "",
            height: ""
          },
          insurance: { provider: "", policyNumber: "", groupNumber: "" }
        });
        setSelectedHandover(null);
        setStep(1);
        fetchHandoverPatients();
      } else {
        setMessage(data.error || "Error admitting patient");
      }
    } catch (error) {
      setMessage("Error submitting admission");
    } finally {
      setSaving(false);
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

  const getPriorityColor = (priority) => {
    const colors = {
      "Critical": "bg-red-100 text-red-700 border-red-200",
      "High": "bg-orange-100 text-orange-700 border-orange-200",
      "Medium": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Low": "bg-green-100 text-green-700 border-green-200"
    };
    return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-100 to-blue-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Emergency Patient Admission</h1>
                <p className="text-gray-600 text-xl">Rapid patient registration and triage system</p>
              </div>
            </div>
            
            {/* Process Steps */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`rounded-2xl p-4 border ${step >= 1 ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="text-lg font-bold text-blue-600">1. Select Patient</div>
                <div className="text-sm text-blue-600">From EMS or Walk-in</div>
              </div>
              <div className={`rounded-2xl p-4 border ${step >= 2 ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="text-lg font-bold text-green-600">2. Patient Details</div>
                <div className="text-sm text-green-600">Basic Information</div>
              </div>
              <div className={`rounded-2xl p-4 border ${step >= 3 ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="text-lg font-bold text-purple-600">3. Triage & Vitals</div>
                <div className="text-sm text-purple-600">Medical Assessment</div>
              </div>
              <div className={`rounded-2xl p-4 border ${step >= 4 ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="text-lg font-bold text-orange-600">4. Complete</div>
                <div className="text-sm text-orange-600">Admit Patient</div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 ${
            message.includes("successfully") 
              ? "bg-green-50 border-green-500 text-green-700" 
              : "bg-red-50 border-red-500 text-red-700"
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.includes("successfully") ? "bg-green-500" : "bg-red-500"
              }`}>
                <span className="text-white text-sm font-bold">
                  {message.includes("successfully") ? "✓" : "!"}
                </span>
              </div>
              <p className="font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        {/* Step 1: Select Patient Source */}
        {step === 1 && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Verified Handover Patients */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <CheckCircle className="w-8 h-8" />
                  Verified Handover Patients
                </h2>
                <p className="text-green-100">Patients ready for admission after ER verification</p>
              </div>

              <div className="p-6">
                {handoverPatients.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Verified Handovers</h3>
                    <p className="text-gray-600">No patients currently ready for admission</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {handoverPatients.map((patient) => (
                      <div
                        key={patient._id}
                        onClick={() => selectHandoverPatient(patient)}
                        className="p-6 border-2 border-gray-200 rounded-2xl cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{patient.firstName} {patient.lastName}</h3>
                            <p className="text-gray-600">Patient ID: {patient.patientId}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getTriageColor(patient.triageLevel)}`}>
                              {patient.triageLevel}
                            </span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>Handover: {new Date(patient.handoverTime).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Stethoscope className="w-4 h-4 text-purple-500" />
                            <span>{patient.chiefComplaint}</span>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-green-700 mb-1">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-semibold">ER Verified by {patient.erVerifiedBy?.name || 'ER Staff'}</span>
                          </div>
                          {patient.emergencyId?.incidentNumber && (
                            <p className="text-xs text-gray-600">Incident: {patient.emergencyId.incidentNumber}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Walk-in Registration */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <User className="w-8 h-8" />
                  Walk-in Registration
                </h2>
                <p className="text-blue-100">Register new walk-in patients</p>
              </div>

              <div className="p-8">
                <div className="text-center py-12">
                  <UserPlus className="w-24 h-24 text-blue-300 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Register Walk-in Patient</h3>
                  <p className="text-gray-600 mb-8">Start registration for patients arriving without EMS</p>
                  <button
                    onClick={() => {
                      setSelectedEmergency(null);
                      setAdmissionData(prev => ({
                        ...prev,
                        admissionType: "Walk-in",
                        arrivalMethod: "Walk-in"
                      }));
                      setStep(2);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                  >
                    <Plus className="w-6 h-6 inline mr-2" />
                    Start Registration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Patient Information */}
        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Patient Information</h2>
              <p className="text-green-100">Enter patient demographics and contact details</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-green-600" />
                  Basic Information
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={admissionData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Patient's first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={admissionData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Patient's last name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={admissionData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <select
                      value={admissionData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ID Number</label>
                    <input
                      type="text"
                      value={admissionData.idNumber}
                      onChange={(e) => handleInputChange('idNumber', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="National ID number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={admissionData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Contact number"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Phone className="w-6 h-6 text-blue-600" />
                  Emergency Contact
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={admissionData.emergencyContact.name}
                      onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                    <input
                      type="text"
                      value={admissionData.emergencyContact.relationship}
                      onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Spouse, Parent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={admissionData.emergencyContact.phone}
                      onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Emergency contact number"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Home Address</label>
                <input
                  type="text"
                  value={admissionData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Patient's home address"
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  Continue to Triage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Triage and Medical Information */}
        {step === 3 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Triage Assessment</h2>
              <p className="text-purple-100">Medical assessment and triage classification</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Triage Level */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  Triage Level *
                </h3>
                <div className="grid gap-3">
                  {[
                    { level: "1 - Resuscitation", desc: "Immediate life-threatening", color: "red" },
                    { level: "2 - Emergency", desc: "Potentially life-threatening", color: "orange" },
                    { level: "3 - Urgent", desc: "Urgent but stable", color: "yellow" },
                    { level: "4 - Less Urgent", desc: "Less urgent conditions", color: "green" },
                    { level: "5 - Non-Urgent", desc: "Non-urgent conditions", color: "blue" }
                  ].map((triage) => (
                    <button
                      key={triage.level}
                      type="button"
                      onClick={() => handleInputChange('triageLevel', triage.level)}
                      className={`p-4 border-2 rounded-xl font-semibold transition-all duration-200 text-left ${
                        admissionData.triageLevel === triage.level
                          ? getTriageColor(triage.level) + " shadow-lg transform scale-105"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold">{triage.level}</div>
                          <div className="text-sm opacity-75">{triage.desc}</div>
                        </div>
                        {triage.level.startsWith("1") && <Heart className="w-6 h-6" />}
                        {triage.level.startsWith("2") && <AlertTriangle className="w-6 h-6" />}
                        {triage.level.startsWith("3") && <Clock className="w-6 h-6" />}
                        {triage.level.startsWith("4") && <CheckCircle className="w-6 h-6" />}
                        {triage.level.startsWith("5") && <Activity className="w-6 h-6" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                  Medical Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Chief Complaint *</label>
                    <textarea
                      value={admissionData.chiefComplaint}
                      onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="3"
                      placeholder="Primary reason for visit..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Presenting Symptoms</label>
                    <textarea
                      value={admissionData.presentingSymptoms}
                      onChange={(e) => handleInputChange('presentingSymptoms', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="3"
                      placeholder="Current symptoms..."
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
                      <input
                        type="text"
                        value={admissionData.allergies}
                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Known allergies..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Medications</label>
                      <input
                        type="text"
                        value={admissionData.currentMedications}
                        onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Current medications..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Medical History</label>
                      <input
                        type="text"
                        value={admissionData.medicalHistory}
                        onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Relevant medical history..."
                      />
                    </div>
                  </div>

                  {/* Pain Scale */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Pain Scale (0-10)</label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={admissionData.painScale}
                        onChange={(e) => handleInputChange('painScale', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>No Pain (0)</span>
                        <span className="font-bold text-lg text-red-600">{admissionData.painScale}</span>
                        <span>Severe Pain (10)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-red-600" />
                  Vital Signs
                </h3>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[
                    { key: "bloodPressure", label: "Blood Pressure", icon: <Heart className="w-5 h-5" />, unit: "mmHg", placeholder: "120/80", color: "red" },
                    { key: "heartRate", label: "Heart Rate", icon: <Activity className="w-5 h-5" />, unit: "bpm", placeholder: "72", color: "pink" },
                    { key: "temperature", label: "Temperature", icon: <Thermometer className="w-5 h-5" />, unit: "°C", placeholder: "36.5", color: "orange" },
                    { key: "respiratoryRate", label: "Respiratory Rate", icon: <Activity className="w-5 h-5" />, unit: "/min", placeholder: "16", color: "blue" },
                    { key: "oxygenSaturation", label: "Oxygen Saturation", icon: <Droplets className="w-5 h-5" />, unit: "%", placeholder: "98", color: "cyan" },
                    { key: "weight", label: "Weight", icon: <User className="w-5 h-5" />, unit: "kg", placeholder: "70", color: "green" },
                    { key: "height", label: "Height", icon: <User className="w-5 h-5" />, unit: "cm", placeholder: "170", color: "purple" }
                  ].map((vital) => (
                    <div key={vital.key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {vital.label}
                      </label>
                      <div className="relative">
                        <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-${vital.color}-100 rounded-lg`}>
                          <span className={`text-${vital.color}-600`}>{vital.icon}</span>
                        </div>
                        <input
                          type="text"
                          placeholder={vital.placeholder}
                          value={admissionData.vitalSigns[vital.key]}
                          onChange={(e) => handleInputChange(`vitalSigns.${vital.key}`, e.target.value)}
                          className="w-full pl-16 pr-16 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          {vital.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* Triage Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Triage Notes</label>
                <textarea
                  value={admissionData.triageNotes}
                  onChange={(e) => handleInputChange('triageNotes', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="3"
                  placeholder="Additional triage observations and notes..."
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!admissionData.triageLevel || !admissionData.chiefComplaint}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review & Admit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review and Complete */}
        {step === 4 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Review & Complete Admission</h2>
              <p className="text-orange-100">Verify information and complete patient admission</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Admission Summary */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200">
                <h3 className="font-bold text-orange-900 mb-4 text-xl">Admission Summary</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-orange-700 font-medium">Patient Name</p>
                      <p className="text-orange-900 font-bold">{admissionData.firstName} {admissionData.lastName}</p>
                    </div>
                    <div>
                      <p className="text-orange-700 font-medium">Admission Type</p>
                      <p className="text-orange-900">{admissionData.admissionType}</p>
                    </div>
                    <div>
                      <p className="text-orange-700 font-medium">Chief Complaint</p>
                      <p className="text-orange-900">{admissionData.chiefComplaint}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-orange-700 font-medium">Triage Level</p>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getTriageColor(admissionData.triageLevel)}`}>
                        {admissionData.triageLevel}
                      </span>
                    </div>
                    <div>
                      <p className="text-orange-700 font-medium">Pain Scale</p>
                      <p className="text-orange-900">{admissionData.painScale}/10</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  Insurance Information (Optional)
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Insurance Provider</label>
                    <input
                      type="text"
                      value={admissionData.insurance.provider}
                      onChange={(e) => handleInputChange('insurance.provider', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Insurance company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Policy Number</label>
                    <input
                      type="text"
                      value={admissionData.insurance.policyNumber}
                      onChange={(e) => handleInputChange('insurance.policyNumber', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Policy number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Group Number</label>
                    <input
                      type="text"
                      value={admissionData.insurance.groupNumber}
                      onChange={(e) => handleInputChange('insurance.groupNumber', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Group number"
                    />
                  </div>
                </div>
              </div>



              {/* Final Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back to Triage
                </button>
                <button
                  onClick={submitAdmission}
                  disabled={saving || !admissionData.firstName || !admissionData.lastName || !admissionData.chiefComplaint || !admissionData.triageLevel}
                  className="flex-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-xl hover:shadow-orange-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Admitting Patient...
                    </div>
                  ) : (
                    <>
                      <Save className="w-5 h-5 inline mr-2" />
                      Complete Admission
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(EmergencyAdmission, ["receptionist", "nurse", "er", "doctor", "ward_manager"]);