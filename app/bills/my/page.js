"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import withAuth from "@/hoc/withAuth";
import { FileText, Plus, CreditCard, Calendar, User, DollarSign, CheckCircle, Clock, AlertCircle, Download } from "lucide-react";

function MyBills() {
  const { data: session } = useSession();
  const [bills, setBills] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    const res = await fetch("/api/bills/my");
    const data = await res.json();
    if (res.ok) {
      setBills(data.bills);
    } else {
      setMessage("Failed to fetch bills.");
    }
    setLoading(false);
  };

  const payBill = async (billId) => {
    const res = await fetch("/api/bills/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billId }),
    });

    const data = await res.json();
    if (res.ok) {
      window.location.href = data.url;
    } else {
      setMessage(data.error);
    }
  };

  const filteredBills = bills.filter(bill => {
    if (filter === "pending") return bill.status === "pending";
    if (filter === "paid") return bill.status === "paid";
    if (filter === "recent") return new Date(bill.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      "paid": "bg-green-100 text-green-700 border-green-200",
      "pending": "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "paid": <CheckCircle className="w-4 h-4" />,
      "pending": <Clock className="w-4 h-4" />
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center gap-4">
                <CreditCard className="w-12 h-12 text-green-600" />
                My Bills
              </h1>
              <p className="text-gray-600 text-xl">
                {session?.user.role === "doctor" 
                  ? "Manage patient bills and payment tracking"
                  : "View and manage your medical bills and payments"
                }
              </p>
            </div>

            {session?.user.role === "doctor" && (
              <Link
                href="/bills/generate"
                className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-105"
              >
                <Plus className="w-6 h-6" />
                Create Bill
              </Link>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Bills", count: bills.length },
              { key: "pending", label: "Pending Payment", count: bills.filter(b => b.status === "pending").length },
              { key: "paid", label: "Paid", count: bills.filter(b => b.status === "paid").length },
              { key: "recent", label: "Recent (30 days)", count: bills.filter(b => new Date(b.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  filter === tab.key
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-2xl shadow-lg">
            <p className="text-red-700 font-semibold text-lg">{message}</p>
          </div>
        )}

        {filteredBills.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <FileText className="w-32 h-32 text-gray-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Bills Found</h3>
            <p className="text-gray-600 text-lg">
              {filter === "all" ? "No bills available." : `No ${filter} bills found.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredBills.map((bill) => (
              <div key={bill._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 group">
                {/* Bill Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                      <FileText className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Medical Bill</h2>
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(bill.status)}`}>
                          {getStatusIcon(bill.status)}
                          {bill.status.toUpperCase()}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="text-4xl font-bold text-green-600">R{bill.totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Bill Details */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-gray-50 rounded-2xl">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Bill Breakdown
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Consultation Fee:</span>
                          <span className="font-semibold">R{bill.consultationFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lab Tests:</span>
                          <span className="font-semibold">R{bill.labTestsFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Medication:</span>
                          <span className="font-semibold">R{bill.medicationFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Other Charges:</span>
                          <span className="font-semibold">R{bill.otherCharges}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between">
                          <span className="font-bold text-gray-800">Total:</span>
                          <span className="font-bold text-green-600">R{bill.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-blue-50 rounded-2xl">
                      <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Payment Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-blue-600 font-medium">Payment Method</p>
                          <p className="text-blue-800">{bill.paymentMethod || "Not Paid"}</p>
                        </div>
                        <div>
                          <p className="text-blue-600 font-medium">Payment Date</p>
                          <p className="text-blue-800">
                            {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-600 font-medium">Doctor</p>
                          <p className="text-blue-800">{bill.doctorId?.name || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  {bill.status === "pending" && session?.user.role === "patient" && (
                    <button
                      onClick={() => payBill(bill._id)}
                      className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-105"
                    >
                      <CreditCard className="w-5 h-5" />
                      Pay Now
                    </button>
                  )}
                  
                  <button className="flex items-center gap-3 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-100 transition-all duration-200">
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                  
                  <button className="flex items-center gap-3 bg-gray-50 text-gray-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200">
                    <FileText className="w-5 h-5" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Bills", value: bills.length, color: "green", icon: <FileText className="w-6 h-6" /> },
            { label: "Total Amount", value: `R${bills.reduce((sum, bill) => sum + bill.totalAmount, 0).toLocaleString()}`, color: "blue", icon: <DollarSign className="w-6 h-6" /> },
            { label: "Paid Bills", value: bills.filter(b => b.status === "paid").length, color: "emerald", icon: <CheckCircle className="w-6 h-6" /> },
            { label: "Pending", value: bills.filter(b => b.status === "pending").length, color: "yellow", icon: <Clock className="w-6 h-6" /> }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(MyBills, ["patient", "doctor"]);