"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Bell, Search, Settings, User } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-200">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                HealthCare System
              </h1>
              <p className="text-xs text-gray-500 font-medium">Professional Medical Management</p>
            </div>
          </Link>

          {/* Search Bar - Only show when logged in */}
          {session && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search patients, appointments..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {!session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* Settings */}
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                  <Settings className="w-5 h-5" />
                </button>

                {/* User Menu */}
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-800">{session.user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{session.user.role}</p>
                  </div>
                  <div className="relative group">
                    <button className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-105">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}