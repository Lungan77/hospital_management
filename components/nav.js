"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="p-4 bg-gray-800 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-wide hover:text-gray-300 transition-colors">
          Hospital System
        </Link>
        <div className="flex items-center space-x-4">
          {!session ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-700 transition-colors"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={() => signOut()}
              className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 transition-colors font-semibold"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
