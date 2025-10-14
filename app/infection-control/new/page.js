"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Shield,
  AlertTriangle,
  Save,
  X,
  Users,
  CheckCircle
} from "lucide-react";

function NewInfectionControlCase() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    patientAdmissionId: "",
    infectionType: "",
    infectionCategory: "Suspected",
    isolationType: "Standard",
    isolationRequired: true,
    specialWardRequired: false,
    riskLevel: "Medium",
    symptoms: "",
    notes: "",
    alerts: ""
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const symptomsArray = formData.symptoms ? formData.symptoms.split(",").map(s => s.trim()).filter(s => s) : [];
      const alertsArray = formData.alerts ? formData.alerts.split(",").map(a => a.trim()).filter(a => a) : [];

      const res = await fetch("/api/infection-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          symptoms: symptomsArray,
          alerts: alertsArray
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Infection control case created successfully!");
        setTimeout(() => {
          router.push("/infection-control/dashboard");
        }, 2000);
      } else {
        setMessage(data.error || "Error creating case");
      }
    } catch (error) {
      setMessage("Error creating case");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.admissionNumber}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">New Infection Control Case</h1>
                <p className="text-gray-600 text-lg">Identify and manage infection risks</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/infection-control/dashboard")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-8 p-6 rounded-2xl border-l-4 ${
            message.includes("successfully")
              ? "bg-green-50 border-green-500 text-green-700"
              : "bg-red-50 border-red-500 text-red-700"
          } shadow-lg flex items-center gap-4`}>
            {message.includes("successfully") ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
            <p className="font-semibold text-lg">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Select Patient *</label>
            <input
              type="text"
              placeholder="Search by name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
            />
            <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    onClick={() => setFormData({ ...formData, patientAdmissionId: patient._id })}
                    className={`p-4 cursor-pointer hover:bg-red-50 transition-colors border-b border-gray-100 ${
                      formData.patientAdmissionId === patient._id ? "bg-red-100" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{patient.firstName} {patient.lastName}</p>
                        <p className="text-sm text-gray-600">{patient.admissionNumber}</p>
                      </div>
                      {formData.patientAdmissionId === patient._id && (
                        <CheckCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No patients found</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Infection Type *</label>
              <select
                value={formData.infectionType}
                onChange={(e) => setFormData({ ...formData, infectionType: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select infection type</option>
                <option value="MRSA">MRSA</option>
                <option value="C. difficile">C. difficile</option>
                <option value="VRE">VRE</option>
                <option value="COVID-19">COVID-19</option>
                <option value="Tuberculosis">Tuberculosis</option>
                <option value="Influenza">Influenza</option>
                <option value="Norovirus">Norovirus</option>
                <option value="Hepatitis">Hepatitis</option>
                <option value="HIV">HIV</option>
                <option value="Multi-Drug Resistant">Multi-Drug Resistant</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Infection Category *</label>
              <select
                value={formData.infectionCategory}
                onChange={(e) => setFormData({ ...formData, infectionCategory: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="Suspected">Suspected</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Hospital-Acquired">Hospital-Acquired</option>
                <option value="Community-Acquired">Community-Acquired</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Isolation Type *</label>
              <select
                value={formData.isolationType}
                onChange={(e) => setFormData({ ...formData, isolationType: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="Standard">Standard</option>
                <option value="Contact">Contact</option>
                <option value="Droplet">Droplet</option>
                <option value="Airborne">Airborne</option>
                <option value="Protective">Protective</option>
                <option value="Combined">Combined</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Risk Level *</label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                checked={formData.isolationRequired}
                onChange={(e) => setFormData({ ...formData, isolationRequired: e.target.checked })}
                className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
              />
              <label className="text-sm font-bold text-gray-700">Isolation Required</label>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                checked={formData.specialWardRequired}
                onChange={(e) => setFormData({ ...formData, specialWardRequired: e.target.checked })}
                className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
              />
              <label className="text-sm font-bold text-gray-700">Special Ward Required</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Symptoms (comma-separated)</label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows="3"
              placeholder="e.g., Fever, Cough, Difficulty breathing"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Alerts (comma-separated)</label>
            <textarea
              value={formData.alerts}
              onChange={(e) => setFormData({ ...formData, alerts: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows="2"
              placeholder="e.g., High transmission risk, Contact tracing required"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows="4"
              placeholder="Additional information about the case..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !formData.patientAdmissionId || !formData.infectionType}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Case...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Infection Control Case
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default withAuth(NewInfectionControlCase, ["doctor", "nurse", "ward_manager", "admin"]);
