"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";
import { Calculator, DollarSign, FileText, User, Calendar, Save, Plus, Minus } from "lucide-react";

function GenerateBill() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");
  const [selectedDiagnosisData, setSelectedDiagnosisData] = useState(null);
  const [billData, setBillData] = useState({
    consultationFee: 0,
    labTestsFee: 0,
    medicationFee: 0,
    otherCharges: 0
  });
  const [totalCost, setTotalCost] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [billData]);

  const fetchDiagnoses = async () => {
    const res = await fetch("/api/diagnosis/my");
    const data = await res.json();
    if (res.ok) {
      setDiagnoses(data.diagnoses);
    } else {
      setMessage("Failed to fetch diagnoses.");
    }
  };

  const handleDiagnosisSelect = (diagnosisId) => {
    setSelectedDiagnosis(diagnosisId);
    const diagnosis = diagnoses.find((d) => d._id === diagnosisId);
    setSelectedDiagnosisData(diagnosis);
  };

  const handleBillDataChange = (field, value) => {
    setBillData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const calculateTotal = () => {
    const total = Object.values(billData).reduce((sum, value) => sum + value, 0);
    setTotalCost(total);
  };

  const handleSubmit = async () => {
    if (!selectedDiagnosis || !billData.consultationFee) {
      setMessage("Please select a diagnosis and enter a consultation fee.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/bills/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        diagnosisId: selectedDiagnosis,
        ...billData
      }),
    });

    const data = await res.json();
    setLoading(false);
    setMessage(data.message || data.error);
    
    if (res.ok) {
      // Reset form
      setSelectedDiagnosis("");
      setSelectedDiagnosisData(null);
      setBillData({
        consultationFee: 0,
        labTestsFee: 0,
        medicationFee: 0,
        otherCharges: 0
      });
    }
  };

  const billItems = [
    { key: "consultationFee", label: "Consultation Fee", icon: <User className="w-5 h-5" />, color: "blue", required: true },
    { key: "labTestsFee", label: "Laboratory Tests", icon: <FileText className="w-5 h-5" />, color: "purple" },
    { key: "medicationFee", label: "Medication", icon: <Plus className="w-5 h-5" />, color: "green" },
    { key: "otherCharges", label: "Other Charges", icon: <Minus className="w-5 h-5" />, color: "orange" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Calculator className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Generate Bill</h1>
            <p className="text-gray-600 text-xl">Create detailed medical bills for patient services</p>
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Diagnosis Selection & Bill Items */}
          <div className="space-y-8">
            {/* Diagnosis Selection */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <FileText className="w-8 h-8" />
                  Select Diagnosis
                </h2>
                <p className="text-green-100">Choose the diagnosis to generate a bill for</p>
              </div>

              <div className="p-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Patient Diagnosis</label>
                <select 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-lg"
                  onChange={(e) => handleDiagnosisSelect(e.target.value)}
                  value={selectedDiagnosis}
                >
                  <option value="">-- Choose a diagnosis --</option>
                  {diagnoses.map((diag) => (
                    <option key={diag._id} value={diag._id}>
                      {diag.appointmentId
                        ? `${diag.appointmentId.patientId.name} | ${new Date(diag.appointmentId.date).toLocaleDateString()} | ${diag.appointmentId.timeSlot}`
                        : "Unknown Appointment"}
                    </option>
                  ))}
                </select>

                {selectedDiagnosisData && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200">
                    <h3 className="font-bold text-green-900 mb-4 text-lg">Selected Diagnosis</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-green-800"><strong>Patient:</strong> {selectedDiagnosisData.appointmentId?.patientId?.name}</p>
                      <p className="text-green-800"><strong>Diagnosis:</strong> {selectedDiagnosisData.diagnosis}</p>
                      <p className="text-green-800"><strong>Severity:</strong> {selectedDiagnosisData.severity}</p>
                      <p className="text-green-800"><strong>Date:</strong> {new Date(selectedDiagnosisData.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bill Items */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <DollarSign className="w-8 h-8" />
                  Bill Items
                </h2>
                <p className="text-blue-100">Enter the charges for each service</p>
              </div>

              <div className="p-8 space-y-6">
                {billItems.map((item) => (
                  <div key={item.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className={`p-1 rounded bg-${item.color}-100 text-${item.color}-600`}>
                        {item.icon}
                      </span>
                      {item.label} {item.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        placeholder="0.00"
                        value={billData[item.key] || ""}
                        onChange={(e) => handleBillDataChange(item.key, e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-lg"
                        min="0"
                        step="0.01"
                        required={item.required}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bill Summary & Total */}
          <div className="space-y-8">
            {/* Bill Summary */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <Calculator className="w-8 h-8" />
                  Bill Summary
                </h2>
                <p className="text-purple-100">Review the bill breakdown</p>
              </div>

              <div className="p-8">
                <div className="space-y-4 mb-8">
                  {billItems.map((item) => (
                    <div key={item.key} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className={`p-2 rounded-lg bg-${item.color}-100 text-${item.color}-600`}>
                          {item.icon}
                        </span>
                        <span className="font-medium text-gray-700">{item.label}</span>
                      </div>
                      <span className="font-bold text-lg text-gray-900">
                        R{billData[item.key].toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-gray-200 pt-6">
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl border-2 border-green-200">
                    <span className="text-2xl font-bold text-gray-900">Total Amount:</span>
                    <span className="text-4xl font-bold text-green-600">R{totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Bill Button */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedDiagnosis || !billData.consultationFee}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-xl hover:shadow-green-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating Bill...
                  </div>
                ) : (
                  <>
                    <Save className="w-6 h-6 inline mr-3" />
                    Generate Bill
                  </>
                )}
              </button>

              {totalCost > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-blue-800 text-center">
                    <strong>Total Bill Amount: R{totalCost.toLocaleString()}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(GenerateBill, ["doctor"]);