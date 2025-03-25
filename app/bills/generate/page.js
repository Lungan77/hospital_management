"use client";
import { useEffect, useState } from "react";
import withAuth from "@/hoc/withAuth";

function GenerateBill() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [consultationFee, setConsultationFee] = useState(0);
  const [labTestsFee, setLabTestsFee] = useState(0);
  const [medicationFee, setMedicationFee] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDiagnoses();
  }, []);

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
    if (diagnosis) {
      setPatientId(diagnosis.appointmentId.patientId);
      setDoctorId(diagnosis.doctorId); // ✅ Automatically set doctorId
    }
  };

  const calculateTotal = () => {
    setTotalCost(parseFloat(consultationFee) + parseFloat(labTestsFee) + parseFloat(medicationFee) + parseFloat(otherCharges));
  };

  const handleSubmit = async () => {
    if (!selectedDiagnosis || !consultationFee) {
      setMessage("Please select a diagnosis and enter a consultation fee.");
      return;
    }

    const res = await fetch("/api/bills/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        doctorId,
        diagnosisId: selectedDiagnosis,
        consultationFee,
        labTestsFee,
        medicationFee,
        otherCharges,
      }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center">Generate Bill</h1>
      {message && <p className="mt-2 text-red-500">{message}</p>}

      {/* ✅ Diagnosis Selection */}
      <label className="block mt-4">Select Diagnosis</label>
      <select className="p-2 border w-full" onChange={(e) => handleDiagnosisSelect(e.target.value)}>
        <option value="">-- Choose a diagnosis --</option>
        {diagnoses.map((diag) => (
          <option key={diag._id} value={diag._id}>
            {diag.appointmentId
                ? `${diag.appointmentId.patientId.name} | ${new Date(diag.appointmentId.date).toLocaleDateString()} | ${diag.appointmentId.timeSlot}`
                : "Unknown Appointment"}
          </option>
        ))}
      </select>

      <input type="number" placeholder="Consultation Fee" className="p-2 border w-full mt-4" onChange={(e) => setConsultationFee(e.target.value)} onBlur={calculateTotal} />
      <input type="number" placeholder="Lab Tests Fee" className="p-2 border w-full mt-4" onChange={(e) => setLabTestsFee(e.target.value)} onBlur={calculateTotal} />
      <input type="number" placeholder="Medication Fee" className="p-2 border w-full mt-4" onChange={(e) => setMedicationFee(e.target.value)} onBlur={calculateTotal} />
      <input type="number" placeholder="Other Charges" className="p-2 border w-full mt-4" onChange={(e) => setOtherCharges(e.target.value)} onBlur={calculateTotal} />

      <p className="mt-4 font-bold text-lg">Total Cost: R{totalCost}</p>

      <button onClick={handleSubmit} className="mt-6 p-2 bg-blue-600 text-white w-full rounded-lg hover:bg-blue-700">
        Generate Bill
      </button>
    </div>
  );
}

export default withAuth(GenerateBill, ["doctor"]);
