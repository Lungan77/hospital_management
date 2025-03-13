import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 pt-20">
        <h1 className="text-5xl md:text-6xl font-extrabold">Welcome to High Health</h1>
        <p className="mt-6 text-xl max-w-2xl">A powerful solution for managing hospital operations efficiently.</p>
        <button className="mt-8 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition">Get Started</button>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6 bg-white text-gray-800">
        <h2 className="text-4xl font-bold text-center mb-10">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { img: "/images/appointment.svg", title: "Appointment Scheduling", desc: "Easily manage doctor-patient appointments." },
            { img: "/images/records.svg", title: "Patient Records", desc: "Securely store and manage patient data." },
            { img: "/images/billing.svg", title: "Billing & Payments", desc: "Seamless payment processing for hospital services." },
          ].map((feature, index) => (
            <div key={index} className="p-8 bg-gray-100 rounded-lg shadow-lg text-center">
              <Image src={feature.img} alt={feature.title} width={100} height={100} className="mx-auto" />
              <h3 className="text-2xl font-semibold mt-5">{feature.title}</h3>
              <p className="mt-3 text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Query Section */}
      <section className="py-20 px-6 bg-gray-100 text-center">
        <h2 className="text-4xl font-bold text-gray-800">Have a Query?</h2>
        <p className="mt-4 text-gray-600">Ask us anything, and we will get back to you soon.</p>
        <div className="mt-6 flex flex-col md:flex-row justify-center gap-4">
          <input type="text" placeholder="Your question..." className="p-4 border rounded-md w-full md:w-2/3" />
          <button className="px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 transition">Submit</button>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-20 px-6 bg-gray-900 text-white text-center">
        <h2 className="text-4xl font-bold">Contact Us</h2>
        <p className="mt-4 text-gray-300">Have questions? Get in touch with us today.</p>
        <button className="mt-6 px-8 py-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-400 transition">Contact Support</button>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} High Health. All rights reserved.</p>
      </footer>
    </div>
  );
}
