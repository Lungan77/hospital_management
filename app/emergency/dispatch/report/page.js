"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import { 
  Phone, 
  MapPin, 
  User, 
  AlertTriangle, 
  Clock, 
  Send, 
  Shield,
  Heart,
  Activity,
  FileText,
  Calendar,
  Radio,
  Navigation,
  Save
} from "lucide-react";

function DispatcherEmergencyReport() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: "",
    priority: "Medium",
    callerName: "",
    callerPhone: "",
    callerRelation: "",
    patientName: "",
    patientAge: "",
    patientGender: "",
    patientCondition: "",
    address: "",
    landmarks: "",
    chiefComplaint: "",
    symptoms: "",
    medicalHistory: "",
    allergies: "",
    currentMedications: "",
    reportedBy: "Phone",
    dispatcherNotes: "",
    weatherConditions: "",
    trafficConditions: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [incidentNumber, setIncidentNumber] = useState("");

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate required fields
    if (!formData.type || !formData.callerName || !formData.callerPhone || !formData.address || !formData.patientCondition) {
      setMessage("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/emergency/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSubmitted(true);
        setIncidentNumber(data.emergency.incidentNumber);
        setMessage(`Emergency logged successfully. Incident Number: ${data.emergency.incidentNumber}`);
        
        // Redirect to dispatch dashboard after 3 seconds
        setTimeout(() => {
          router.push("/emergency/dispatch");
        }, 3000);
      } else {
        setMessage(data.error || "Failed to log emergency report");
      }
    } catch (error) {
      setMessage("Error logging emergency report");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      "Critical": "from-red-600 to-red-700",
      "High": "from-orange-600 to-orange-700", 
      "Medium": "from-yellow-600 to-yellow-700",
      "Low": "from-green-600 to-green-700"
    };
    return colors[priority] || "from-gray-600 to-gray-700";
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center max-w-2xl">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Emergency Logged</h1>
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200 mb-8">
            <p className="text-green-800 font-semibold text-lg mb-2">
              Incident Number: {incidentNumber}
            </p>
            <p className="text-green-700">
              Emergency has been logged and is ready for dispatch. Redirecting to dispatch dashboard...
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/emergency/dispatch")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              Go to Dispatch
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
            >
              Log Another Emergency
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Emergency Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <Radio className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2">Emergency Report</h1>
                <p className="text-red-100 text-xl">Dispatcher 911 Call Logging System</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">911</div>
                <div className="text-sm text-red-100">Emergency Line</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-red-100">Dispatch Center</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">Live</div>
                <div className="text-sm text-red-100">Call Logging</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">GPS</div>
                <div className="text-sm text-red-100">Location Ready</div>
              </div>
            </div>
          </div>
        </div>

        {message && !submitted && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 shadow-lg ${
            message.includes("successfully") 
              ? "bg-green-50 border-green-500 text-green-700" 
              : "bg-red-50 border-red-500 text-red-700"
          }`}>
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

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Call Information */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Phone className="w-8 h-8 text-red-600" />
              911 Call Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Emergency Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select Emergency Type</option>
                  <option value="Medical">Medical Emergency</option>
                  <option value="Trauma">Trauma/Injury</option>
                  <option value="Cardiac">Cardiac Emergency</option>
                  <option value="Respiratory">Respiratory Emergency</option>
                  <option value="Psychiatric">Psychiatric Emergency</option>
                  <option value="Overdose">Drug Overdose</option>
                  <option value="Stroke">Stroke/Neurological</option>
                  <option value="Obstetric">Obstetric Emergency</option>
                  <option value="Pediatric">Pediatric Emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Priority Level *</label>
                <div className="grid grid-cols-4 gap-2">
                  {["Critical", "High", "Medium", "Low"].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => handleInputChange('priority', priority)}
                      className={`p-3 rounded-xl font-semibold transition-all duration-200 ${
                        formData.priority === priority
                          ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white shadow-lg transform scale-105`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {priority === "Critical" && <Heart className="w-4 h-4 mx-auto mb-1" />}
                      {priority === "High" && <AlertTriangle className="w-4 h-4 mx-auto mb-1" />}
                      {priority === "Medium" && <Activity className="w-4 h-4 mx-auto mb-1" />}
                      {priority === "Low" && <Clock className="w-4 h-4 mx-auto mb-1" />}
                      <div className="text-xs">{priority}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Caller Information */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              Caller Information
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Caller Name *</label>
                <input
                  type="text"
                  value={formData.callerName}
                  onChange={(e) => handleInputChange('callerName', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Full name of caller"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.callerPhone}
                  onChange={(e) => handleInputChange('callerPhone', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Caller's contact number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Relation to Patient</label>
                <select
                  value={formData.callerRelation}
                  onChange={(e) => handleInputChange('callerRelation', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Relation</option>
                  <option value="Self">Self</option>
                  <option value="Family Member">Family Member</option>
                  <option value="Friend">Friend</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Bystander">Bystander</option>
                  <option value="Healthcare Provider">Healthcare Provider</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Heart className="w-8 h-8 text-green-600" />
              Patient Information
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Patient Name</label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Patient's full name (if known)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Age</label>
                <input
                  type="number"
                  value={formData.patientAge}
                  onChange={(e) => handleInputChange('patientAge', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Patient's age"
                  min="0"
                  max="120"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Gender</label>
                <select
                  value={formData.patientGender}
                  onChange={(e) => handleInputChange('patientGender', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <MapPin className="w-8 h-8 text-purple-600" />
              Location Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Emergency Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Full address where emergency is occurring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Landmarks/Additional Directions</label>
                <input
                  type="text"
                  value={formData.landmarks}
                  onChange={(e) => handleInputChange('landmarks', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nearby landmarks, building details, apartment number, etc."
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Activity className="w-8 h-8 text-orange-600" />
              Medical Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Patient Condition *</label>
                <textarea
                  value={formData.patientCondition}
                  onChange={(e) => handleInputChange('patientCondition', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="3"
                  placeholder="Describe the patient's current condition as reported by caller"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Chief Complaint</label>
                <textarea
                  value={formData.chiefComplaint}
                  onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="2"
                  placeholder="Primary symptoms or reason for emergency call"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Current Symptoms</label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) => handleInputChange('symptoms', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="3"
                    placeholder="Detailed symptoms as described by caller"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Medical History</label>
                  <textarea
                    value={formData.medicalHistory}
                    onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="3"
                    placeholder="Known medical conditions, surgeries, etc."
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Known Allergies</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Drug allergies, food allergies, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Current Medications</label>
                  <input
                    type="text"
                    value={formData.currentMedications}
                    onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Current medications patient is taking"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dispatch Information */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Radio className="w-8 h-8 text-blue-600" />
              Dispatch Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Call Received Via</label>
                <select
                  value={formData.reportedBy}
                  onChange={(e) => handleInputChange('reportedBy', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Phone">Phone (911)</option>
                  <option value="Radio">Radio</option>
                  <option value="Online">Online Report</option>
                  <option value="Walk-in">Walk-in</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Weather Conditions</label>
                <select
                  value={formData.weatherConditions}
                  onChange={(e) => handleInputChange('weatherConditions', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Weather</option>
                  <option value="Clear">Clear</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Rain">Rain</option>
                  <option value="Heavy Rain">Heavy Rain</option>
                  <option value="Snow">Snow</option>
                  <option value="Fog">Fog</option>
                  <option value="Wind">High Wind</option>
                  <option value="Storm">Storm</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Traffic Conditions</label>
                <select
                  value={formData.trafficConditions}
                  onChange={(e) => handleInputChange('trafficConditions', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Traffic</option>
                  <option value="Light">Light Traffic</option>
                  <option value="Moderate">Moderate Traffic</option>
                  <option value="Heavy">Heavy Traffic</option>
                  <option value="Congested">Congested</option>
                  <option value="Accident">Traffic Accident</option>
                  <option value="Construction">Construction Zone</option>
                  <option value="Road Closure">Road Closure</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dispatcher Notes */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-600" />
              Dispatcher Notes & Actions
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Dispatcher Notes</label>
                <textarea
                  value={formData.dispatcherNotes}
                  onChange={(e) => handleInputChange('dispatcherNotes', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="Additional notes, instructions given to caller, pre-arrival instructions, etc."
                />
              </div>
              
              {/* Call Summary */}
              {(formData.type || formData.priority || formData.callerName) && (
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-4 text-lg">Call Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700"><strong>Emergency Type:</strong> {formData.type || "Not specified"}</p>
                      <p className="text-blue-700"><strong>Priority:</strong> {formData.priority}</p>
                      <p className="text-blue-700"><strong>Caller:</strong> {formData.callerName || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-blue-700"><strong>Patient:</strong> {formData.patientName || "Unknown"}</p>
                      <p className="text-blue-700"><strong>Location:</strong> {formData.address || "Not provided"}</p>
                      <p className="text-blue-700"><strong>Call Time:</strong> {new Date().toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-8 bg-gradient-to-r from-red-50 to-orange-50 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-6 rounded-2xl font-bold text-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-xl hover:shadow-red-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging Emergency Report...
                </div>
              ) : (
                <>
                  <Save className="w-6 h-6 inline mr-3" />
                  Log Emergency & Prepare for Dispatch
                </>
              )}
            </button>
            <p className="text-center text-gray-600 mt-4 text-sm">
              Emergency will be logged and made available for ambulance dispatch
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(DispatcherEmergencyReport, ["dispatcher", "admin", "receptionist"]);