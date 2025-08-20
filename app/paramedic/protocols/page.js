"use client";
import { useState } from "react";
import withAuth from "@/hoc/withAuth";
import { 
  FileText, 
  Heart, 
  Brain, 
  Lungs, 
  Shield, 
  Zap, 
  Thermometer,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  Phone,
  Star,
  Activity,
  Pill,
  Stethoscope,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";

function MedicalProtocols() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [expandedProtocol, setExpandedProtocol] = useState(null);

  const protocols = [
    {
      id: "cardiac-arrest",
      name: "Cardiac Arrest",
      category: "Critical",
      priority: "Critical",
      icon: <Heart className="w-6 h-6" />,
      color: "red",
      description: "Complete cardiac arrest management protocol",
      steps: [
        { time: "0-30 sec", action: "Verify unresponsiveness and absence of pulse", critical: true },
        { time: "30 sec", action: "Begin high-quality CPR (30:2 ratio)", critical: true },
        { time: "1 min", action: "Apply AED/defibrillator pads", critical: true },
        { time: "2 min", action: "Analyze rhythm - shock if indicated", critical: true },
        { time: "2-4 min", action: "Continue CPR cycles", critical: false },
        { time: "4 min", action: "Establish IV/IO access", critical: false },
        { time: "5 min", action: "Administer Epinephrine 1mg IV/IO", critical: true },
        { time: "7 min", action: "Consider advanced airway", critical: false },
        { time: "Every 3-5 min", action: "Repeat Epinephrine 1mg", critical: true }
      ],
      medications: [
        { name: "Epinephrine", dose: "1mg", route: "IV/IO", frequency: "Every 3-5 minutes" },
        { name: "Amiodarone", dose: "300mg", route: "IV/IO", frequency: "Once, then 150mg" },
        { name: "Atropine", dose: "1mg", route: "IV/IO", frequency: "For asystole/PEA" }
      ],
      contraindications: ["Do not delay CPR for IV access", "Minimize interruptions"],
      notes: "Follow ACLS guidelines. Consider reversible causes (H's and T's)"
    },
    {
      id: "stroke",
      name: "Stroke Assessment",
      category: "Critical",
      priority: "Critical",
      icon: <Brain className="w-6 h-6" />,
      color: "purple",
      description: "Acute stroke evaluation and management",
      steps: [
        { time: "0-2 min", action: "Perform FAST assessment", critical: true },
        { time: "2-5 min", action: "Check blood glucose level", critical: true },
        { time: "5-8 min", action: "Obtain baseline vitals and neurological exam", critical: false },
        { time: "8-10 min", action: "Establish IV access (large bore)", critical: false },
        { time: "10-15 min", action: "Complete stroke scale assessment", critical: true },
        { time: "Ongoing", action: "Monitor airway and breathing", critical: true },
        { time: "Transport", action: "Notify receiving hospital - stroke alert", critical: true }
      ],
      medications: [
        { name: "Dextrose", dose: "25g", route: "IV", frequency: "If glucose <60mg/dL" },
        { name: "Thiamine", dose: "100mg", route: "IV", frequency: "Before dextrose if indicated" }
      ],
      contraindications: ["No aspirin if hemorrhagic stroke suspected", "Avoid excessive fluids"],
      notes: "Time is brain. Target door-to-needle time <60 minutes. Document exact time of symptom onset."
    },
    {
      id: "chest-pain",
      name: "Chest Pain/ACS",
      category: "Critical",
      priority: "High",
      icon: <Heart className="w-6 h-6" />,
      color: "red",
      description: "Acute coronary syndrome management",
      steps: [
        { time: "0-2 min", action: "Obtain 12-lead ECG", critical: true },
        { time: "2-5 min", action: "Administer oxygen if SpO2 <90%", critical: false },
        { time: "5 min", action: "Give aspirin 324mg chewed", critical: true },
        { time: "5-8 min", action: "Establish IV access", critical: false },
        { time: "8-10 min", action: "Administer nitroglycerin if indicated", critical: false },
        { time: "10-15 min", action: "Consider morphine for pain relief", critical: false },
        { time: "Transport", action: "Transmit 12-lead to receiving hospital", critical: true }
      ],
      medications: [
        { name: "Aspirin", dose: "324mg", route: "Oral (chewed)", frequency: "Once" },
        { name: "Nitroglycerin", dose: "0.4mg", route: "Sublingual", frequency: "Every 5 min x3" },
        { name: "Morphine", dose: "2-4mg", route: "IV", frequency: "Every 5-15 min PRN" }
      ],
      contraindications: ["No nitrates if systolic BP <90mmHg", "No aspirin if allergy"],
      notes: "Obtain serial 12-leads. Consider STEMI activation criteria."
    },
    {
      id: "respiratory-distress",
      name: "Respiratory Distress",
      category: "Emergency",
      priority: "High",
      icon: <Lungs className="w-6 h-6" />,
      color: "blue",
      description: "Acute respiratory failure management",
      steps: [
        { time: "0-1 min", action: "Position patient upright", critical: true },
        { time: "1-2 min", action: "Administer high-flow oxygen", critical: true },
        { time: "2-5 min", action: "Assess for wheezing - give albuterol", critical: false },
        { time: "5-8 min", action: "Establish IV access", critical: false },
        { time: "8-10 min", action: "Consider CPAP if indicated", critical: false },
        { time: "10-15 min", action: "Prepare for intubation if deteriorating", critical: true }
      ],
      medications: [
        { name: "Albuterol", dose: "2.5mg", route: "Nebulized", frequency: "Every 20 min" },
        { name: "Ipratropium", dose: "0.5mg", route: "Nebulized", frequency: "With albuterol" },
        { name: "Methylprednisolone", dose: "125mg", route: "IV", frequency: "Once" }
      ],
      contraindications: ["Avoid CPAP in vomiting patients", "Monitor for pneumothorax"],
      notes: "Consider CHF vs COPD vs asthma. Assess for bilateral breath sounds."
    },
    {
      id: "trauma-assessment",
      name: "Trauma Assessment",
      category: "Trauma",
      priority: "High",
      icon: <Shield className="w-6 h-6" />,
      color: "orange",
      description: "Primary and secondary trauma survey",
      steps: [
        { time: "0-2 min", action: "Primary survey: ABCDE", critical: true },
        { time: "2-5 min", action: "Control major bleeding", critical: true },
        { time: "5-8 min", action: "Spinal immobilization if indicated", critical: true },
        { time: "8-12 min", action: "Establish IV access (2 large bore)", critical: false },
        { time: "12-15 min", action: "Secondary survey: head to toe", critical: false },
        { time: "15-20 min", action: "Splint fractures", critical: false },
        { time: "Transport", action: "Trauma center notification", critical: true }
      ],
      medications: [
        { name: "Morphine", dose: "2-4mg", route: "IV", frequency: "Every 5-10 min PRN" },
        { name: "Normal Saline", dose: "250-500mL", route: "IV", frequency: "Bolus PRN" },
        { name: "TXA", dose: "1g", route: "IV", frequency: "If major bleeding" }
      ],
      contraindications: ["Avoid fluid overload in penetrating trauma", "No narcotics if head injury"],
      notes: "Mechanism of injury guides assessment. Consider trauma center transport."
    },
    {
      id: "allergic-reaction",
      name: "Allergic Reaction/Anaphylaxis",
      category: "Emergency",
      priority: "High",
      icon: <Shield className="w-6 h-6" />,
      color: "yellow",
      description: "Severe allergic reaction management",
      steps: [
        { time: "0-1 min", action: "Remove/avoid allergen if possible", critical: true },
        { time: "1-2 min", action: "Assess airway and breathing", critical: true },
        { time: "2-3 min", action: "Administer epinephrine if anaphylaxis", critical: true },
        { time: "3-5 min", action: "Establish IV access", critical: false },
        { time: "5-8 min", action: "Give diphenhydramine and steroids", critical: false },
        { time: "8-10 min", action: "Monitor for biphasic reaction", critical: true }
      ],
      medications: [
        { name: "Epinephrine", dose: "0.3-0.5mg", route: "IM", frequency: "Every 5-15 min PRN" },
        { name: "Diphenhydramine", dose: "25-50mg", route: "IV/IM", frequency: "Once" },
        { name: "Methylprednisolone", dose: "125mg", route: "IV", frequency: "Once" },
        { name: "Albuterol", dose: "2.5mg", route: "Nebulized", frequency: "If bronchospasm" }
      ],
      contraindications: ["Monitor for cardiovascular effects of epinephrine"],
      notes: "Anaphylaxis = systemic reaction with airway/breathing/circulation compromise"
    },
    {
      id: "seizure",
      name: "Seizure Management",
      category: "Emergency",
      priority: "Medium",
      icon: <Brain className="w-6 h-6" />,
      color: "purple",
      description: "Active seizure and post-ictal management",
      steps: [
        { time: "0-1 min", action: "Protect airway and prevent injury", critical: true },
        { time: "1-2 min", action: "Position on side if possible", critical: true },
        { time: "2-5 min", action: "Check blood glucose", critical: true },
        { time: "5 min", action: "If seizure >5 min, give benzodiazepine", critical: true },
        { time: "5-8 min", action: "Establish IV access", critical: false },
        { time: "Post-ictal", action: "Monitor airway and vitals", critical: true }
      ],
      medications: [
        { name: "Lorazepam", dose: "2-4mg", route: "IV", frequency: "May repeat once" },
        { name: "Midazolam", dose: "5-10mg", route: "IM", frequency: "If no IV access" },
        { name: "Dextrose", dose: "25g", route: "IV", frequency: "If glucose <60mg/dL" }
      ],
      contraindications: ["Avoid restraining during seizure", "Monitor respiratory depression"],
      notes: "Status epilepticus = seizure >5 minutes or repeated seizures without recovery"
    },
    {
      id: "diabetic-emergency",
      name: "Diabetic Emergency",
      category: "Emergency",
      priority: "Medium",
      icon: <Zap className="w-6 h-6" />,
      color: "green",
      description: "Hypoglycemia and DKA management",
      steps: [
        { time: "0-2 min", action: "Check blood glucose level", critical: true },
        { time: "2-5 min", action: "If glucose <60mg/dL, give dextrose", critical: true },
        { time: "5-8 min", action: "If conscious, give oral glucose", critical: false },
        { time: "8-10 min", action: "Establish IV if unconscious", critical: false },
        { time: "10-15 min", action: "Reassess glucose and mental status", critical: true },
        { time: "DKA", action: "Fluid resuscitation, consider transport", critical: true }
      ],
      medications: [
        { name: "Dextrose 50%", dose: "25g (50mL)", route: "IV", frequency: "May repeat" },
        { name: "Glucagon", dose: "1mg", route: "IM", frequency: "If no IV access" },
        { name: "Normal Saline", dose: "250-500mL", route: "IV", frequency: "For DKA" }
      ],
      contraindications: ["Don't give dextrose without checking glucose first"],
      notes: "Hypoglycemia <60mg/dL. DKA signs: fruity breath, Kussmaul breathing, dehydration"
    },
    {
      id: "overdose",
      name: "Drug Overdose",
      category: "Emergency",
      priority: "High",
      icon: <Pill className="w-6 h-6" />,
      color: "red",
      description: "Opioid and general overdose management",
      steps: [
        { time: "0-1 min", action: "Assess airway, breathing, circulation", critical: true },
        { time: "1-2 min", action: "Administer naloxone if opioid suspected", critical: true },
        { time: "2-5 min", action: "Provide ventilatory support", critical: true },
        { time: "5-8 min", action: "Establish IV access", critical: false },
        { time: "8-10 min", action: "Repeat naloxone if no response", critical: true },
        { time: "Ongoing", action: "Monitor for re-sedation", critical: true }
      ],
      medications: [
        { name: "Naloxone", dose: "0.4-2mg", route: "IV/IM/Intranasal", frequency: "Every 2-3 min" },
        { name: "Flumazenil", dose: "0.2mg", route: "IV", frequency: "For benzodiazepines (caution)" }
      ],
      contraindications: ["Flumazenil contraindicated in chronic benzo users", "Monitor for withdrawal"],
      notes: "Naloxone duration 30-90 min. May need multiple doses. Contact poison control."
    },
    {
      id: "burns",
      name: "Burn Management",
      category: "Trauma",
      priority: "Medium",
      icon: <Thermometer className="w-6 h-6" />,
      color: "orange",
      description: "Thermal, chemical, and electrical burn care",
      steps: [
        { time: "0-2 min", action: "Stop burning process, remove from source", critical: true },
        { time: "2-5 min", action: "Cool burn with room temperature water", critical: true },
        { time: "5-10 min", action: "Assess burn size and depth", critical: false },
        { time: "10-15 min", action: "Establish IV access for >20% BSA", critical: false },
        { time: "15-20 min", action: "Cover with sterile dressings", critical: false },
        { time: "20-25 min", action: "Pain management", critical: false }
      ],
      medications: [
        { name: "Morphine", dose: "2-4mg", route: "IV", frequency: "Every 5-10 min PRN" },
        { name: "Normal Saline", dose: "Parkland formula", route: "IV", frequency: "Continuous" }
      ],
      contraindications: ["No ice on burns", "No topical anesthetics on large burns"],
      notes: "Parkland formula: 4mL x weight(kg) x %BSA burned over 24 hours"
    },
    {
      id: "hypothermia",
      name: "Hypothermia",
      category: "Environmental",
      priority: "Medium",
      icon: <Thermometer className="w-6 h-6" />,
      color: "blue",
      description: "Severe hypothermia management",
      steps: [
        { time: "0-2 min", action: "Remove from cold environment", critical: true },
        { time: "2-5 min", action: "Handle gently - risk of VF", critical: true },
        { time: "5-8 min", action: "Remove wet clothing", critical: true },
        { time: "8-12 min", action: "Begin passive rewarming", critical: false },
        { time: "12-15 min", action: "Establish IV with warmed fluids", critical: false },
        { time: "Ongoing", action: "Monitor cardiac rhythm", critical: true }
      ],
      medications: [
        { name: "Warm Normal Saline", dose: "250-500mL", route: "IV", frequency: "Warmed to 40°C" }
      ],
      contraindications: ["Avoid active rewarming in field", "Handle very gently"],
      notes: "Core temp <32°C = severe. May appear dead but continue resuscitation until warm."
    },
    {
      id: "poisoning",
      name: "Poisoning/Toxic Exposure",
      category: "Environmental",
      priority: "High",
      icon: <Shield className="w-6 h-6" />,
      color: "green",
      description: "Toxic exposure and poisoning management",
      steps: [
        { time: "0-1 min", action: "Ensure scene safety", critical: true },
        { time: "1-3 min", action: "Identify poison if possible", critical: true },
        { time: "3-5 min", action: "Contact poison control center", critical: true },
        { time: "5-8 min", action: "Decontamination if indicated", critical: false },
        { time: "8-12 min", action: "Supportive care and monitoring", critical: true },
        { time: "Transport", action: "Bring poison container/sample", critical: false }
      ],
      medications: [
        { name: "Activated Charcoal", dose: "1g/kg", route: "Oral", frequency: "If indicated" },
        { name: "Naloxone", dose: "0.4-2mg", route: "IV/IM", frequency: "For opioids" }
      ],
      contraindications: ["No charcoal for caustics or hydrocarbons", "No induced vomiting"],
      notes: "Poison Control: 1-800-222-1222. Bring poison container to hospital."
    },
    {
      id: "behavioral-emergency",
      name: "Behavioral Emergency",
      category: "Psychiatric",
      priority: "Medium",
      icon: <Brain className="w-6 h-6" />,
      color: "purple",
      description: "Psychiatric emergency and agitation management",
      steps: [
        { time: "0-2 min", action: "Ensure scene safety", critical: true },
        { time: "2-5 min", action: "Attempt verbal de-escalation", critical: true },
        { time: "5-10 min", action: "Assess for medical causes", critical: true },
        { time: "10-15 min", action: "Physical restraints if danger to self/others", critical: false },
        { time: "15-20 min", action: "Chemical restraint if indicated", critical: false }
      ],
      medications: [
        { name: "Haloperidol", dose: "5-10mg", route: "IM", frequency: "Once" },
        { name: "Lorazepam", dose: "2-4mg", route: "IM/IV", frequency: "With haloperidol" },
        { name: "Midazolam", dose: "5-10mg", route: "IM", frequency: "Alternative" }
      ],
      contraindications: ["Avoid restraints if possible", "Monitor airway after sedation"],
      notes: "Rule out hypoglycemia, hypoxia, drug intoxication. Use least restrictive approach."
    },
    {
      id: "pediatric-emergency",
      name: "Pediatric Emergency",
      category: "Pediatric",
      priority: "High",
      icon: <Heart className="w-6 h-6" />,
      color: "pink",
      description: "Pediatric emergency management protocols",
      steps: [
        { time: "0-1 min", action: "Assess using pediatric triangle", critical: true },
        { time: "1-3 min", action: "Weight-based medication calculations", critical: true },
        { time: "3-5 min", action: "Age-appropriate equipment selection", critical: true },
        { time: "5-8 min", action: "Family-centered care approach", critical: false },
        { time: "8-12 min", action: "Continuous reassessment", critical: true }
      ],
      medications: [
        { name: "Epinephrine", dose: "0.01mg/kg", route: "IM", frequency: "Max 0.3mg" },
        { name: "Albuterol", dose: "0.15mg/kg", route: "Nebulized", frequency: "Min 2.5mg" },
        { name: "Dextrose", dose: "0.5-1g/kg", route: "IV", frequency: "D25 or D10" }
      ],
      contraindications: ["Avoid adult doses", "Consider developmental stage"],
      notes: "Weight estimation: (Age + 4) x 2 = weight in kg. Use length-based tape when available."
    },
    {
      id: "obstetric-emergency",
      name: "Obstetric Emergency",
      category: "Obstetric",
      priority: "High",
      icon: <Heart className="w-6 h-6" />,
      color: "pink",
      description: "Emergency delivery and obstetric complications",
      steps: [
        { time: "0-2 min", action: "Assess stage of labor", critical: true },
        { time: "2-5 min", action: "Prepare delivery kit if imminent", critical: true },
        { time: "5-8 min", action: "Position mother appropriately", critical: true },
        { time: "Delivery", action: "Support head, check for cord", critical: true },
        { time: "Post-delivery", action: "Dry and warm baby", critical: true },
        { time: "5-10 min", action: "Deliver placenta, control bleeding", critical: true }
      ],
      medications: [
        { name: "Oxytocin", dose: "10 units", route: "IM", frequency: "After delivery" },
        { name: "Epinephrine", dose: "0.01mg/kg", route: "IV", frequency: "Neonatal resuscitation" }
      ],
      contraindications: ["No oxytocin before delivery of baby and placenta"],
      notes: "If delivery imminent, prepare for field delivery. Newborn APGAR assessment."
    }
  ];

  const emergencyContacts = [
    { name: "Poison Control Center", number: "1-800-222-1222", description: "24/7 poison information" },
    { name: "Medical Control", number: "1-800-MED-CTRL", description: "Physician consultation" },
    { name: "Dispatch Center", number: "911", description: "Emergency coordination" },
    { name: "Trauma Center", number: "1-800-TRAUMA-1", description: "Specialized trauma care" },
    { name: "Burn Center", number: "1-800-BURN-CTR", description: "Severe burn management" },
    { name: "Stroke Center", number: "1-800-STROKE-1", description: "Acute stroke care" }
  ];

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || protocol.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getPriorityColor = (priority) => {
    const colors = {
      "Critical": "bg-red-100 text-red-700 border-red-200",
      "High": "bg-orange-100 text-orange-700 border-orange-200",
      "Medium": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Low": "bg-green-100 text-green-700 border-green-200"
    };
    return colors[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Critical": "from-red-500 to-red-600",
      "Emergency": "from-orange-500 to-orange-600",
      "Trauma": "from-yellow-500 to-yellow-600",
      "Environmental": "from-blue-500 to-blue-600",
      "Psychiatric": "from-purple-500 to-purple-600",
      "Pediatric": "from-pink-500 to-pink-600",
      "Obstetric": "from-rose-500 to-rose-600"
    };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Medical Protocols</h1>
            <p className="text-gray-600 text-xl">Comprehensive emergency medical treatment protocols</p>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-6 h-6 text-red-600" />
            Emergency Contacts
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="p-4 bg-red-50 rounded-xl border border-red-200 hover:bg-red-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-red-900">{contact.name}</h3>
                    <p className="text-red-700 text-sm">{contact.description}</p>
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    {contact.number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
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
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                >
                  <option value="">All Categories</option>
                  <option value="Critical">Critical</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Trauma">Trauma</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Psychiatric">Psychiatric</option>
                  <option value="Pediatric">Pediatric</option>
                  <option value="Obstetric">Obstetric</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Protocols Grid */}
        {filteredProtocols.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <FileText className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Protocols Found</h3>
            <p className="text-gray-600 text-lg">
              {searchTerm || categoryFilter ? "No protocols match your current filters." : "No protocols available."}
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredProtocols.map((protocol) => (
              <div key={protocol.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                {/* Protocol Header */}
                <div 
                  onClick={() => setExpandedProtocol(expandedProtocol === protocol.id ? null : protocol.id)}
                  className="p-8 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-20 h-20 bg-gradient-to-br ${getCategoryColor(protocol.category)} rounded-3xl flex items-center justify-center text-white shadow-lg`}>
                        {protocol.icon}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{protocol.name}</h2>
                        <p className="text-gray-600 text-lg">{protocol.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(protocol.priority)}`}>
                            <Star className="w-3 h-3" />
                            {protocol.priority}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{protocol.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {expandedProtocol === protocol.id ? (
                        <ChevronUp className="w-8 h-8" />
                      ) : (
                        <ChevronDown className="w-8 h-8" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Protocol Details */}
                {expandedProtocol === protocol.id && (
                  <div className="border-t border-gray-100">
                    {/* Steps */}
                    <div className="p-8 border-b border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-600" />
                        Treatment Steps
                      </h3>
                      <div className="space-y-4">
                        {protocol.steps.map((step, index) => (
                          <div key={index} className={`p-4 rounded-xl border-2 ${
                            step.critical 
                              ? "bg-red-50 border-red-200" 
                              : "bg-blue-50 border-blue-200"
                          }`}>
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                step.critical ? "bg-red-600" : "bg-blue-600"
                              }`}>
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className={`font-bold ${step.critical ? "text-red-700" : "text-blue-700"}`}>
                                    {step.time}
                                  </span>
                                  {step.critical && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                      <AlertTriangle className="w-3 h-3" />
                                      Critical
                                    </span>
                                  )}
                                </div>
                                <p className={`${step.critical ? "text-red-800" : "text-blue-800"} font-medium`}>
                                  {step.action}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Medications */}
                    <div className="p-8 border-b border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Pill className="w-6 h-6 text-purple-600" />
                        Medications
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {protocol.medications.map((med, index) => (
                          <div key={index} className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <h4 className="font-bold text-purple-900 mb-2">{med.name}</h4>
                            <div className="space-y-1 text-sm">
                              <p className="text-purple-700"><strong>Dose:</strong> {med.dose}</p>
                              <p className="text-purple-700"><strong>Route:</strong> {med.route}</p>
                              <p className="text-purple-700"><strong>Frequency:</strong> {med.frequency}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contraindications & Notes */}
                    <div className="p-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Contraindications
                          </h3>
                          <div className="space-y-2">
                            {protocol.contraindications.map((item, index) => (
                              <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-red-800 text-sm font-medium">{item}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-blue-600" />
                            Clinical Notes
                          </h3>
                          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <p className="text-blue-800 font-medium">{protocol.notes}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Protocol Summary Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Protocols", value: protocols.length, color: "blue", icon: <FileText className="w-6 h-6" /> },
            { label: "Critical Protocols", value: protocols.filter(p => p.priority === "Critical").length, color: "red", icon: <AlertTriangle className="w-6 h-6" /> },
            { label: "Emergency Protocols", value: protocols.filter(p => p.category === "Emergency").length, color: "orange", icon: <Activity className="w-6 h-6" /> },
            { label: "Trauma Protocols", value: protocols.filter(p => p.category === "Trauma").length, color: "yellow", icon: <Shield className="w-6 h-6" /> }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(MedicalProtocols, ["paramedic"]);