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
  AlertCircle,
  Activity,
  FileText,
  CreditCard,
  BarChart3,
  Plus,
  ArrowRight,
  Bell,
  Star
} from "lucide-react";

const roleCards = [
  {
    role: "admin",
    title: "System Administration",
    description: "Manage users, roles, and system-wide settings with comprehensive oversight.",
    icon: <Users className="w-8 h-8" />,
    color: "from-blue-500 to-blue-600",
    bgPattern: "bg-gradient-to-br from-blue-50 to-blue-100",
    stats: [
      { label: "Total Users", value: "1,247", icon: <Users className="w-4 h-4" />, change: "+12%" },
      { label: "Active Sessions", value: "89", icon: <TrendingUp className="w-4 h-4" />, change: "+5%" },
      { label: "System Health", value: "98%", icon: <CheckCircle className="w-4 h-4" />, change: "+2%" }
    ],
    quickActions: [
      { label: "Add User", href: "/admin/users/create", icon: <Plus className="w-4 h-4" /> },
      { label: "View Reports", href: "/admin/reports", icon: <BarChart3 className="w-4 h-4" /> },
      { label: "System Settings", href: "/admin/settings", icon: <CheckCircle className="w-4 h-4" /> }
    ]
  },
  {
    role: "doctor",
    title: "Medical Practice",
    description: "Access patient records, manage appointments, and provide comprehensive care.",
    icon: <Stethoscope className="w-8 h-8" />,
    color: "from-emerald-500 to-emerald-600",
    bgPattern: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    stats: [
      { label: "Today's Appointments", value: "12", icon: <Calendar className="w-4 h-4" />, change: "+3" },
      { label: "Pending Reviews", value: "5", icon: <ClipboardCheck className="w-4 h-4" />, change: "-2" },
      { label: "Patients This Week", value: "47", icon: <Users className="w-4 h-4" />, change: "+8%" }
    ],
    quickActions: [
      { label: "View Schedule", href: "/doctor/timeslots", icon: <Calendar className="w-4 h-4" /> },
      { label: "Patient Records", href: "/patient/list", icon: <FileText className="w-4 h-4" /> },
      { label: "Test Results", href: "/results/doctor", icon: <FlaskConical className="w-4 h-4" /> }
    ]
  },
  {
    role: "receptionist",
    title: "Patient Services",
    description: "Efficiently manage patient check-ins and appointment scheduling.",
    icon: <ClipboardCheck className="w-8 h-8" />,
    color: "from-amber-500 to-amber-600",
    bgPattern: "bg-gradient-to-br from-amber-50 to-amber-100",
    stats: [
      { label: "Check-ins Today", value: "34", icon: <CheckCircle className="w-4 h-4" />, change: "+6" },
      { label: "Pending Arrivals", value: "8", icon: <Clock className="w-4 h-4" />, change: "0" },
      { label: "Appointments Scheduled", value: "156", icon: <Calendar className="w-4 h-4" />, change: "+12%" }
    ],
    quickActions: [
      { label: "Check-in Patients", href: "/receptionist/appointments", icon: <CheckCircle className="w-4 h-4" /> },
      { label: "Schedule Appointment", href: "/appointments/create", icon: <Plus className="w-4 h-4" /> },
      { label: "Patient Queue", href: "/receptionist/queue", icon: <Users className="w-4 h-4" /> }
    ]
  },
  {
    role: "nurse",
    title: "Patient Care",
    description: "Monitor vital signs and provide essential nursing care to patients.",
    icon: <HeartPulse className="w-8 h-8" />,
    color: "from-pink-500 to-pink-600",
    bgPattern: "bg-gradient-to-br from-pink-50 to-pink-100",
    stats: [
      { label: "Vitals Recorded", value: "28", icon: <HeartPulse className="w-4 h-4" />, change: "+4" },
      { label: "Patients Monitored", value: "15", icon: <Users className="w-4 h-4" />, change: "+2" },
      { label: "Critical Alerts", value: "2", icon: <AlertCircle className="w-4 h-4" />, change: "-1" }
    ],
    quickActions: [
      { label: "Record Vitals", href: "/nurse/vitals", icon: <HeartPulse className="w-4 h-4" /> },
      { label: "Patient Monitoring", href: "/nurse/monitoring", icon: <Activity className="w-4 h-4" /> },
      { label: "Medication Schedule", href: "/nurse/medications", icon: <Clock className="w-4 h-4" /> }
    ]
  },
  {
    role: "patient",
    title: "Personal Health",
    description: "View your medical records, schedule appointments, and track your health journey.",
    icon: <Users className="w-8 h-8" />,
    color: "from-purple-500 to-purple-600",
    bgPattern: "bg-gradient-to-br from-purple-50 to-purple-100",
    stats: [
      { label: "Upcoming Appointments", value: "2", icon: <Calendar className="w-4 h-4" />, change: "+1" },
      { label: "Test Results", value: "3", icon: <FlaskConical className="w-4 h-4" />, change: "New" },
      { label: "Health Score", value: "85%", icon: <TrendingUp className="w-4 h-4" />, change: "+3%" }
    ],
    quickActions: [
      { label: "Book Appointment", href: "/patient/appointments", icon: <Plus className="w-4 h-4" /> },
      { label: "View Records", href: "/diagnosis", icon: <FileText className="w-4 h-4" /> },
      { label: "Pay Bills", href: "/bills/my", icon: <CreditCard className="w-4 h-4" /> }
    ]
  },
  {
    role: "labtech",
    title: "Laboratory Operations",
    description: "Process samples, manage test results, and ensure quality laboratory services.",
    icon: <FlaskConical className="w-8 h-8" />,
    color: "from-cyan-500 to-cyan-600",
    bgPattern: "bg-gradient-to-br from-cyan-50 to-cyan-100",
    stats: [
      { label: "Samples Processed", value: "67", icon: <FlaskConical className="w-4 h-4" />, change: "+12" },
      { label: "Pending Results", value: "12", icon: <Clock className="w-4 h-4" />, change: "-3" },
      { label: "Quality Score", value: "99.2%", icon: <CheckCircle className="w-4 h-4" />, change: "+0.1%" }
    ],
    quickActions: [
      { label: "Process Samples", href: "/tests/collect", icon: <FlaskConical className="w-4 h-4" /> },
      { label: "Record Results", href: "/results/register", icon: <FileText className="w-4 h-4" /> },
      { label: "Quality Control", href: "/tests/turnaround", icon: <BarChart3 className="w-4 h-4" /> }
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
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{session.user.name}</span>
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                      <Star className="w-3 h-3 mr-1" />
                      {userRole}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">Ready to make a difference today</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Today&apos;s Date</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {roleCard && (
          <>
            {/* Enhanced Role-specific Card */}
            <div className={`bg-gradient-to-r ${roleCard.color} rounded-3xl p-8 text-white mb-8 shadow-2xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-sm shadow-lg">
                    {roleCard.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{roleCard.title}</h2>
                    <p className="text-lg opacity-90 max-w-md">{roleCard.description}</p>
                  </div>
                </div>
                <div className="hidden lg:block text-right">
                  <p className="text-sm opacity-75 mb-1">Your Impact</p>
                  <p className="text-3xl font-bold">Outstanding</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-yellow-300" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {roleCard.stats.map((stat, index) => (
                {(session?.user.role === "dispatcher" ? emergencyStats : stats).map((stat, index) => (
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${roleCard.color} text-white group-hover:scale-110 transition-transform`}>
                      {stat.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                  <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${roleCard.color} rounded-full transition-all duration-1000`} style={{ width: '75%' }}></div>
                  </div>
                )
                )
                }
                </div>
              ))}
            </div>

            {/* Enhanced Quick Actions */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-gradient-to-r ${roleCard.color} text-white`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roleCard.quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className="group p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center gap-3 hover:transform hover:scale-105"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                      {action.icon}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{action.label}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 inline ml-2 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[
                    { action: "Appointment completed", time: "2 hours ago", type: "success" },
                    { action: "Test results reviewed", time: "4 hours ago", type: "info" },
                    { action: "Patient checked in", time: "6 hours ago", type: "warning" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  {[
                    { message: "New test results available", priority: "high" },
                    { message: "Appointment reminder for tomorrow", priority: "medium" },
                    { message: "System maintenance scheduled", priority: "low" },
                  ].map((notification, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${
                        notification.priority === 'high' ? 'bg-red-500' :
                        notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <p className="text-sm text-gray-700 flex-1">{notification.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default withAuth(Dashboard, ["admin", "doctor", "nurse", "receptionist", "patient", "labtech", "dispatcher"]);