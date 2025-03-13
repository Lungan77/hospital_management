"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <h1>Hospital System</h1>
      <div>
        {!session ? (
          <>
            <Link href="/login" className="mr-4">Login</Link>
            <Link href="/register" className="mr-4">Register</Link>
          </>
        ) : (
          <button onClick={() => signOut()} className="p-2 bg-red-500">Logout</button>
        )}
      </div>
    </nav>
  );
}
