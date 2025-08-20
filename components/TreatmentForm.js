"use client";
import { useState } from "react";
import { Pill, Syringe, Bandage, Stethoscope, Plus, Minus } from "lucide-react";

export default function TreatmentForm({ onSubmit, loading }) {
  const [treatment, setTreatment] = useState({
    treatmentGiven: [],
    medications: [],
    procedures: [],
    patientResponse: "",
    additionalNotes: ""
  });

  const commonTreatments = [
    "Oxygen Administration",
    "IV Access Established",
    "Cardiac Monitoring",
    "Spinal Immobilization",
    "Wound Care",
    "Splinting",
    "CPR",
    "Defibrillation",
    "Airway Management",
    "Bleeding Control"
  ];

  const commonMedications = [
    { name: "Epinephrine", routes: ["IV", "IM", "Sublingual"] },
    { name: "Nitroglycerin", routes: ["Sublingual", "IV"] },
    { name: "Aspirin", routes: ["Oral"] },
    { name: "Morphine", routes: ["IV", "IM"] },
    { name: "Albuterol", routes: ["Inhalation"] },
    { name: "Atropine", routes: ["IV"] },
    { name: "Dextrose", routes: ["IV"] },
    { name: "Naloxone", routes: ["IV", "IM", "Intranasal"] }
  ];

  const handleTreatmentToggle = (treatment) => {
    setTreatment(prev => ({
      ...prev,
      treatmentGiven: prev.treatmentGiven.includes(treatment)
        ? prev.treatmentGiven.filter(t => t !== treatment)
        : [...prev.treatmentGiven, treatment]
    }));
  };

  const addMedication = () => {
    setTreatment(prev => ({
      ...prev,
      medications: [...prev.medications, { name: "", dosage: "", route: "", time: "" }]
    }));
  };

  const updateMedication = (index, field, value) => {
    setTreatment(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
          medication: treatmentData.medications.filter(m => m.name).map(m => `${m.name} ${m.dosage} ${m.route}`).join("; "),
          dosage: treatmentData.medications.filter(m => m.name).map(m => m.dosage).join(", "),
          route: treatmentData.medications.filter(m => m.name).map(m => m.route).join(", "),
      )
    }
    )
    )
  }

  const removeMedication = (index) => {
    setTreatment(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    if (!treatmentData.treatmentGiven?.length && !treatmentData.medications?.filter(m => m.name).length) {
      setMessage("Please enter at least one treatment or medication");
      onSubmit(treatment);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Treatment Checkboxes */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          Treatments Administered
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {commonTreatments.map((treatmentOption) => (
            <label key={treatmentOption} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
              <input
                type="checkbox"
                checked={treatment.treatmentGiven.includes(treatmentOption)}
                onChange={() => handleTreatmentToggle(treatmentOption)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{treatmentOption}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Medications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-600" />
            Medications Administered
          </h3>
          <button
            type="button"
            onClick={addMedication}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Medication
          </button>
        </div>
        
        <div className="space-y-4">
          {treatment.medications.map((med, index) => (
            <div key={index} className="p-4 border-2 border-purple-200 rounded-xl bg-purple-50">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                  <select
                    value={med.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select medication</option>
                    {commonMedications.map((medication) => (
                      <option key={medication.name} value={medication.name}>
                        {medication.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g., 5mg"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                  <select
                    value={med.route}
                    onChange={(e) => updateMedication(index, 'route', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select route</option>
                    <option value="IV">Intravenous</option>
                    <option value="IM">Intramuscular</option>
                    <option value="Oral">Oral</option>
                    <option value="Sublingual">Sublingual</option>
                    <option value="Inhalation">Inhalation</option>
                    <option value="Intranasal">Intranasal</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="w-full bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Minus className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Response */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Patient Response to Treatment
        </label>
        <textarea
          placeholder="Describe patient's response to treatment..."
          value={treatment.patientResponse}
          onChange={(e) => setTreatment(prev => ({ ...prev, patientResponse: e.target.value }))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
          rows="3"
        />
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Additional Treatment Notes
        </label>
        <textarea
          placeholder="Any additional observations or notes..."
          value={treatment.additionalNotes}
          onChange={(e) => setTreatment(prev => ({ ...prev, additionalNotes: e.target.value }))}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
          rows="3"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Recording Treatment...
          </div>
        ) : (
          <>
            <Pill className="w-5 h-5 inline mr-2" />
            Record Treatment
          </>
        )}
      </button>
    </form>
  );
}