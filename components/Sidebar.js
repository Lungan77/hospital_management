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
} from "lucide-react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const logout = async () => await signOut({ callbackUrl: "/login" });

  const menuItems = {
    admin: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
      { label: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
      { label: "Billing", href: "/admin/billing", icon: <CreditCard className="w-5 h-5" /> },
    ],
    doctor: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
      { label: "Time Slots", href: "/doctor/timeslots", icon: <Calendar className="w-5 h-5" /> },
      { label: "Appointments", href: "/appointments/", icon: <ClipboardList className="w-5 h-5" /> },
      { label: "Diagnosis", href: "/diagnosis/", icon: <ClipboardCheck className="w-5 h-5" /> },
      { label: "Test Orders", href: "/tests/orders", icon: <FilePlus className="w-5 h-5" /> },
      { label: "Test Results", href: "/results/doctor", icon: <FileSearch className="w-5 h-5" /> },
      { label: "Bills", href: "/bills/my", icon: <CreditCard className="w-5 h-5" /> },
      { label: "Patients", href: "/patient/list", icon: <Users className="w-5 h-5" /> },
    ],
    receptionist: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
      { label: "Check-in", href: "/receptionist/appointments", icon: <ClipboardCheck className="w-5 h-5" /> },
    ],
    nurse: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
      { label: "Record Vitals", href: "/nurse/vitals", icon: <HeartPulse className="w-5 h-5" /> },
    ],
    labtech: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
      { label: "Test Orders", href: "/tests/collect", icon: <FlaskConical className="w-5 h-5" /> },
      { label: "Samples", href: "/samples", icon: <FolderKanban className="w-5 h-5" /> },
      { label: "Test Results", href: "/results", icon: <FileSearch className="w-5 h-5" /> },
      { label: "Scanner", href: "/tests/collect/scanner", icon: <ScanLine className="w-5 h-5" /> },
      { label: "Analysis", href: "/tests/turnaround", icon: <Activity className="w-5 h-5" /> },
    ],
    patient: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
      { label: "Appointments", href: "/appointments", icon: <Calendar className="w-5 h-5" /> },
      { label: "Diagnosis", href: "/diagnosis/", icon: <ClipboardCheck className="w-5 h-5" /> },
      { label: "Bills", href: "/bills/my", icon: <CreditCard className="w-5 h-5" /> },
    ],
  };

  const role = session?.user?.role;

  return (
    <aside className="sticky bottom-0 top-0 w-64 bg-gray-900 text-white h-screen p-0 shadow-xl flex flex-col">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-800">
        <Stethoscope className="w-8 h-8 text-blue-400" />
        <h2 className="text-2xl font-bold tracking-tight">Hospital System</h2>
      </div>
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {role && menuItems[role] ? (
          <ul className="space-y-1">
            {menuItems[role].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-200 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-gray-400">No menu available</span>
        )}
      </nav>
      <div className="px-4 pb-6">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 w-full rounded-lg font-semibold hover:bg-red-700 transition-colors shadow"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  );
}
