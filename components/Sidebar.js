"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Stethoscope,
  ClipboardList,
  LogOut,
  FileText,
  Users,
  CreditCard,
  ClipboardCheck,
  FilePlus,
  FileSearch,
  HeartPulse,
  UserCheck,
  FlaskConical,
  ScanLine,
  Activity,
  FolderKanban,
  ChevronRight,
  Truck,
  Wrench,
  Phone,
  Building,
  Bed,
  Sparkles,
  Shield,
} from "lucide-react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const logout = async () => await signOut({ callbackUrl: "/login" });

  const menuItems = {
    admin: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" />, color: "text-green-500" },
      { label: "Fleet Management", href: "/admin/fleet", icon: <Truck className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Fleet Tracking", href: "/fleet/tracking", icon: <Activity className="w-5 h-5" />, color: "text-green-500" },
      { label: "Maintenance", href: "/fleet/maintenance", icon: <Wrench className="w-5 h-5" />, color: "text-yellow-500" },
      { label: "Billing", href: "/admin/billing", icon: <CreditCard className="w-5 h-5" />, color: "text-purple-500" },
    ],
    doctor: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Admitted Patients", href: "/doctor/admitted-patients", icon: <Bed className="w-5 h-5" />, color: "text-red-500" },
      { label: "Infection Control", href: "/infection-control/dashboard", icon: <Shield className="w-5 h-5" />, color: "text-red-500" },
      { label: "Time Slots", href: "/doctor/timeslots", icon: <Calendar className="w-5 h-5" />, color: "text-indigo-500" },
      { label: "Appointments", href: "/appointments/", icon: <ClipboardList className="w-5 h-5" />, color: "text-emerald-500" },
      { label: "Diagnosis", href: "/diagnosis/", icon: <ClipboardCheck className="w-5 h-5" />, color: "text-orange-500" },
      { label: "Test Orders", href: "/tests/orders", icon: <FilePlus className="w-5 h-5" />, color: "text-cyan-500" },
      { label: "Test Results", href: "/results/doctor", icon: <FileSearch className="w-5 h-5" />, color: "text-pink-500" },
      { label: "Bills", href: "/bills/my", icon: <CreditCard className="w-5 h-5" />, color: "text-yellow-500" },
      { label: "Patients", href: "/patient/list", icon: <Users className="w-5 h-5" />, color: "text-teal-500" },
    ],
    driver: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Current Assignment", href: "/driver/assignment", icon: <Truck className="w-5 h-5" />, color: "text-orange-500" },
      { label: "Vehicle Check", href: "/driver/vehicle-check", icon: <ClipboardCheck className="w-5 h-5" />, color: "text-green-500" },
      { label: "Route History", href: "/driver/routes", icon: <Activity className="w-5 h-5" />, color: "text-purple-500" },
    ],
    paramedic: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Emergency Response", href: "/emergency/paramedic", icon: <HeartPulse className="w-5 h-5" />, color: "text-red-500" },
      { label: "Medical Protocols", href: "/paramedic/protocols", icon: <FileText className="w-5 h-5" />, color: "text-purple-500" },
      { label: "Equipment Check", href: "/paramedic/equipment", icon: <ClipboardCheck className="w-5 h-5" />, color: "text-green-500" },
      { label: "Patient Records", href: "/paramedic/patients", icon: <Users className="w-5 h-5" />, color: "text-teal-500" },
    ],
    er: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Incoming Patients", href: "/er/incoming", icon: <Users className="w-5 h-5" />, color: "text-red-500" },
      { label: "Patient Admission", href: "/er/admission", icon: <UserCheck className="w-5 h-5" />, color: "text-green-500" },
      { label: "ER Patients", href: "/er/patients", icon: <Users className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Patient Assessment", href: "/er/assessment", icon: <ClipboardCheck className="w-5 h-5" />, color: "text-green-500" },
      { label: "Handover Verification", href: "/er/handover", icon: <FileText className="w-5 h-5" />, color: "text-purple-500" },
      { label: "ER Dashboard", href: "/emergency/er", icon: <Activity className="w-5 h-5" />, color: "text-orange-500" },
      { label: "Bed Management", href: "/beds/management", icon: <ClipboardCheck className="w-5 h-5" />, color: "text-cyan-500" },
      { label: "Housekeeping", href: "/housekeeping/dashboard", icon: <ClipboardCheck className="w-5 h-5" />, color: "text-yellow-500" },
      { label: "Clinical Data", href: "/clinical/data-capture", icon: <Stethoscope className="w-5 h-5" />, color: "text-indigo-500" },
      { label: "Treatment Consent", href: "/clinical/consent", icon: <FileText className="w-5 h-5" />, color: "text-pink-500" },
    ],
    receptionist: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Check-in", href: "/receptionist/appointments", icon: <ClipboardCheck className="w-5 h-5" />, color: "text-green-500" },
      { label: "Bed Management", href: "/beds/management", icon: <ClipboardCheck className="w-5 h-5" />, color: "text-cyan-500" },
      { label: "Housekeeping", href: "/housekeeping/dashboard", icon: <ClipboardCheck className="w-5 h-5" />, color: "text-yellow-500" },
    ],
    nurse: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Record Vitals", href: "/nurse/vitals", icon: <HeartPulse className="w-5 h-5" />, color: "text-red-500" },
      { label: "Infection Control", href: "/infection-control/dashboard", icon: <Shield className="w-5 h-5" />, color: "text-red-500" },
      { label: "Bed Management", href: "/beds/management", icon: <ClipboardCheck className="w-5 h-5" />, color: "text-cyan-500" },
      { label: "Housekeeping", href: "/housekeeping/dashboard", icon: <ClipboardCheck className="w-5 h-5" />, color: "text-yellow-500" },
      { label: "Clinical Data", href: "/clinical/data-capture", icon: <Stethoscope className="w-5 h-5" />, color: "text-indigo-500" },
      { label: "Treatment Consent", href: "/clinical/consent", icon: <FileText className="w-5 h-5" />, color: "text-pink-500" },
    ],
    labtech: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Test Orders", href: "/tests/collect", icon: <FlaskConical className="w-5 h-5" />, color: "text-purple-500" },
      { label: "Samples", href: "/samples", icon: <FolderKanban className="w-5 h-5" />, color: "text-indigo-500" },
      { label: "Test Results", href: "/results", icon: <FileSearch className="w-5 h-5" />, color: "text-emerald-500" },
      { label: "Scanner", href: "/tests/collect/scanner", icon: <ScanLine className="w-5 h-5" />, color: "text-orange-500" },
      { label: "Analysis", href: "/tests/turnaround", icon: <Activity className="w-5 h-5" />, color: "text-cyan-500" },
    ],
    dispatcher: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Log Emergency", href: "/emergency/dispatch/report", icon: <Phone className="w-5 h-5" />, color: "text-red-500" },
      { label: "Emergency Dispatch", href: "/emergency/dispatch", icon: <Truck className="w-5 h-5" />, color: "text-red-500" },
     //{ label: "Ambulance Fleet", href: "/emergency/ambulances", icon: <Activity className="w-5 h-5" />, color: "text-orange-500" },
      { label: "Fleet Management", href: "/admin/fleet", icon: <Truck className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Fleet Tracking", href: "/fleet/tracking", icon: <Activity className="w-5 h-5" />, color: "text-green-500" },
      { label: "Maintenance", href: "/fleet/maintenance", icon: <Wrench className="w-5 h-5" />, color: "text-yellow-500" },
      { label: "Response Reports", href: "/emergency/reports", icon: <FileText className="w-5 h-5" />, color: "text-purple-500" },
    ],
    patient: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Appointments", href: "/appointments", icon: <Calendar className="w-5 h-5" />, color: "text-green-500" },
      { label: "Diagnosis", href: "/diagnosis/", icon: <ClipboardCheck className="w-5 h-5" />, color: "text-purple-500" },
      { label: "Bills", href: "/bills/my", icon: <CreditCard className="w-5 h-5" />, color: "text-orange-500" },
    ],
    ward_manager: [
      { label: "Dashboard", href: "/ward-manager/dashboard", icon: <Home className="w-5 h-5" />, color: "text-blue-500" },
      { label: "Ward Management", href: "/ward-manager/wards", icon: <Building className="w-5 h-5" />, color: "text-teal-500" },
      { label: "Bed Management", href: "/beds/management", icon: <Bed className="w-5 h-5" />, color: "text-green-500" },
      { label: "Infection Control", href: "/infection-control/dashboard", icon: <Shield className="w-5 h-5" />, color: "text-red-500" },
      { label: "Resource Management", href: "/ward-manager/resources", icon: <Users className="w-5 h-5" />, color: "text-cyan-500" },
      { label: "Patient Admission", href: "/er/admission", icon: <UserCheck className="w-5 h-5" />, color: "text-orange-500" },
      { label: "Housekeeping", href: "/housekeeping/dashboard", icon: <Sparkles className="w-5 h-5" />, color: "text-purple-500" },
    ],
  };

  const role = session?.user?.role;

  return (
    <aside className="sticky bottom-0 top-0 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-screen shadow-2xl flex flex-col border-r border-slate-700">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-700 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
          <Stethoscope className="w-8 h-8 text-blue-300" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">HealthCare</h2>
          <p className="text-xs text-blue-200 font-medium">Management System</p>
        </div>
      </div>

      {/* User Info */}
      {session && (
        <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{session.user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{session.user.role}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {role && menuItems[role] ? (
          <ul className="space-y-2">
            {menuItems[role].map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:scale-[1.01]"
                    }`}
                  >
                    <span className={`${isActive ? "text-blue-200" : item.color} transition-colors`}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-blue-200" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-400 text-sm">No menu available</p>
          </div>
        )}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/30">
        <button
          onClick={logout}
          className="group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 w-full rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-red-500/25 hover:transform hover:scale-[1.02]"
        >
          <LogOut className="w-5 h-5 text-red-200" />
          <span className="text-white">Logout</span>
        </button>
      </div>
    </aside>
  );
}