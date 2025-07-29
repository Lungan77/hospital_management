"use client";
import { useState } from "react";
import { Phone, MapPin, User, AlertTriangle, Clock, Send, Shield } from "lucide-react";

export default function EmergencyReport() {
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
    reportedBy: "Online"
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/emergency/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSubmitted(true);
        setMessage(`Emergency reported successfully. Incident Number: ${data.emergency.incidentNumber}`);
      } else {
        setMessage(data.error || "Failed to submit emergency report");
      }
    } catch (error) {
      setMessage("Error submitting emergency report");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center max-w-2xl">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Emergency Reported</h1>
          <p className="text-gray-600 text-lg mb-8">{message}</p>
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200 mb-8">
            <p className="text-green-800 font-semibold">
              Emergency services have been notified and will respond as quickly as possible.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            Report Another Emergency
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Emergency Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Emergency Report</h1>
            <p className="text-red-100 text-xl">Report medical emergencies and request immediate assistance</p>
            <div className="mt-6 flex items-center justify-center gap-4 text-red-100">
              <Phone className="w-5 h-5" />
              <span>For immediate emergencies, call 911</span>
            </div>
          </div>
        </div>

        {message && !submitted && (
          <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-2xl shadow-lg">
            <p className="text-red-700 font-semibold text-lg">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Emergency Type & Priority */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              Emergency Information
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
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Priority Level *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="Critical">Critical - Life Threatening</option>
                  <option value="High">High - Urgent</option>
                  <option value="Medium">Medium - Serious</option>
                  <option value="Low">Low - Non-urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Caller Information */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Phone className="w-8 h-8 text-blue-600" />
              Caller Information
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Your Name *</label>
                <input
                  type="text"
                  value={formData.callerName}
                  onChange={(e) => handleInputChange('callerName', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
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
                  placeholder="Your contact number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Relation to Patient</label>
                <input
                  type="text"
                  value={formData.callerRelation}
                  onChange={(e) => handleInputChange('callerRelation', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Self, Family, Friend"
                />
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <User className="w-8 h-8 text-green-600" />
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
                  placeholder="Patient's full name"
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">Address *</label>
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
                  placeholder="Nearby landmarks, building details, etc."
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
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
                  placeholder="Describe the patient's current condition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Chief Complaint</label>
                <textarea
                  value={formData.chiefComplaint}
                  onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="3"
                  placeholder="Primary symptoms or reason for emergency"
                />
              </div>
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
                  Submitting Emergency Report...
                </div>
              ) : (
                <>
                  <Send className="w-6 h-6 inline mr-3" />
                  Submit Emergency Report
                </>
              )}
            </button>
            <p className="text-center text-gray-600 mt-4 text-sm">
              By submitting this form, you confirm that this is a genuine emergency requiring immediate medical attention.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}