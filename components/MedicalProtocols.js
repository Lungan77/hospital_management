"use client";
import { useState } from "react";
import { 
  Heart, 
  Zap, 
  Brain, 
  Thermometer, 
  AlertTriangle, 
  Activity,
  Pill,
  Clock,
  CheckCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Star,
  Shield,
  Target,
  Stethoscope
} from "lucide-react";

export default function MedicalProtocols() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [expandedProtocol, setExpandedProtocol] = useState(null);

  const protocols = [
    {
      id: "cardiac-arrest",
      title: "Cardiac Arrest",
      category: "Cardiac",
      priority: "Critical",
      icon: <Heart className="w-6 h-6" />,
      color: "red",
      overview: "Immediate life-saving intervention for cardiac arrest patients",
      steps: [
        {
          step: 1,
          title: "Scene Safety & Assessment",
          actions: [
            "Ensure scene safety",
            "Check responsiveness",
            "Call for backup if needed",
            "Position patient on firm surface"
          ],
          time: "30 seconds"
        },
        {
          step: 2,
          title: "Begin CPR",
          actions: [
            "Start chest compressions (100-120/min)",
            "Compression depth: 2-2.4 inches",
            "Allow complete chest recoil",
            "Minimize interruptions"
          ],
          time: "Immediate"
        },
        {
          step: 3,
          title: "Airway Management",
          actions: [
            "Insert advanced airway (if trained)",
            "Bag-mask ventilation if no advanced airway",
            "Confirm placement with capnography",
            "Secure airway"
          ],
          time: "2-3 minutes"
        },
        {
          step: 4,
          title: "Defibrillation",
          actions: [
            "Attach AED/monitor pads",
            "Analyze rhythm",
            "Shock if VF/VT present",
            "Resume CPR immediately after shock"
          ],
          time: "As soon as available"
        },
        {
          step: 5,
          title: "Medications",
          actions: [
            "Epinephrine 1mg IV/IO every 3-5 minutes",
            "Consider amiodarone for VF/VT",
            "Treat reversible causes (H's and T's)",
            "Continue until ROSC or termination"
          ],
          time: "After 2 minutes CPR"
        }
      ],
      medications: [
        { name: "Epinephrine", dose: "1mg", route: "IV/IO", frequency: "Every 3-5 minutes" },
        { name: "Amiodarone", dose: "300mg", route: "IV", frequency: "Once, then 150mg" }
      ],
      contraindications: ["Obvious signs of death", "DNR order", "Unsafe scene"],
      notes: "Continue CPR until ROSC, exhaustion, or medical control termination"
    },
    {
      id: "stroke",
      title: "Stroke Protocol",
      category: "Neurological",
      priority: "Critical",
      icon: <Brain className="w-6 h-6" />,
      color: "purple",
      overview: "Rapid assessment and transport for suspected stroke patients",
      steps: [
        {
          step: 1,
          title: "FAST Assessment",
          actions: [
            "Face: Check for facial droop",
            "Arms: Test arm weakness",
            "Speech: Assess speech clarity",
            "Time: Note onset time"
          ],
          time: "2 minutes"
        },
        {
          step: 2,
          title: "Vital Signs",
          actions: [
            "Blood pressure (both arms)",
            "Blood glucose level",
            "Oxygen saturation",
            "Temperature"
          ],
          time: "3 minutes"
        },
        {
          step: 3,
          title: "Neurological Assessment",
          actions: [
            "Glasgow Coma Scale",
            "Pupil response",
            "Motor function",
            "Sensory function"
          ],
          time: "5 minutes"
        },
        {
          step: 4,
          title: "Treatment",
          actions: [
            "Oxygen if SpO2 < 94%",
            "IV access (large bore)",
            "Position head elevated 30°",
            "Protect airway"
          ],
          time: "Ongoing"
        },
        {
          step: 5,
          title: "Transport",
          actions: [
            "Notify stroke center",
            "Rapid transport",
            "Continuous monitoring",
            "Reassess every 5 minutes"
          ],
          time: "Immediate"
        }
      ],
      medications: [
        { name: "Oxygen", dose: "2-4L", route: "Nasal cannula", frequency: "If SpO2 < 94%" },
        { name: "Dextrose", dose: "25g", route: "IV", frequency: "If glucose < 60mg/dL" }
      ],
      contraindications: ["Hemorrhagic stroke (if known)", "Recent surgery"],
      notes: "Time is brain - minimize scene time, rapid transport to stroke center"
    },
    {
      id: "chest-pain",
      title: "Chest Pain/ACS",
      category: "Cardiac",
      priority: "High",
      icon: <Heart className="w-6 h-6" />,
      color: "red",
      overview: "Assessment and treatment of acute coronary syndrome",
      steps: [
        {
          step: 1,
          title: "Initial Assessment",
          actions: [
            "OPQRST pain assessment",
            "12-lead ECG within 10 minutes",
            "Vital signs",
            "Medical history"
          ],
          time: "5 minutes"
        },
        {
          step: 2,
          title: "Oxygen & Monitoring",
          actions: [
            "Oxygen if SpO2 < 94%",
            "Continuous cardiac monitoring",
            "IV access",
            "Position of comfort"
          ],
          time: "Immediate"
        },
        {
          step: 3,
          title: "Medications",
          actions: [
            "Aspirin 324mg (if no allergy)",
            "Nitroglycerin 0.4mg SL",
            "Consider morphine for pain",
            "Monitor blood pressure"
          ],
          time: "After assessment"
        },
        {
          step: 4,
          title: "Transport Decision",
          actions: [
            "STEMI → PCI center",
            "High-risk → cardiac center",
            "Notify receiving facility",
            "Continuous monitoring"
          ],
          time: "Based on ECG"
        }
      ],
      medications: [
        { name: "Aspirin", dose: "324mg", route: "Oral", frequency: "Once" },
        { name: "Nitroglycerin", dose: "0.4mg", route: "Sublingual", frequency: "Every 5 min x3" },
        { name: "Morphine", dose: "2-4mg", route: "IV", frequency: "Every 5-15 min" }
      ],
      contraindications: ["Hypotension", "Recent sildenafil use", "Allergy to medications"],
      notes: "Monitor for hypotension with nitroglycerin. Aspirin contraindicated if allergy."
    },
    {
      id: "respiratory-distress",
      title: "Respiratory Distress",
      category: "Respiratory",
      priority: "High",
      icon: <Activity className="w-6 h-6" />,
      color: "blue",
      overview: "Management of acute respiratory emergencies",
      steps: [
        {
          step: 1,
          title: "Airway Assessment",
          actions: [
            "Check airway patency",
            "Look for obstructions",
            "Assess breathing effort",
            "Listen to lung sounds"
          ],
          time: "1 minute"
        },
        {
          step: 2,
          title: "Oxygen Therapy",
          actions: [
            "High-flow oxygen",
            "Non-rebreather mask 15L/min",
            "Monitor SpO2 continuously",
            "Position upright if possible"
          ],
          time: "Immediate"
        },
        {
          step: 3,
          title: "Bronchodilator",
          actions: [
            "Albuterol 2.5mg nebulized",
            "May repeat every 20 minutes",
            "Monitor heart rate",
            "Assess response"
          ],
          time: "If wheezing present"
        },
        {
          step: 4,
          title: "Advanced Interventions",
          actions: [
            "IV access",
            "Consider CPAP if available",
            "Prepare for intubation",
            "Monitor vital signs"
          ],
          time: "If severe distress"
        }
      ],
      medications: [
        { name: "Albuterol", dose: "2.5mg", route: "Nebulized", frequency: "Every 20 min" },
        { name: "Epinephrine", dose: "0.3mg", route: "IM", frequency: "If anaphylaxis" },
        { name: "Methylprednisolone", dose: "125mg", route: "IV", frequency: "Once" }
      ],
      contraindications: ["Known allergy to medications"],
      notes: "Monitor for tachycardia with albuterol. Consider anaphylaxis if acute onset."
    },
    {
      id: "trauma",
      title: "Trauma Assessment",
      category: "Trauma",
      priority: "High",
      icon: <Shield className="w-6 h-6" />,
      color: "orange",
      overview: "Systematic trauma assessment and management",
      steps: [
        {
          step: 1,
          title: "Primary Survey (ABCDE)",
          actions: [
            "Airway with C-spine control",
            "Breathing and ventilation",
            "Circulation with hemorrhage control",
            "Disability (neurological)",
            "Exposure/Environment"
          ],
          time: "2-3 minutes"
        },
        {
          step: 2,
          title: "Hemorrhage Control",
          actions: [
            "Direct pressure",
            "Pressure dressings",
            "Tourniquet if extremity",
            "Hemostatic agents if available"
          ],
          time: "Immediate"
        },
        {
          step: 3,
          title: "Spinal Immobilization",
          actions: [
            "Manual C-spine stabilization",
            "Cervical collar",
            "Backboard if indicated",
            "Secure patient properly"
          ],
          time: "If mechanism suggests"
        },
        {
          step: 4,
          title: "Shock Management",
          actions: [
            "Large bore IV access x2",
            "Fluid resuscitation",
            "Monitor blood pressure",
            "Treat hypothermia"
          ],
          time: "If signs of shock"
        }
      ],
      medications: [
        { name: "Normal Saline", dose: "1-2L", route: "IV", frequency: "Bolus if hypotensive" },
        { name: "Morphine", dose: "2-4mg", route: "IV", frequency: "For pain if stable" }
      ],
      contraindications: ["Penetrating eye injury (avoid pressure)", "Suspected internal bleeding"],
      notes: "Load and go for critical trauma. Minimize scene time to under 10 minutes."
    },
    {
      id: "allergic-reaction",
      title: "Allergic Reaction/Anaphylaxis",
      category: "Allergic",
      priority: "High",
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "yellow",
      overview: "Management of severe allergic reactions and anaphylaxis",
      steps: [
        {
          step: 1,
          title: "Assessment",
          actions: [
            "Identify allergen exposure",
            "Assess airway patency",
            "Check for urticaria/rash",
            "Monitor vital signs"
          ],
          time: "1 minute"
        },
        {
          step: 2,
          title: "Epinephrine",
          actions: [
            "Epinephrine 0.3-0.5mg IM",
            "Anterolateral thigh",
            "May repeat every 5-15 minutes",
            "Monitor response"
          ],
          time: "Immediate if severe"
        },
        {
          step: 3,
          title: "Supportive Care",
          actions: [
            "High-flow oxygen",
            "IV access",
            "Albuterol if bronchospasm",
            "Position of comfort"
          ],
          time: "After epinephrine"
        },
        {
          step: 4,
          title: "Additional Medications",
          actions: [
            "Diphenhydramine 25-50mg IV",
            "Methylprednisolone 125mg IV",
            "H2 blocker if available",
            "Fluid resuscitation if hypotensive"
          ],
          time: "After initial treatment"
        }
      ],
      medications: [
        { name: "Epinephrine", dose: "0.3-0.5mg", route: "IM", frequency: "Every 5-15 min" },
        { name: "Diphenhydramine", dose: "25-50mg", route: "IV", frequency: "Once" },
        { name: "Methylprednisolone", dose: "125mg", route: "IV", frequency: "Once" },
        { name: "Albuterol", dose: "2.5mg", route: "Nebulized", frequency: "If bronchospasm" }
      ],
      contraindications: ["None in life-threatening anaphylaxis"],
      notes: "Epinephrine is first-line treatment. Don't delay for IV access."
    },
    {
      id: "seizure",
      title: "Seizure Management",
      category: "Neurological",
      priority: "High",
      icon: <Brain className="w-6 h-6" />,
      color: "purple",
      overview: "Management of active seizures and post-ictal patients",
      steps: [
        {
          step: 1,
          title: "Scene Safety",
          actions: [
            "Protect patient from injury",
            "Remove hazards",
            "Do not restrain",
            "Time the seizure"
          ],
          time: "Immediate"
        },
        {
          step: 2,
          title: "Airway Protection",
          actions: [
            "Position on side if possible",
            "Suction if needed",
            "Do not force airway adjuncts",
            "Prepare for vomiting"
          ],
          time: "During seizure"
        },
        {
          step: 3,
          title: "Post-Ictal Care",
          actions: [
            "Check blood glucose",
            "Assess neurological status",
            "Monitor vital signs",
            "Provide oxygen if needed"
          ],
          time: "After seizure stops"
        },
        {
          step: 4,
          title: "Prolonged Seizure",
          actions: [
            "Lorazepam 2-4mg IV if >5 minutes",
            "May repeat once",
            "Prepare for airway management",
            "Rapid transport"
          ],
          time: "If seizure >5 minutes"
        }
      ],
      medications: [
        { name: "Lorazepam", dose: "2-4mg", route: "IV", frequency: "If >5 min, may repeat" },
        { name: "Dextrose", dose: "25g", route: "IV", frequency: "If glucose <60mg/dL" }
      ],
      contraindications: ["Respiratory depression", "Known allergy"],
      notes: "Check glucose in all seizure patients. Protect airway post-ictal."
    },
    {
      id: "hypoglycemia",
      title: "Hypoglycemia",
      category: "Endocrine",
      priority: "High",
      icon: <Zap className="w-6 h-6" />,
      color: "yellow",
      overview: "Treatment of low blood glucose emergencies",
      steps: [
        {
          step: 1,
          title: "Assessment",
          actions: [
            "Check blood glucose",
            "Assess mental status",
            "Look for medical alert tags",
            "Obtain history if possible"
          ],
          time: "2 minutes"
        },
        {
          step: 2,
          title: "Conscious Patient",
          actions: [
            "Oral glucose if able to swallow",
            "Orange juice or glucose tablets",
            "Monitor for improvement",
            "Recheck glucose in 15 minutes"
          ],
          time: "If conscious"
        },
        {
          step: 3,
          title: "Unconscious Patient",
          actions: [
            "IV access",
            "Dextrose 25g IV push",
            "May repeat if no response",
            "Monitor for improvement"
          ],
          time: "If unconscious"
        },
        {
          step: 4,
          title: "Post-Treatment",
          actions: [
            "Recheck glucose",
            "Assess mental status",
            "Provide food if improved",
            "Transport for evaluation"
          ],
          time: "After treatment"
        }
      ],
      medications: [
        { name: "Dextrose 50%", dose: "25g (50mL)", route: "IV", frequency: "May repeat once" },
        { name: "Glucagon", dose: "1mg", route: "IM", frequency: "If no IV access" },
        { name: "Oral Glucose", dose: "15g", route: "Oral", frequency: "If conscious" }
      ],
      contraindications: ["Inability to protect airway", "Suspected stroke"],
      notes: "Always recheck glucose after treatment. Consider underlying cause."
    },
    {
      id: "overdose",
      title: "Drug Overdose",
      category: "Toxicological",
      priority: "High",
      icon: <Pill className="w-6 h-6" />,
      color: "red",
      overview: "Management of suspected drug overdose patients",
      steps: [
        {
          step: 1,
          title: "Scene Safety",
          actions: [
            "Ensure scene is safe",
            "Look for drug paraphernalia",
            "Assess for multiple patients",
            "Consider hazmat exposure"
          ],
          time: "Before patient contact"
        },
        {
          step: 2,
          title: "Airway & Breathing",
          actions: [
            "Assess respiratory status",
            "Bag-mask ventilation if needed",
            "Suction airway",
            "Consider advanced airway"
          ],
          time: "Immediate"
        },
        {
          step: 3,
          title: "Opioid Overdose",
          actions: [
            "Naloxone 0.4-2mg IV/IM/IN",
            "May repeat every 2-3 minutes",
            "Monitor for withdrawal",
            "Prepare for combativeness"
          ],
          time: "If opioid suspected"
        },
        {
          step: 4,
          title: "Supportive Care",
          actions: [
            "IV access",
            "Cardiac monitoring",
            "Check blood glucose",
            "Thiamine if chronic alcoholic"
          ],
          time: "Ongoing"
        }
      ],
      medications: [
        { name: "Naloxone", dose: "0.4-2mg", route: "IV/IM/IN", frequency: "Every 2-3 min" },
        { name: "Thiamine", dose: "100mg", route: "IV", frequency: "Before dextrose" },
        { name: "Dextrose", dose: "25g", route: "IV", frequency: "If hypoglycemic" }
      ],
      contraindications: ["Known allergy to naloxone"],
      notes: "Naloxone duration shorter than most opioids. Monitor for re-sedation."
    },
    {
      id: "burns",
      title: "Burn Management",
      category: "Trauma",
      priority: "Medium",
      icon: <Thermometer className="w-6 h-6" />,
      color: "orange",
      overview: "Assessment and treatment of burn injuries",
      steps: [
        {
          step: 1,
          title: "Scene Safety",
          actions: [
            "Ensure fire is extinguished",
            "Remove from heat source",
            "Check for inhalation injury",
            "Assess for other trauma"
          ],
          time: "Immediate"
        },
        {
          step: 2,
          title: "Stop Burning Process",
          actions: [
            "Cool with room temperature water",
            "Remove jewelry/clothing",
            "Do not use ice",
            "Cover with clean sheets"
          ],
          time: "First 20 minutes"
        },
        {
          step: 3,
          title: "Assessment",
          actions: [
            "Calculate burn percentage (Rule of 9s)",
            "Assess burn depth",
            "Check for circumferential burns",
            "Monitor airway"
          ],
          time: "After cooling"
        },
        {
          step: 4,
          title: "Fluid Resuscitation",
          actions: [
            "Large bore IV access",
            "Lactated Ringer's solution",
            "Parkland formula if >20% BSA",
            "Monitor urine output"
          ],
          time: "If >20% BSA burned"
        }
      ],
      medications: [
        { name: "Morphine", dose: "2-4mg", route: "IV", frequency: "For pain control" },
        { name: "Lactated Ringer's", dose: "Per formula", route: "IV", frequency: "Continuous" }
      ],
      contraindications: ["Chemical burns (may need specific antidotes)"],
      notes: "Cool burns for 20 minutes max. Prevent hypothermia in large burns."
    },
    {
      id: "diabetic-emergency",
      title: "Diabetic Emergency",
      category: "Endocrine",
      priority: "High",
      icon: <Target className="w-6 h-6" />,
      color: "green",
      overview: "Management of diabetic emergencies (hypo/hyperglycemia)",
      steps: [
        {
          step: 1,
          title: "Blood Glucose Check",
          actions: [
            "Obtain blood glucose reading",
            "Assess mental status",
            "Check for medical alert tags",
            "Obtain medication history"
          ],
          time: "Immediate"
        },
        {
          step: 2,
          title: "Hypoglycemia (<60mg/dL)",
          actions: [
            "If conscious: oral glucose",
            "If unconscious: IV dextrose",
            "Glucagon if no IV access",
            "Monitor for improvement"
          ],
          time: "If glucose <60"
        },
        {
          step: 3,
          title: "Hyperglycemia (>250mg/dL)",
          actions: [
            "IV access",
            "Normal saline fluid bolus",
            "Monitor electrolytes",
            "Assess for DKA signs"
          ],
          time: "If glucose >250"
        },
        {
          step: 4,
          title: "DKA Assessment",
          actions: [
            "Check for fruity breath odor",
            "Assess dehydration",
            "Monitor respiratory pattern",
            "Rapid transport"
          ],
          time: "If hyperglycemic"
        }
      ],
      medications: [
        { name: "Dextrose 50%", dose: "25g", route: "IV", frequency: "For hypoglycemia" },
        { name: "Glucagon", dose: "1mg", route: "IM", frequency: "If no IV access" },
        { name: "Normal Saline", dose: "500mL-1L", route: "IV", frequency: "For dehydration" }
      ],
      contraindications: ["Suspected stroke with hyperglycemia"],
      notes: "Always recheck glucose after treatment. Consider underlying infection in DKA."
    },
    {
      id: "psychiatric-emergency",
      title: "Psychiatric Emergency",
      category: "Psychiatric",
      priority: "Medium",
      icon: <Brain className="w-6 h-6" />,
      color: "indigo",
      overview: "Safe management of psychiatric emergencies",
      steps: [
        {
          step: 1,
          title: "Scene Safety",
          actions: [
            "Assess for weapons",
            "Maintain safe distance",
            "Call for police backup if needed",
            "Remove potential weapons"
          ],
          time: "Before approach"
        },
        {
          step: 2,
          title: "De-escalation",
          actions: [
            "Speak calmly and slowly",
            "Maintain eye contact",
            "Listen actively",
            "Avoid sudden movements"
          ],
          time: "Throughout encounter"
        },
        {
          step: 3,
          title: "Medical Assessment",
          actions: [
            "Check blood glucose",
            "Assess for head trauma",
            "Look for medical causes",
            "Monitor vital signs"
          ],
          time: "When safe"
        },
        {
          step: 4,
          title: "Chemical Restraint",
          actions: [
            "Only if immediate danger",
            "Haloperidol 5mg IM",
            "Or lorazepam 2mg IM",
            "Monitor respiratory status"
          ],
          time: "Last resort only"
        }
      ],
      medications: [
        { name: "Haloperidol", dose: "5mg", route: "IM", frequency: "Once, may repeat" },
        { name: "Lorazepam", dose: "2mg", route: "IM", frequency: "Alternative to haloperidol" },
        { name: "Dextrose", dose: "25g", route: "IV", frequency: "If hypoglycemic" }
      ],
      contraindications: ["Respiratory depression", "Known allergy"],
      notes: "Always rule out medical causes. Use restraints only when necessary for safety."
    },
    {
      id: "hypothermia",
      title: "Hypothermia",
      category: "Environmental",
      priority: "High",
      icon: <Thermometer className="w-6 h-6" />,
      color: "cyan",
      overview: "Management of hypothermic patients",
      steps: [
        {
          step: 1,
          title: "Assessment",
          actions: [
            "Core temperature if possible",
            "Assess mental status",
            "Check for frostbite",
            "Gentle handling"
          ],
          time: "Immediate"
        },
        {
          step: 2,
          title: "Rewarming",
          actions: [
            "Remove from cold environment",
            "Remove wet clothing",
            "Passive external rewarming",
            "Warm blankets"
          ],
          time: "Gentle and gradual"
        },
        {
          step: 3,
          title: "Monitoring",
          actions: [
            "Cardiac monitoring",
            "Handle gently (risk of VF)",
            "Monitor core temperature",
            "Assess for trauma"
          ],
          time: "Continuous"
        },
        {
          step: 4,
          title: "Severe Hypothermia",
          actions: [
            "Minimize movement",
            "Warm IV fluids",
            "Consider active rewarming",
            "Prepare for cardiac arrest"
          ],
          time: "If core temp <90°F"
        }
      ],
      medications: [
        { name: "Warm Normal Saline", dose: "250-500mL", route: "IV", frequency: "Warmed to 104°F" },
        { name: "Thiamine", dose: "100mg", route: "IV", frequency: "Before dextrose" }
      ],
      contraindications: ["Active rewarming in severe cases without hospital capability"],
      notes: "Handle gently - hypothermic hearts are irritable. Rewarm gradually."
    },
    {
      id: "poisoning",
      title: "Poisoning/Toxic Exposure",
      category: "Toxicological",
      priority: "High",
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "red",
      overview: "Management of poisoning and toxic exposures",
      steps: [
        {
          step: 1,
          title: "Scene Safety",
          actions: [
            "Identify the toxin",
            "Ensure scene safety",
            "Use PPE if needed",
            "Remove patient from exposure"
          ],
          time: "Before patient contact"
        },
        {
          step: 2,
          title: "Decontamination",
          actions: [
            "Remove contaminated clothing",
            "Irrigate skin/eyes if chemical",
            "Do not induce vomiting",
            "Activated charcoal if indicated"
          ],
          time: "Immediate"
        },
        {
          step: 3,
          title: "Supportive Care",
          actions: [
            "Airway management",
            "IV access",
            "Cardiac monitoring",
            "Treat symptoms"
          ],
          time: "Ongoing"
        },
        {
          step: 4,
          title: "Specific Antidotes",
          actions: [
            "Naloxone for opioids",
            "Flumazenil for benzos (caution)",
            "Contact poison control",
            "Bring substance/container"
          ],
          time: "If specific antidote available"
        }
      ],
      medications: [
        { name: "Activated Charcoal", dose: "1g/kg", route: "Oral", frequency: "If recent ingestion" },
        { name: "Naloxone", dose: "0.4-2mg", route: "IV/IM", frequency: "For opioids" },
        { name: "Atropine", dose: "1-2mg", route: "IV", frequency: "For organophosphates" }
      ],
      contraindications: ["Caustic ingestion", "Hydrocarbon ingestion", "Altered mental status"],
      notes: "Contact poison control: 1-800-222-1222. Bring substance container to hospital."
    }
  ];

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.overview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || protocol.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(protocols.map(p => p.category))];

  const getPriorityColor = (priority) => {
    const colors = {
      "Critical": "bg-red-100 text-red-700 border-red-200",
      "High": "bg-orange-100 text-orange-700 border-orange-200",
      "Medium": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Low": "bg-green-100 text-green-700 border-green-200"
    };
    return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getProtocolColor = (color) => {
    const colors = {
      red: "from-red-500 to-red-600",
      blue: "from-blue-500 to-blue-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
      yellow: "from-yellow-500 to-yellow-600",
      green: "from-green-500 to-green-600",
      cyan: "from-cyan-500 to-cyan-600",
      indigo: "from-indigo-500 to-indigo-600"
    };
    return colors[color] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search protocols by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProtocols.map((protocol) => (
          <div key={protocol.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
            {/* Protocol Header */}
            <div className={`bg-gradient-to-r ${getProtocolColor(protocol.color)} p-6 text-white`}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  {protocol.icon}
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(protocol.priority)} bg-white`}>
                  {protocol.priority === "Critical" && <AlertTriangle className="w-3 h-3" />}
                  {protocol.priority}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{protocol.title}</h3>
              <p className="text-sm opacity-90">{protocol.overview}</p>
            </div>

            {/* Quick Steps */}
            <div className="p-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Quick Steps
              </h4>
              <div className="space-y-2">
                {protocol.steps.slice(0, 3).map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{step.title}</p>
                      <p className="text-gray-600 text-xs">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setExpandedProtocol(expandedProtocol === protocol.id ? null : protocol.id)}
                className="w-full mt-4 bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                {expandedProtocol === protocol.id ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    View Full Protocol
                  </>
                )}
              </button>
            </div>

            {/* Expanded Protocol Details */}
            {expandedProtocol === protocol.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                {/* Detailed Steps */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-4">Detailed Steps</h4>
                  <div className="space-y-4">
                    {protocol.steps.map((step, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {step.step}
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-900">{step.title}</h5>
                            <p className="text-sm text-blue-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {step.time}
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-1">
                          {step.actions.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-purple-600" />
                    Medications
                  </h4>
                  <div className="space-y-3">
                    {protocol.medications.map((med, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-purple-200">
                        <div className="grid md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="font-semibold text-purple-900">{med.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Dose: <span className="font-medium text-gray-900">{med.dose}</span></p>
                          </div>
                          <div>
                            <p className="text-gray-600">Route: <span className="font-medium text-gray-900">{med.route}</span></p>
                          </div>
                          <div>
                            <p className="text-gray-600">Frequency: <span className="font-medium text-gray-900">{med.frequency}</span></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contraindications */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Contraindications
                  </h4>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <ul className="space-y-1">
                      {protocol.contraindications.map((contraindication, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-red-800">
                          <AlertTriangle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                          {contraindication}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Important Notes */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Important Notes
                  </h4>
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <p className="text-yellow-800 text-sm">{protocol.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Emergency Contact Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Phone className="w-6 h-6 text-blue-600" />
          Emergency Contacts
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-red-900">Poison Control</h4>
            <p className="text-red-700 font-mono">1-800-222-1222</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-blue-900">Medical Control</h4>
            <p className="text-blue-700 font-mono">555-MED-CTRL</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-green-900">Dispatch</h4>
            <p className="text-green-700 font-mono">555-DISPATCH</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-purple-900">Trauma Center</h4>
            <p className="text-purple-700 font-mono">555-TRAUMA</p>
          </div>
        </div>
      </div>

      {/* Protocol Summary Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {protocols.filter(p => p.priority === "Critical").length}
              </div>
            </div>
          </div>
          <div className="text-gray-600 font-medium">Critical Protocols</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <Heart className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {protocols.filter(p => p.category === "Cardiac").length}
              </div>
            </div>
          </div>
          <div className="text-gray-600 font-medium">Cardiac Protocols</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <Brain className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {protocols.filter(p => p.category === "Neurological").length}
              </div>
            </div>
          </div>
          <div className="text-gray-600 font-medium">Neurological</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{protocols.length}</div>
            </div>
          </div>
          <div className="text-gray-600 font-medium">Total Protocols</div>
        </div>
      </div>
    </div>
  );
}