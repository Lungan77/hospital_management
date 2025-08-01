"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, Search, Filter, UserCheck, UserX, Mail, Phone, Edit, Trash2, Shield, Star, Activity } from "lucide-react";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    const colors = {
      admin: "from-purple-500 to-purple-600",
      doctor: "from-blue-500 to-blue-600",
      nurse: "from-pink-500 to-pink-600",
      receptionist: "from-yellow-500 to-yellow-600",
      patient: "from-green-500 to-green-600",
      labtech: "from-cyan-500 to-cyan-600",
      driver: "from-orange-500 to-orange-600",
      paramedic: "from-red-500 to-red-600",
      dispatcher: "from-red-500 to-red-600"
    };
    return colors[role] || "from-gray-500 to-gray-600";
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-700 border-purple-200",
      doctor: "bg-blue-100 text-blue-700 border-blue-200",
      nurse: "bg-pink-100 text-pink-700 border-pink-200",
      receptionist: "bg-yellow-100 text-yellow-700 border-yellow-200",
      patient: "bg-green-100 text-green-700 border-green-200",
      labtech: "bg-cyan-100 text-cyan-700 border-cyan-200",
      driver: "bg-orange-100 text-orange-700 border-orange-200",
      paramedic: "bg-red-100 text-red-700 border-red-200",
      dispatcher: "bg-red-100 text-red-700 border-red-200"
    };
    return colors[role] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center gap-4">
                <Users className="w-12 h-12 text-blue-600" />
                User Management
              </h1>
              <p className="text-gray-600 text-xl">Manage system users and their roles with comprehensive oversight</p>
            </div>
            <Link
              href="/admin/users/create"
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
            >
              <Plus className="w-6 h-6" />
              Add New User
            </Link>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="md:w-64">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Role</label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-gray-50 focus:bg-white"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="patient">Patient</option>
                  <option value="labtech">Lab Technician</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <UserX className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Users Found</h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchTerm || roleFilter ? "No users match your current filters." : "No users have been added to the system yet."}
            </p>
            {!searchTerm && !roleFilter && (
              <Link
                href="/admin/users/create"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
              >
                <Plus className="w-6 h-6" />
                Add First User
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <div key={user._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105 group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getRoleColor(user.role)} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl">{user.title} {user.name}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getRoleBadgeColor(user.role)} mt-2`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </div>
                  <UserCheck className="w-6 h-6 text-green-500" />
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="text-sm truncate flex-1">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-green-500" />
                    <span className="text-sm">{user.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 p-3 bg-gray-50 rounded-xl">
                    <UserCheck className="w-5 h-5 text-purple-500" />
                    <span className="text-sm">{user.gender || "Not specified"}</span>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <div className="text-lg font-bold text-blue-600">4.9</div>
                    <div className="text-xs text-blue-600">Rating</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-lg font-bold text-green-600">98%</div>
                    <div className="text-xs text-green-600">Active</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <div className="text-lg font-bold text-purple-600">24</div>
                    <div className="text-xs text-purple-600">Tasks</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-50 text-blue-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-all duration-200 flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="flex-1 bg-red-50 text-red-600 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Users", value: users.length, color: "blue", icon: <Users className="w-6 h-6" /> },
            { label: "Doctors", value: users.filter(u => u.role === 'doctor').length, color: "green", icon: <Activity className="w-6 h-6" /> },
            { label: "Patients", value: users.filter(u => u.role === 'patient').length, color: "purple", icon: <UserCheck className="w-6 h-6" /> },
            { label: "Staff", value: users.filter(u => ['nurse', 'receptionist', 'labtech'].includes(u.role)).length, color: "yellow", icon: <Star className="w-6 h-6" /> }
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
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 rounded-full transition-all duration-1000`} style={{ width: `${Math.min((stat.value / users.length) * 100, 100)}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}