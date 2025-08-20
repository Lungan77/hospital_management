import React, { useState } from "react";

const TreatmentForm = ({ onSubmit }) => {
  const [treatment, setTreatment] = useState({
    treatmentGiven: [],
    medications: [{ name: "", dosage: "", route: "" }],
  });

  const commonTreatments = [
    "Wound cleaning",
    "Suturing",
    "Dressing",
    "IV fluids",
    "Oxygen",
    "Pain relief",
  ];

  const commonMedications = [
    { name: "Paracetamol", routes: ["oral", "IV"] },
    { name: "Ibuprofen", routes: ["oral"] },
    { name: "Amoxicillin", routes: ["oral"] },
    { name: "Metronidazole", routes: ["oral", "IV"] },
    { name: "Morphine", routes: ["IV", "IM"] },
  ];

  const toggleTreatment = (name) => {
    setTreatment((prev) => ({
      ...prev,
      treatmentGiven: prev.treatmentGiven.includes(name)
        ? prev.treatmentGiven.filter((t) => t !== name)
        : [...prev.treatmentGiven, name],
    }));
  };

  const updateMedication = (index, field, value) => {
    setTreatment((prev) => {
      const newMeds = [...prev.medications];

      if (field === "name") {
        const selectedMed = commonMedications.find((m) => m.name === value);
        newMeds[index] = {
          ...newMeds[index],
          name: value,
          // auto-fill route with first option if available
          route: selectedMed ? selectedMed.routes[0] : "",
        };
      } else {
        newMeds[index] = { ...newMeds[index], [field]: value };
      }

      return { ...prev, medications: newMeds };
    });
  };

  const addMedication = () => {
    setTreatment((prev) => ({
      ...prev,
      medications: [...prev.medications, { name: "", dosage: "", route: "" }],
    }));
  };

  const removeMedication = (index) => {
    setTreatment((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !treatment.treatmentGiven.length &&
      !treatment.medications.filter((m) => m.name).length
    ) {
      alert("Please enter at least one treatment or medication");
      return;
    }
    onSubmit(treatment);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white rounded-lg shadow-md space-y-6"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Treatment & Medications
      </h2>

      {/* Common treatments */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Select Treatments
        </label>
        <div className="flex flex-wrap gap-2">
          {commonTreatments.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => toggleTreatment(t)}
              className={`px-4 py-2 rounded-full border transition ${
                treatment.treatmentGiven.includes(t)
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-purple-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Medications */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Prescribe Medications
        </label>
        {treatment.medications.map((med, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 items-center"
          >
            {/* Medication name */}
            <select
              value={med.name}
              onChange={(e) => updateMedication(index, "name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select medication</option>
              {commonMedications.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* Dosage */}
            <input
              type="text"
              value={med.dosage}
              onChange={(e) => updateMedication(index, "dosage", e.target.value)}
              placeholder="Dosage (e.g. 500mg)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* Route - auto-filled but still editable */}
            <select
              value={med.route}
              onChange={(e) => updateMedication(index, "route", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select route</option>
              {commonMedications
                .find((m) => m.name === med.name)
                ?.routes.map((route) => (
                  <option key={route} value={route}>
                    {route}
                  </option>
                ))}
            </select>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeMedication(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMedication}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
        >
          + Add Medication
        </button>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg shadow hover:bg-purple-700"
      >
        Save Treatment
      </button>
    </form>
  );
};

export default TreatmentForm;
