"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Home, Calendar, Stethoscope, ClipboardList, LogOut, FileText } from "lucide-react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const logout = async () => await signOut({ callbackUrl: "/login" });

  const menuItems = {
    admin: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
      { label: "Users", href: "/admin/users", icon: <ClipboardList className="w-5 h-5" /> },
      { label: "Billing", href: "/admin/billing", icon: <FileText className="w-5 h-5" /> },
    ],
    doctor: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
      { label: "Appointments", href: "/doctor/appointments", icon: <Calendar className="w-5 h-5" /> },
      { label: "Patients", href: "/doctor/patients", icon: <Stethoscope className="w-5 h-5" /> },
    ],
    receptionist: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
      { label: "Check-in", href: "/receptionist/checkin", icon: <ClipboardList className="w-5 h-5" /> },
    ],
    nurse: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
      { label: "Record Vitals", href: "/nurse/vitals", icon: <Stethoscope className="w-5 h-5" /> },
    ],
    patient: [
      { label: "Dashboard", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
      { label: "Appointments", href: "/patient/appointments", icon: <Calendar className="w-5 h-5" /> },
    ],
  };

  const role = session?.user?.role;

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-6">
      <h2 className="text-2xl font-bold">Hospital System</h2>
      <nav className="mt-6">
        {menuItems[role]?.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 p-2 rounded-md ${
              pathname === item.href ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            {item.icon} <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <button onClick={logout} className="mt-6 flex items-center gap-2 p-2 bg-red-600 w-full rounded-md hover:bg-red-700">
        <LogOut className="w-5 h-5" /> Logout
      </button>
    </aside>
  );
}
