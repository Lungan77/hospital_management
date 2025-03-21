"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import withAuth from "@/hoc/withAuth";

function AddPrescription() {
  const searchParams = useSearchParams();
  const diagnosisId = searchParams.get("diagnosisId");

  const [medications, setMedications] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [message, setMessage] = useState("");

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const updateMedication = (index, field, value) => {
    const updatedMeds = [...medications];
    updatedMeds[index][field] = value;
    setMedications(updatedMeds);
  };

  const submitPrescription = async () => {
    if (!medications.length) {
      setMessage("Please add at least one medication.");
      return;
    }

    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diagnosisId, medications, additionalNotes }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Add Prescription</h1>
      {message && <p className="mt-2 text-red-500">{message}</p>}

      {medications.map((med, index) => (
        <div key={index} className="mt-4 p-2 border rounded-lg">
          <input type="text" placeholder="Medication Name" className="p-2 border w-full" onChange={(e) => updateMedication(index, "name", e.target.value)} />
          <input type="text" placeholder="Dosage" className="p-2 border w-full mt-2" onChange={(e) => updateMedication(index, "dosage", e.target.value)} />
          <input type="text" placeholder="Frequency" className="p-2 border w-full mt-2" onChange={(e) => updateMedication(index, "frequency", e.target.value)} />
          <input type="text" placeholder="Duration" className="p-2 border w-full mt-2" onChange={(e) => updateMedication(index, "duration", e.target.value)} />
        </div>
      ))}

      <button onClick={addMedication} className="mt-4 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Add Medication</button>
      <button onClick={submitPrescription} className="mt-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save Prescription</button>
    </div>
  );
}

export default withAuth(AddPrescription, ["doctor"]);
