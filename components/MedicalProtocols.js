"use client";
import { useState } from "react";
import { 
  Heart, 
  Activity, 
  Stethoscope, 
  AlertTriangle, 
  Clock, 
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  FileText,
  Zap,
  Shield,
  Timer
} from "lucide-react";

export default function MedicalProtocols() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedProtocol, setExpandedProtocol] = useState(null);

  const protocols = [
    {
      id: "cardiac-arrest",
      name: "Cardiac Arrest",
      category: "Critical",
      priority: "Critical",
      description: "Complete cardiac arrest management protocol",
      steps: [
        { time: "0-30 sec", action: "Check responsiveness and pulse", details: "Tap shoulders, check carotid pulse for 10 seconds" },
        { time: "30 sec", action: "Begin CPR", details: "30 compressions at 100-120/min, 2 inches deep" },
        { time: "2 min", action: "Apply AED/Defibrillator", details: "Analyze rhythm, shock if advised" },
        { time: "2-4 min", action: "Epinephrine 1mg IV/IO", details: "Repeat every 3-5 minutes" },
        { time: "4 min", action: "Advanced airway", details: "Intubation or supraglottic airway" },
        { time: "Ongoing", action: "Continue CPR cycles", details: "2 minutes CPR between rhythm checks" }
      ],
      medications: [
        { name: "Epinephrine", dose: "1mg", route: "IV/IO", frequency: "Every 3-5 min" },
        { name: "Amiodarone", dose: "300mg", route: "IV/IO", frequency: "Once, then 150mg" }
      ],
      contraindications: ["Do not delay CPR for IV access", "Minimize interruptions"],
      notes: "High-quality CPR is the priority. Rotate compressors every 2 minutes."
    },
    {
      id: "stroke",
      name: "Stroke Assessment",
      category: "Critical",
      priority: "Critical",
      description: "Acute stroke evaluation and management",
      steps: [
        { time: "0-2 min", action: "FAST Assessment", details: "Face, Arms, Speech, Time" },
        { time: "2-5 min", action: "Vital signs", details: "BP, HR, RR, SpO2, glucose" },
        { time: "5 min", action: "Neurological exam", details: "GCS, pupils, motor function" },
        { time: "10 min", action: "IV access", details: "Large bore IV, normal saline" },
        { time: "15 min", action: "Hospital notification", details: "Stroke alert to receiving facility" },
        { time: "Ongoing", action: "Monitor and transport", details: "Frequent neuro checks" }
      ],
      medications: [
        { name: "Dextrose", dose: "25g", route: "IV", frequency: "If glucose <60mg/dL" }
      ],
      contraindications: ["No aspirin if hemorrhagic stroke suspected", "Avoid excessive BP reduction"],
      notes: "Time is brain. Rapid transport to stroke center is critical."
    },
    {
      id: "chest-pain",
      name: "Chest Pain/ACS",
      category: "Critical",
      priority: "High",
      description: "Acute coronary syndrome management",
      steps: [
        { time: "0-2 min", action: "12-lead ECG", details: "Obtain within 10 minutes of contact" },
        { time: "2 min", action: "Oxygen if SpO2 <94%", details: "Titrate to maintain SpO2 >94%" },
        { time: "3 min", action: "Aspirin 324mg", details: "Chewed, unless contraindicated" },
        { time: "5 min", action: "Nitroglycerin", details: "0.4mg SL, repeat q5min x3" },
        { time: "10 min", action: "IV access", details: "Large bore IV, normal saline" },
        { time: "15 min", action: "Pain management", details: "Morphine 2-4mg IV if needed" }
      ],
      medications: [
        { name: "Aspirin", dose: "324mg", route: "PO", frequency: "Once" },
        { name: "Nitroglycerin", dose: "0.4mg", route: "SL", frequency: "Q5min x3" },
        { name: "Morphine", dose: "2-4mg", route: "IV", frequency: "Q5-15min PRN" }
      ],
      contraindications: ["No nitro if systolic BP <90", "No aspirin if bleeding risk"],
      notes: "STEMI requires immediate cath lab activation"
    },
    {
      id: "respiratory-distress",
      name: "Respiratory Distress",
      category: "Emergency",
      priority: "High",
      description: "Acute respiratory failure management",
      steps: [
        { time: "0-1 min", action: "Assess airway", details: "Look, listen, feel for breathing" },
        { time: "1 min", action: "High-flow oxygen", details: "15L via NRB or CPAP if available" },
        { time: "3 min", action: "Albuterol nebulizer", details: "2.5mg in 3mL normal saline" },
        { time: "5 min", action: "IV access", details: "Large bore IV for medications" },
        { time: "10 min", action: "Consider intubation", details: "If severe distress or failure" },
        { time: "Ongoing", action: "Monitor closely", details: "SpO2, ETCO2, vital signs" }
      ],
      medications: [
        { name: "Albuterol", dose: "2.5mg", route: "Nebulizer", frequency: "Q20min PRN" },
        { name: "Ipratropium", dose: "0.5mg", route: "Nebulizer", frequency: "With albuterol" },
        { name: "Methylprednisolone", dose: "125mg", route: "IV", frequency: "Once" }
      ],
      contraindications: ["Avoid excessive oxygen in COPD", "Monitor for pneumothorax"],
      notes: "Position patient upright. Consider CPAP for CHF."
    },
    {
      id: "trauma-assessment",
      name: "Trauma Assessment",
      category: "Emergency",
      priority: "High",
      description: "Primary and secondary trauma survey",
      steps: [
        { time: "0-2 min", action: "Primary survey (ABCDE)", details: "Airway, Breathing, Circulation, Disability, Exposure" },
        { time: "2-5 min", action: "Spinal immobilization", details: "C-collar, backboard if indicated" },
        { time: "5 min", action: "Control bleeding", details: "Direct pressure, tourniquets if needed" },
        { time: "10 min", action: "IV access x2", details: "Large bore IVs, blood samples" },
        { time: "15 min", action: "Secondary survey", details: "Head-to-toe examination" },
        { time: "Ongoing", action: "Reassess vitals", details: "Every 5 minutes, monitor for shock" }
      ],
      medications: [
        { name: "Normal Saline", dose: "1-2L", route: "IV", frequency: "For hypotension" },
        { name: "Morphine", dose: "2-4mg", route: "IV", frequency: "For pain control" }
      ],
      contraindications: ["No fluids if penetrating torso trauma", "Avoid narcotics in head injury"],
      notes: "Golden hour concept - rapid transport to trauma center"
    },
    {
      id: "allergic-reaction",
      name: "Allergic Reaction/Anaphylaxis",
      category: "Emergency",
      priority: "High",
      description: "Severe allergic reaction management",
      steps: [
        { time: "0-1 min", action: "Assess severity", details: "Airway, breathing, circulation, skin" },
        { time: "1 min", action: "Epinephrine 1:1000", details: "0.3-0.5mg IM lateral thigh" },
        { time: "2 min", action: "High-flow oxygen", details: "15L via NRB mask" },
        { time: "5 min", action: "IV access", details: "Large bore IV, normal saline" },
        { time: "10 min", action: "Diphenhydramine", details: "25-50mg IV/IM" },
        { time: "15 min", action: "Methylprednisolone", details: "125mg IV" }
      ],
      medications: [
        { name: "Epinephrine", dose: "0.3-0.5mg", route: "IM", frequency: "Q5-15min PRN" },
        { name: "Diphenhydramine", dose: "25-50mg", route: "IV/IM", frequency: "Once" },
        { name: "Methylprednisolone", dose: "125mg", route: "IV", frequency: "Once" }
      ],
      contraindications: ["No delay for IV if severe reaction", "Monitor for biphasic reaction"],
      notes: "Epinephrine is first-line treatment. May need multiple doses."
    },
    {
      id: "seizure",
      name: "Seizure Management",
      category: "Emergency",
      priority: "Medium",
      description: "Active seizure and post-ictal care",
      steps: [
        { time: "0-1 min", action: "Protect airway", details: "Position on side, suction if needed" },
        { time: "1 min", action: "Oxygen", details: "High-flow oxygen via NRB" },
        { time: "2 min", action: "Check glucose", details: "Fingerstick glucose level" },
        { time: "5 min", action: "IV access", details: "Large bore IV for medications" },
        { time: ">5 min seizure", action: "Lorazepam", details: "2-4mg IV, may repeat once" },
        { time: "Post-ictal", action: "Monitor and transport", details: "Neurological assessment" }
      ],
      medications: [
        { name: "Lorazepam", dose: "2-4mg", route: "IV", frequency: "May repeat x1" },
        { name: "Dextrose", dose: "25g", route: "IV", frequency: "If glucose <60mg/dL" }
      ],
      contraindications: ["Avoid restraining patient", "Don't put anything in mouth"],
      notes: "Most seizures self-terminate. Focus on airway protection."
    },
    {
      id: "diabetic-emergency",
      name: "Diabetic Emergency",
      category: "Emergency",
      priority: "Medium",
      description: "Hypoglycemia and DKA management",
      steps: [
        { time: "0-2 min", action: "Check glucose", details: "Fingerstick blood glucose" },
        { time: "2 min", action: "Assess consciousness", details: "GCS, ability to swallow" },
        { time: "If <60mg/dL", action: "Dextrose 25g IV", details: "Or glucagon 1mg IM if no IV" },
        { time: "If >250mg/dL", action: "Normal saline", details: "1-2L IV for dehydration" },
        { time: "5 min", action: "Reassess glucose", details: "Recheck after treatment" },
        { time: "Ongoing", action: "Monitor closely", details: "Watch for rebound hypoglycemia" }
      ],
      medications: [
        { name: "Dextrose 50%", dose: "25g (50mL)", route: "IV", frequency: "Once, may repeat" },
        { name: "Glucagon", dose: "1mg", route: "IM", frequency: "If no IV access" },
        { name: "Normal Saline", dose: "1-2L", route: "IV", frequency: "For DKA" }
      ],
      contraindications: ["Don't give oral glucose if unconscious", "Monitor for cerebral edema in DKA"],
      notes: "Hypoglycemia can mimic stroke. Always check glucose in altered mental status."
    },
    {
      id: "overdose",
      name: "Drug Overdose",
      category: "Emergency",
      priority: "High",
      description: "Opioid and general overdose management",
      steps: [
        { time: "0-1 min", action: "Assess airway/breathing", details: "Look for respiratory depression" },
        { time: "1 min", action: "Naloxone if opioid", details: "0.4-2mg IV/IM/IN" },
        { time: "2 min", action: "Ventilatory support", details: "BVM if needed, consider intubation" },
        { time: "5 min", action: "IV access", details: "Large bore IV, normal saline" },
        { time: "10 min", action: "Repeat naloxone", details: "If no response, give additional doses" },
        { time: "Ongoing", action: "Monitor closely", details: "Watch for re-sedation" }
      ],
      medications: [
        { name: "Naloxone", dose: "0.4-2mg", route: "IV/IM/IN", frequency: "Q2-3min PRN" },
        { name: "Flumazenil", dose: "0.2mg", route: "IV", frequency: "For benzodiazepines only" }
      ],
      contraindications: ["Flumazenil contraindicated in mixed overdose", "Monitor for withdrawal seizures"],
      notes: "Naloxone duration is shorter than most opioids. May need multiple doses."
    },
    {
      id: "burns",
      name: "Burn Management",
      category: "Trauma",
      priority: "Medium",
      description: "Thermal, chemical, and electrical burn care",
      steps: [
        { time: "0-2 min", action: "Stop burning process", details: "Remove from source, cool with water" },
        { time: "2-5 min", action: "Assess burn severity", details: "Rule of 9s, depth assessment" },
        { time: "5 min", action: "Cool burns", details: "Cool water for 10-20 minutes" },
        { time: "10 min", action: "IV access", details: "Large bore IV, Lactated Ringer's" },
        { time: "15 min", action: "Pain management", details: "Morphine 2-4mg IV" },
        { time: "20 min", action: "Dress burns", details: "Sterile dressings, avoid ice" }
      ],
      medications: [
        { name: "Lactated Ringer's", dose: "4mL/kg/%burn", route: "IV", frequency: "First 24 hours" },
        { name: "Morphine", dose: "2-4mg", route: "IV", frequency: "Q5-15min PRN" }
      ],
      contraindications: ["No ice on burns", "Avoid breaking blisters"],
      notes: "Calculate fluid needs using Parkland formula for burns >20% BSA"
    },
    {
      id: "hypothermia",
      name: "Hypothermia",
      category: "Environmental",
      priority: "Medium",
      description: "Severe hypothermia management",
      steps: [
        { time: "0-2 min", action: "Remove from cold", details: "Gentle handling, avoid jarring" },
        { time: "2 min", action: "Check core temp", details: "Rectal or esophageal probe" },
        { time: "5 min", action: "Passive rewarming", details: "Blankets, warm environment" },
        { time: "10 min", action: "Active rewarming", details: "Warm IV fluids, heat packs" },
        { time: "15 min", action: "Cardiac monitoring", details: "Watch for arrhythmias" },
        { time: "Ongoing", action: "Gentle transport", details: "Avoid rough handling" }
      ],
      medications: [
        { name: "Warm Normal Saline", dose: "250-500mL", route: "IV", frequency: "Warmed to 40°C" }
      ],
      contraindications: ["No rapid rewarming", "Avoid rough handling"],
      notes: "Hypothermic patients are not dead until warm and dead"
    },
    {
      id: "poisoning",
      name: "Poisoning/Toxic Exposure",
      category: "Emergency",
      priority: "High",
      description: "General poisoning and toxic exposure management",
      steps: [
        { time: "0-1 min", action: "Identify poison", details: "History, containers, witnesses" },
        { time: "1-2 min", action: "Decontamination", details: "Remove from source, irrigate skin/eyes" },
        { time: "2-5 min", action: "Supportive care", details: "Airway, breathing, circulation" },
        { time: "5 min", action: "Contact poison control", details: "1-800-222-1222" },
        { time: "10 min", action: "Specific antidotes", details: "Based on poison control guidance" },
        { time: "Ongoing", action: "Monitor and transport", details: "Frequent reassessment" }
      ],
      medications: [
        { name: "Activated Charcoal", dose: "1g/kg", route: "PO", frequency: "If conscious and recent ingestion" },
        { name: "Naloxone", dose: "0.4-2mg", route: "IV/IM", frequency: "For opioid poisoning" }
      ],
      contraindications: ["No charcoal for caustics or hydrocarbons", "No induced vomiting"],
      notes: "Bring containers/samples to hospital. Contact poison control early."
    }
  ];

  const emergencyContacts = [
    { name: "Poison Control", number: "1-800-222-1222", description: "24/7 poison information" },
    { name: "Medical Control", number: "555-MEDICAL", description: "Physician consultation" },
    { name: "Dispatch", number: "911", description: "Emergency coordination" },
    { name: "Trauma Center", number: "555-TRAUMA", description: "Direct trauma consultation" }
  ];

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || protocol.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPriorityColor = (priority) => {
    const colors = {
      "Critical": "from-red-500 to-red-600",
      "High": "from-orange-500 to-orange-600", 
      "Medium": "from-yellow-500 to-yellow-600",
      "Low": "from-green-500 to-green-600"
    };
    return colors[priority] || "from-gray-500 to-gray-600";
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      "Critical": <AlertTriangle className="w-4 h-4" />,
      "High": <Activity className="w-4 h-4" />,
      "Medium": <Clock className="w-4 h-4" />,
      "Low": <CheckCircle className="w-4 h-4" />
    };
    return icons[priority] || <Clock className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search protocols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Categories</option>
              <option value="Critical">Critical</option>
              <option value="Emergency">Emergency</option>
              <option value="Trauma">Trauma</option>
              <option value="Environmental">Environmental</option>
            </select>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-6 h-6 text-blue-600" />
          Emergency Contacts
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div>
                <p className="font-semibold text-blue-900">{contact.name}</p>
                <p className="text-blue-700 text-sm">{contact.description}</p>
              </div>
              <a
                href={`tel:${contact.number}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {contact.number}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Protocols */}
      <div className="space-y-6">
        {filteredProtocols.map((protocol) => (
          <div key={protocol.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div 
              onClick={() => setExpandedProtocol(expandedProtocol === protocol.id ? null : protocol.id)}
              className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors bg-gradient-to-r ${getPriorityColor(protocol.priority)} bg-opacity-10`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${getPriorityColor(protocol.priority)} text-white shadow-lg`}>
                    {getPriorityIcon(protocol.priority)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{protocol.name}</h3>
                    <p className="text-gray-600">{protocol.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getPriorityColor(protocol.priority)} text-white`}>
                        {getPriorityIcon(protocol.priority)}
                        {protocol.priority}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">{protocol.category}</span>
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">
                  {expandedProtocol === protocol.id ? (
                    <ChevronUp className="w-6 h-6" />
                  ) : (
                    <ChevronDown className="w-6 h-6" />
                  )}
                </div>
              </div>
            </div>

            {expandedProtocol === protocol.id && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Protocol Steps */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Timer className="w-5 h-5 text-blue-600" />
                      Step-by-Step Protocol
                    </h4>
                    <div className="space-y-3">
                      {protocol.steps.map((step, index) => (
                        <div key={index} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{step.action}</span>
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                  {step.time}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm">{step.details}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medications and Notes */}
                  <div className="space-y-6">
                    {/* Medications */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-purple-600" />
                        Medications
                      </h4>
                      <div className="space-y-3">
                        {protocol.medications.map((med, index) => (
                          <div key={index} className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <div className="font-semibold text-purple-900">{med.name}</div>
                            <div className="text-purple-700 text-sm">
                              <span className="font-medium">Dose:</span> {med.dose} | 
                              <span className="font-medium"> Route:</span> {med.route} | 
                              <span className="font-medium"> Frequency:</span> {med.frequency}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contraindications */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-600" />
                        Contraindications & Warnings
                      </h4>
                      <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                        <ul className="space-y-2">
                          {protocol.contraindications.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-red-800">
                              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Clinical Notes */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Clinical Notes
                      </h4>
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-green-800 text-sm">{protocol.notes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredProtocols.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Protocols Found</h3>
          <p className="text-gray-600">No protocols match your search criteria</p>
        </div>
      )}
    </div>
  );
}