"use client";
import { useSession } from "next-auth/react";
import withAuth from "@/hoc/withAuth";
import Loader from "@/components/loader";
import { 
  Users, 
  Calendar, 
  ClipboardCheck, 
  HeartPulse, 
  FlaskConical, 
  Stethoscope,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const roleCards = [
  {
    role: "admin",
    title: "System Administration",
    description: "Manage users, roles, and system-wide settings with comprehensive oversight.",
    icon: <Users className="w-8 h-8" />,
    color: "from-blue-500 to-blue-600",
    stats: [
      { label: "Total Users", value: "1,247", icon: <Users className="w-4 h-4" /> },
      { label: "Active Sessions", value: "89", icon: <TrendingUp className="w-4 h-4" /> },
      { label: "System Health", value: "98%", icon: <CheckCircle className="w-4 h-4" /> }
    ]
  },
  {
    role: "doctor",
    title: "Medical Practice",
    description: "Access patient records, manage appointments, and provide comprehensive care.",
    icon: <Stethoscope className="w-8 h-8" />,
    color: "from-emerald-500 to-emerald-600",
    stats: [
      { label: "Today's Appointments", value: "12", icon: <Calendar className="w-4 h-4" /> },
      { label: "Pending Reviews", value: "5", icon: <ClipboardCheck className="w-4 h-4" /> },
      { label: "Patients This Week", value: "47", icon: <Users className="w-4 h-4" /> }
    ]
  },
  {
    role: "receptionist",
    title: "Patient Services",
    description: "Efficiently manage patient check-ins and appointment scheduling.",
    icon: <ClipboardCheck className="w-8 h-8" />,
    color: "from-amber-500 to-amber-600",
    stats: [
      { label: "Check-ins Today", value: "34", icon: <CheckCircle className="w-4 h-4" /> },
      { label: "Pending Arrivals", value: "8", icon: <Clock className="w-4 h-4" /> },
      { label: "Appointments Scheduled", value: "156", icon: <Calendar className="w-4 h-4" /> }
    ]
  },
  {
    role: "nurse",
    title: "Patient Care",
    description: "Monitor vital signs and provide essential nursing care to patients.",
    icon: <HeartPulse className="w-8 h-8" />,
    color: "from-pink-500 to-pink-600",
    stats: [
      { label: "Vitals Recorded", value: "28", icon: <HeartPulse className="w-4 h-4" /> },
      { label: "Patients Monitored", value: "15", icon: <Users className="w-4 h-4" /> },
      { label: "Critical Alerts", value: "2", icon: <AlertCircle className="w-4 h-4" /> }
    ]
  },
  {
    role: "patient",
    title: "Personal Health",
    description: "View your medical records, schedule appointments, and track your health journey.",
    icon: <Users className="w-8 h-8" />,
    color: "from-purple-500 to-purple-600",
    stats: [
      { label: "Upcoming Appointments", value: "2", icon: <Calendar className="w-4 h-4" /> },
      { label: "Test Results", value: "3", icon: <FlaskConical className="w-4 h-4" /> },
      { label: "Health Score", value: "85%", icon: <TrendingUp className="w-4 h-4" /> }
    ]
  },
  {
    role: "labtech",
    title: "Laboratory Operations",
    description: "Process samples, manage test results, and ensure quality laboratory services.",
    icon: <FlaskConical className="w-8 h-8" />,
    color: "from-cyan-500 to-cyan-600",
    stats: [
      { label: "Samples Processed", value: "67", icon: <FlaskConical className="w-4 h-4" /> },
      { label: "Pending Results", value: "12", icon: <Clock className="w-4 h-4" /> },
      { label: "Quality Score", value: "99.2%", icon: <CheckCircle className="w-4 h-4" /> }
    ]
  },
];

function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Loader />;

  if (!session || !session.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Error</h2>
          <p className="text-gray-600">Unable to load user information</p>
        </div>
      </div>
    );
  }

  const userRole = session.user.role;
  const roleCard = roleCards.find(card => card.role === userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{session.user.name}</span>
              </h1>
              <p className="text-lg text-gray-600 flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                  {userRole}
                </span>
                Ready to make a difference today
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Today's Date</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {roleCard && (
          <>
            {/* Role-specific Card */}
            <div className={`bg-gradient-to-r ${roleCard.color} rounded-2xl p-8 text-white mb-8 shadow-xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    {roleCard.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{roleCard.title}</h2>
                    <p className="text-lg opacity-90 max-w-md">{roleCard.description}</p>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="text-right">
                    <p className="text-sm opacity-75 mb-1">Your Impact</p>
                    <p className="text-3xl font-bold">Outstanding</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {roleCard.stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${roleCard.color} text-white`}>
                      {stat.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${roleCard.color} text-white`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Role-specific quick actions would go here */}
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 flex flex-col items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm font-medium">Schedule</span>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 flex flex-col items-center gap-2">
                  <ClipboardCheck className="w-6 h-6" />
                  <span className="text-sm font-medium">Records</span>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 flex flex-col items-center gap-2">
                  <FlaskConical className="w-6 h-6" />
                  <span className="text-sm font-medium">Tests</span>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 flex flex-col items-center gap-2">
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-medium">Patients</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default withAuth(Dashboard, ["admin", "doctor", "nurse", "receptionist", "patient", "labtech"]);