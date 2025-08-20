"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import withAuth from "@/hoc/withAuth";
import dynamic from "next/dynamic";
import VitalsForm from "@/components/VitalsForm";
import TreatmentForm from "@/components/TreatmentForm";
import FileUpload from "@/components/FileUpload";
import MedicalProtocols from "@/components/MedicalProtocols";
import { 
  Truck, 
  MapPin, 
  Clock, 
  User, 
  Activity, 
  Heart,
  FileText,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Phone,
  Play,
  Flag,
  Route,
  Signature,
  MapPin as LocationIcon
} from "lucide-react";

// Dynamic import for map component to avoid SSR issues
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
      <div className="text-center text-gray-600">
        <MapPin className="w-12 h-12 mx-auto mb-2" />
        <p>Loading map...</p>
      </div>
    </div>
  )
});

function ParamedicInterface() {
  const { data: session } = useSession();
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [medicalInfo, setMedicalInfo] = useState({
    symptoms: "",
    medicalHistory: "",
    allergies: "",
    currentMedications: ""
  });
  const [handoverData, setHandoverData] = useState({
    paramedicSummary: "",
    treatmentSummary: "",
    patientConditionOnArrival: "",
    handoverNotes: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [incidentCoordinates, setIncidentCoordinates] = useState(null);
  const [ambulanceCoordinates, setAmbulanceCoordinates] = useState(null);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [treatmentLoading, setTreatmentLoading] = useState(false);
  const [medicalLoading, setMedicalLoading] = useState(false);
  const [transportLoading, setTransportLoading] = useState(false);
  const [handoverLoading, setHandoverLoading] = useState(false);
  const [equipmentStatus, setEquipmentStatus] = useState({});
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [equipmentCheckComplete, setEquipmentCheckComplete] = useState(false);

  useEffect(() => {
    fetchCurrentAssignment();
    fetchEquipmentStatus();
    // Set up real-time updates
    const interval = setInterval(fetchCurrentAssignment, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate getting coordinates from address (in real app, use geocoding API)
    if (currentAssignment?.address) {
      // Mock coordinates for demonstration - in real app, geocode the address
      setIncidentCoordinates([-26.2041, 28.0473]); // Johannesburg coordinates as example
    }
    
    // Get ambulance location (current user location)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        setAmbulanceCoordinates([position.coords.latitude, position.coords.longitude]);
        
        // Update location on server
        try {
          const res = await fetch("/api/driver/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: `Emergency Response Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            })
          });
          
          if (res.ok) {
            console.log("Emergency paramedic location updated");
          }
        } catch (error) {
          console.error("Error updating location:", error);
        }
      }, (error) => {
        console.error("Geolocation error:", error);
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    }
  }, [currentAssignment]);

  const fetchCurrentAssignment = async () => {
    try {
      const res = await fetch("/api/emergency/paramedic/assignment");
      const data = await res.json();
      if (res.ok) {
        setCurrentAssignment(data.assignment);
      }
    } catch (error) {
      console.error("Error fetching assignment");
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipmentStatus = async () => {
    try {
      const res = await fetch("/api/ambulances/equipment/status");
      const data = await res.json();
      if (res.ok) {
        setEquipmentStatus(data.equipment || {});
        setEquipmentCheckComplete(data.checkComplete || false);
      }
    } catch (error) {
      console.error("Error fetching equipment status");
    }
  };

  const updateEquipmentStatus = async (equipmentName, status) => {
    setEquipmentLoading(true);
    try {
      const res = await fetch("/api/ambulances/equipment/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          equipmentName, 
          status,
          checkedBy: session?.user.id
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEquipmentStatus(prev => ({ ...prev, [equipmentName]: status }));
        setMessage(`${equipmentName} marked as ${status}`);
        
        // Check if all required equipment is operational
        const requiredEquipment = [
          "Defibrillator", "Oxygen Tank", "IV Supplies", "Medications", 
          "Airway Kit", "Trauma Kit", "Cardiac Monitor", "Suction Unit"
        ];
        
        const allOperational = requiredEquipment.every(eq => 
          equipmentStatus[eq] === "Operational" || (eq === equipmentName && status === "Operational")
        );
        
        if (allOperational) {
          setEquipmentCheckComplete(true);
          setMessage("All equipment checks complete - Ready for emergency response");
        }
      } else {
        setMessage(data.error || "Error updating equipment status");
      }
    } catch (error) {
      setMessage("Error updating equipment status");
    } finally {
      setEquipmentLoading(false);
    }
  };

  const acceptDispatch = async () => {
    try {
      const res = await fetch("/api/emergency/paramedic/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyId: currentAssignment._id }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchCurrentAssignment();
      }
    } catch (error) {
      setMessage("Error accepting dispatch");
    }
  };

  const updateStatus = async (status) => {
    try {
      const res = await fetch("/api/emergency/paramedic/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          emergencyId: currentAssignment._id, 
          status 
        }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchCurrentAssignment();
      }
    } catch (error) {
      setMessage("Error updating status");
    }
  };

  const recordVitals = async (vitalsData) => {
    // Only require essential vitals
    if (!vitalsData.bloodPressure || !vitalsData.heartRate || !vitalsData.temperature) {
      setMessage("Please fill in blood pressure, heart rate, and temperature");
      return;
    }

    setVitalsLoading(true);
    try {
      const res = await fetch("/api/emergency/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyId: currentAssignment._id,
          ...vitalsData
        }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchCurrentAssignment();
        setMessage("Vital signs recorded successfully");
      }
    } catch (error) {
      setMessage("Error recording vitals");
    } finally {
      setVitalsLoading(false);
    }
  };

  const recordTreatment = async (treatmentData) => {
    if (!treatmentData.treatmentGiven?.length && !treatmentData.medications?.filter(m => m.name).length) {
      setMessage("Please enter treatment details");
      return;
    }

    setTreatmentLoading(true);
    try {
      const res = await fetch("/api/emergency/treatment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyId: currentAssignment._id,
          treatment: treatmentData.treatmentGiven.join(", "),
          medication: treatmentData.medications.map(m => `${m.name} ${m.dosage} ${m.route}`).join("; "),
          dosage: treatmentData.medications.map(m => m.dosage).join(", "),
          route: treatmentData.medications.map(m => m.route).join(", "),
          response: treatmentData.patientResponse
        }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchCurrentAssignment();
        setMessage("Treatment recorded successfully");
      }
    } catch (error) {
      setMessage("Error recording treatment");
    } finally {
      setTreatmentLoading(false);
    }
  };

  const updateMedicalInfo = async () => {
    setMedicalLoading(true);
    try {
      const res = await fetch("/api/emergency/medical-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyId: currentAssignment._id,
          ...medicalInfo
        }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchCurrentAssignment();
        setMessage("Medical information updated successfully");
      }
    } catch (error) {
      setMessage("Error updating medical information");
    } finally {
      setMedicalLoading(false);
    }
  };

  const beginTransport = async () => {
    setTransportLoading(true);
    try {
      const res = await fetch("/api/emergency/transport/begin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyId: currentAssignment._id }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchCurrentAssignment();
        setMessage("Transport begun successfully");
      }
    } catch (error) {
      setMessage("Error beginning transport");
    } finally {
      setTransportLoading(false);
    }
  };

  const completeHandover = async () => {
    if (!handoverData.paramedicSummary || !handoverData.patientConditionOnArrival) {
      setMessage("Please fill in required handover information");
      return;
    }

    setHandoverLoading(true);
    try {
      const res = await fetch("/api/emergency/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyId: currentAssignment._id,
          ...handoverData
        }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      
      if (res.ok) {
        fetchCurrentAssignment();
        setMessage("Handover completed successfully - Emergency response complete");
      }
    } catch (error) {
      setMessage("Error completing handover");
    } finally {
      setHandoverLoading(false);
    }
  };

  const handleVitalChange = (field, value) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleTreatmentChange = (field, value) => {
    setTreatment(prev => ({ ...prev, [field]: value }));
  };

  const handleMedicalInfoChange = (field, value) => {
    setMedicalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleHandoverChange = (field, value) => {
    setHandoverData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUploadComplete = (results) => {
    setMessage(`${results.filter(r => r.success).length} files uploaded successfully`);
    fetchCurrentAssignment();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading paramedic interface...</p>
        </div>
      </div>
    );
  }

  if (!currentAssignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center max-w-2xl">
          <Truck className="w-24 h-24 text-gray-300 mx-auto mb-8" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">No Active Assignment</h1>
          <p className="text-gray-600 text-lg mb-8">
            You currently have no emergency assignments. Please wait for dispatch or contact your supervisor.
          </p>
          <button
            onClick={fetchCurrentAssignment}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
    { id: "navigation", label: "Navigation", icon: <Navigation className="w-4 h-4" /> },
    { id: "equipment", label: "Equipment Check", icon: <CheckCircle className="w-4 h-4" /> },
    { id: "protocols", label: "Medical Protocols", icon: <FileText className="w-4 h-4" /> },
    { id: "vitals", label: "Vitals", icon: <Heart className="w-4 h-4" /> },
    { id: "treatment", label: "Treatment", icon: <FileText className="w-4 h-4" /> },
    { id: "medical", label: "Medical Info", icon: <FileText className="w-4 h-4" /> },
    { id: "transport", label: "Transport", icon: <Route className="w-4 h-4" /> },
    { id: "handover", label: "Handover", icon: <Flag className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Paramedic Interface</h1>
                <p className="text-gray-600 text-xl">Emergency Response - {session?.user.name}</p>
              </div>
            </div>
            
            {/* Current Assignment Info */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-red-900 mb-2">
                    {currentAssignment.incidentNumber}
                  </h2>
                  <div className="flex items-center gap-4 text-red-700">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {currentAssignment.priority}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-4 h-4" />
                      {currentAssignment.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-600 font-semibold">Response Time</p>
                  <p className="text-2xl font-bold text-red-800">
                    {currentAssignment.dispatchedAt ? 
                      Math.floor((new Date() - new Date(currentAssignment.dispatchedAt)) / 60000) : 0} min
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl shadow-lg">
            <p className="text-blue-700 font-semibold text-lg">{message}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Overview</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-4">Patient Information</h3>
                    <div className="space-y-2 text-blue-800">
                      <p><strong>Name:</strong> {currentAssignment.patientName || "Unknown"}</p>
                      <p><strong>Age:</strong> {currentAssignment.patientAge ? `${currentAssignment.patientAge} years` : "Unknown"}</p>
                      <p><strong>Gender:</strong> {currentAssignment.patientGender || "Unknown"}</p>
                      <p><strong>Condition:</strong> {currentAssignment.patientCondition}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
                    <h3 className="font-bold text-green-900 mb-4">Location</h3>
                    <div className="space-y-2 text-green-800">
                      <p><strong>Address:</strong> {currentAssignment.address}</p>
                      {currentAssignment.landmarks && (
                        <p><strong>Landmarks:</strong> {currentAssignment.landmarks}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-purple-50 rounded-2xl border border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-4">Caller Information</h3>
                    <div className="space-y-2 text-purple-800">
                      <p><strong>Name:</strong> {currentAssignment.callerName}</p>
                      <p><strong>Phone:</strong> {currentAssignment.callerPhone}</p>
                      {currentAssignment.callerRelation && (
                        <p><strong>Relation:</strong> {currentAssignment.callerRelation}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Actions */}
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Status Actions</h3>
                    <div className="space-y-3">
                      {currentAssignment.status === "Dispatched" && (
                        <button
                          onClick={acceptDispatch}
                          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Accept Dispatch
                        </button>
                      )}
                      
                      {["En Route", "On Scene", "Transporting"].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(status)}
                          disabled={currentAssignment.status === status}
                          className={`w-full p-3 rounded-xl font-semibold transition-all duration-200 ${
                            currentAssignment.status === status
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tab */}
          {activeTab === "navigation" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <LocationIcon className="w-8 h-8 text-blue-600" />
                Navigation to Incident
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-4">Destination</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <LocationIcon className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <p className="font-semibold text-blue-900">Incident Location</p>
                          <p className="text-blue-800">{currentAssignment.address}</p>
                          {currentAssignment.landmarks && (
                            <p className="text-blue-700 text-sm mt-1">
                              <strong>Landmarks:</strong> {currentAssignment.landmarks}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        const address = encodeURIComponent(currentAssignment.address);
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${address}&travelmode=driving`;
                        window.open(url, '_blank');
                        setMessage("Navigation opened in Google Maps");
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-3"
                    >
                      <Navigation className="w-6 h-6" />
                      Open Google Maps Navigation
                    </button>
                    
                    <button
                      onClick={() => updateStatus("On Scene")}
                      disabled={currentAssignment.status === "On Scene" || currentAssignment.status === "Transporting"}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Flag className="w-6 h-6" />
                      Mark &quot;On Scene&quot;
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Live Map</h3>
                  <LiveMap
                    incidentLocation={incidentCoordinates}
                    ambulanceLocation={ambulanceCoordinates}
                    emergency={currentAssignment}
                    onNavigate={() => setMessage("Navigation opened in new tab")}
                  />
                  <p className="text-sm text-gray-600 text-center">
                    Red marker: Incident location | Blue marker: Your location
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Medical Protocols Tab */}
          {activeTab === "protocols" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                Medical Protocols & Guidelines
              </h2>
              
              <MedicalProtocols />
            </div>
          )}

          {/* Vitals Tab */}
          {activeTab === "vitals" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Heart className="w-8 h-8 text-pink-600" />
                Record Vital Signs
              </h2>
              <VitalsForm onSubmit={recordVitals} loading={vitalsLoading} />
            </div>
          )}

          {/* Treatment Tab */}
          {activeTab === "treatment" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-600" />
                Record Treatment
              </h2>
              <TreatmentForm onSubmit={recordTreatment} loading={treatmentLoading} />
            </div>
          )}

          {/* Medical Info Tab */}
          {activeTab === "medical" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                Medical Information & Documentation
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms</label>
                    <textarea
                      placeholder="Current symptoms observed..."
                      value={medicalInfo.symptoms}
                      onChange={(e) => handleMedicalInfoChange('symptoms', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medical History</label>
                    <textarea
                      placeholder="Known medical history..."
                      value={medicalInfo.medicalHistory}
                      onChange={(e) => handleMedicalInfoChange('medicalHistory', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="3"
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
                    <textarea
                      placeholder="Known allergies..."
                      value={medicalInfo.allergies}
                      onChange={(e) => handleMedicalInfoChange('allergies', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Medications</label>
                    <textarea
                      placeholder="Current medications..."
                      value={medicalInfo.currentMedications}
                      onChange={(e) => handleMedicalInfoChange('currentMedications', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <FileUpload 
                emergencyId={currentAssignment._id}
                onUploadComplete={handleFileUploadComplete}
              />
              
              <button
                onClick={updateMedicalInfo}
                disabled={medicalLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {medicalLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  "Save Medical Information"
                )}
              </button>
            </div>
          )}

          {/* Transport Tab */}
          {activeTab === "transport" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Route className="w-8 h-8 text-indigo-600" />
                Patient Transport
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-200">
                    <h3 className="font-bold text-indigo-900 mb-4">Transport Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-indigo-800">Current Status:</span>
                        <span className="font-semibold text-indigo-900">{currentAssignment.status}</span>
                      </div>
                      
                      {currentAssignment.transportProgress?.started && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-indigo-800">Transport Started:</span>
                            <span className="font-semibold text-indigo-900">
                              {new Date(currentAssignment.transportProgress.startTime).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-indigo-800">ETA:</span>
                            <span className="font-semibold text-indigo-900">
                              {currentAssignment.transportProgress.estimatedArrival ? 
                                new Date(currentAssignment.transportProgress.estimatedArrival).toLocaleTimeString() : 
                                "Calculating..."
                              }
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {currentAssignment.status === "On Scene" && (
                    <button
                      onClick={beginTransport}
                      disabled={transportLoading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {transportLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Starting Transport...
                        </>
                      ) : (
                        <>
                          <Play className="w-6 h-6" />
                          Begin Transport
                        </>
                      )}
                    </button>
                  )}
                  
                  {currentAssignment.status === "Transporting" && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Transport in Progress</span>
                      </div>
                      <p className="text-green-600 text-sm">
                        Patient is being transported to hospital. Complete handover when you arrive.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Progress Tracking</h3>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                        style={{ 
                          width: currentAssignment.status === "Completed" ? "100%" :
                                 currentAssignment.status === "Transporting" ? "75%" :
                                 currentAssignment.status === "On Scene" ? "50%" :
                                 currentAssignment.status === "En Route" ? "25%" : "0%"
                        }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                          ["En Route", "On Scene", "Transporting", "Completed"].includes(currentAssignment.status) ? "bg-indigo-600" : "bg-gray-300"
                        }`}></div>
                        <span>En Route</span>
                      </div>
                      <div className="text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                          ["On Scene", "Transporting", "Completed"].includes(currentAssignment.status) ? "bg-indigo-600" : "bg-gray-300"
                        }`}></div>
                        <span>On Scene</span>
                      </div>
                      <div className="text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                          ["Transporting", "Completed"].includes(currentAssignment.status) ? "bg-indigo-600" : "bg-gray-300"
                        }`}></div>
                        <span>Transport</span>
                      </div>
                      <div className="text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                          currentAssignment.status === "Completed" ? "bg-indigo-600" : "bg-gray-300"
                        }`}></div>
                        <span>Hospital</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Handover Tab */}
          {activeTab === "handover" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Flag className="w-8 h-8 text-orange-600" />
                Patient Handover
              </h2>

              {currentAssignment.status !== "Transporting" && (
                <div className="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-2xl">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="text-yellow-800 font-semibold">Transport Not Started</p>
                      <p className="text-yellow-700 text-sm">You must begin transport before completing handover.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Paramedic Summary *</label>
                  <textarea
                    placeholder="Summary of response and care provided..."
                    value={handoverData.paramedicSummary}
                    onChange={(e) => handleHandoverChange('paramedicSummary', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="4"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Treatment Summary</label>
                  <textarea
                    placeholder="Summary of treatments administered..."
                    value={handoverData.treatmentSummary}
                    onChange={(e) => handleHandoverChange('treatmentSummary', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Condition on Arrival *</label>
                  <textarea
                    placeholder="Current patient condition and status..."
                    value={handoverData.patientConditionOnArrival}
                    onChange={(e) => handleHandoverChange('patientConditionOnArrival', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Handover Notes</label>
                  <textarea
                    placeholder="Any additional notes for receiving staff..."
                    value={handoverData.handoverNotes}
                    onChange={(e) => handleHandoverChange('handoverNotes', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="p-6 bg-orange-50 rounded-2xl border border-orange-200 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Signature className="w-6 h-6 text-orange-600" />
                  <h3 className="font-bold text-orange-900">Digital Handover</h3>
                </div>
                <p className="text-orange-800 text-sm">
                  By completing this handover, you confirm that all patient care has been transferred to the receiving medical staff.
                  This action will mark the emergency response as complete.
                </p>
              </div>
              
              <button
                onClick={completeHandover}
                disabled={currentAssignment.status !== "Transporting"}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {handoverLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Completing Handover...
                  </>
                ) : (
                  <>
                    <Flag className="w-6 h-6" />
                    Complete Handover
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {currentAssignment.status === "En Route" && (
              <button
                onClick={() => updateStatus("On Scene")}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Mark &quot;On Scene&quot;
              </button>
            )}
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Phone className="w-4 h-4" />
              Contact Dispatch
            </button>
          </div>
        </div>

        {/* Previous Records */}
        {(currentAssignment.vitalSigns?.length > 0 || currentAssignment.treatments?.length > 0) && (
          <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Previous Records
              </h2>
            </div>
            <div className="p-6">
              {currentAssignment.vitalSigns?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Vital Signs History</h3>
                  <div className="space-y-3">
                    {currentAssignment.vitalSigns.map((vital, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-gray-500">
                            {new Date(vital.timestamp).toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-600">
                            Pain: {vital.painScale}/10
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <span>BP: {vital.bloodPressure}</span>
                          <span>HR: {vital.heartRate}</span>
                          <span>SpO2: {vital.oxygenSaturation}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentAssignment.treatments?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Treatment History</h3>
                  <div className="space-y-3">
                    {currentAssignment.treatments.map((treat, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{treat.treatment}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(treat.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {treat.medication && (
                          <p className="text-sm text-gray-600">
                            {treat.medication} - {treat.dosage} ({treat.route})
                          </p>
                        )}
                        {treat.response && (
                          <p className="text-sm text-gray-700 mt-2">Response: {treat.response}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ParamedicInterface, ["nurse", "doctor", "dispatcher", "paramedic"]);