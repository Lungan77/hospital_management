"use client";
import { useState } from "react";
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Zap, 
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function VitalsForm({ onSubmit, loading }) {
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    heartRate: "",
    respiratoryRate: "",
    temperature: "",
    oxygenSaturation: "",
    glucoseLevel: "",
    painScale: "0",
    consciousnessLevel: "Alert",
    symptoms: ""
  });

  const handleChange = (field, value) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(vitals);
    }
  };

  const getVitalStatus = (field, value) => {
    const ranges = {
      heartRate: { normal: [60, 100], warning: [50, 120] },
      temperature: { normal: [36.1, 37.2], warning: [35.0, 38.5] },
      oxygenSaturation: { normal: [95, 100], warning: [90, 94] },
      respiratoryRate: { normal: [12, 20], warning: [8, 25] }
    };

    if (!ranges[field] || !value) return "normal";
    
    const numValue = parseFloat(value);
    const { normal, warning } = ranges[field];
    
    if (numValue >= normal[0] && numValue <= normal[1]) return "normal";
    if (numValue >= warning[0] && numValue <= warning[1]) return "warning";
    return "critical";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "normal": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "critical": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const vitalInputs = [
    { 
      key: "bloodPressure", 
      label: "Blood Pressure", 
      icon: <Heart className="w-5 h-5" />, 
      unit: "mmHg", 
      placeholder: "120/80", 
      color: "red",
      type: "text"
    },
    { 
      key: "heartRate", 
      label: "Heart Rate", 
      icon: <Activity className="w-5 h-5" />, 
      unit: "bpm", 
      placeholder: "72", 
      color: "pink",
      type: "number"
    },
    { 
      key: "respiratoryRate", 
      label: "Respiratory Rate", 
      icon: <Activity className="w-5 h-5" />, 
      unit: "/min", 
      placeholder: "16", 
      color: "blue",
      type: "number"
    },
    { 
      key: "temperature", 
      label: "Temperature", 
      icon: <Thermometer className="w-5 h-5" />, 
      unit: "°C", 
      placeholder: "36.5", 
      color: "orange",
      type: "number",
      step: "0.1"
    },
    { 
      key: "oxygenSaturation", 
      label: "Oxygen Saturation", 
      icon: <Droplets className="w-5 h-5" />, 
      unit: "%", 
      placeholder: "98", 
      color: "cyan",
      type: "number"
    },
    { 
      key: "glucoseLevel", 
      label: "Glucose Level", 
      icon: <Zap className="w-5 h-5" />, 
      unit: "mg/dL", 
      placeholder: "100", 
      color: "yellow",
      type: "number"
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vital Signs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vitalInputs.map((vital) => {
          const status = getVitalStatus(vital.key, vitals[vital.key]);
          return (
            <div key={vital.key} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className={`p-1 rounded bg-${vital.color}-100 text-${vital.color}-600`}>
                  {vital.icon}
                </span>
                {vital.label}
                {getStatusIcon(status)}
              </label>
              <div className="relative">
                <input
                  type={vital.type}
                  step={vital.step}
                  placeholder={vital.placeholder}
                  value={vitals[vital.key]}
                  onChange={(e) => handleChange(vital.key, e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    status === "critical" ? "border-red-300 focus:ring-red-500 bg-red-50" :
                    status === "warning" ? "border-yellow-300 focus:ring-yellow-500 bg-yellow-50" :
                    "border-gray-200 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                  }`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                  {vital.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pain Scale */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="p-1 rounded bg-red-100 text-red-600">
            <Zap className="w-4 h-4" />
          </span>
          Pain Scale (0-10)
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="10"
            value={vitals.painScale}
            onChange={(e) => handleChange('painScale', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>No Pain (0)</span>
            <span className="font-bold text-lg text-red-600">{vitals.painScale}</span>
            <span>Severe Pain (10)</span>
          </div>
        </div>
      </div>

      {/* Consciousness Level */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="p-1 rounded bg-purple-100 text-purple-600">
            <Brain className="w-4 h-4" />
          </span>
          Consciousness Level
        </label>
        <select
          value={vitals.consciousnessLevel}
          onChange={(e) => handleChange('consciousnessLevel', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
        >
          <option value="Alert">Alert</option>
          <option value="Verbal">Responds to Verbal</option>
          <option value="Pain">Responds to Pain</option>
          <option value="Unresponsive">Unresponsive</option>
        </select>
      </div>

      {/* Symptoms */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Current Symptoms
        </label>
        <textarea
          placeholder="Describe observed symptoms..."
          value={vitals.symptoms}
          onChange={(e) => handleChange('symptoms', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
          rows="3"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-pink-600 to-red-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-pink-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-pink-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Recording Vitals...
          </div>
        ) : (
          <>
            <Heart className="w-5 h-5 inline mr-2" />
            Record Vital Signs
          </>
        )}
      </button>
    </form>
  );
}