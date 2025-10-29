"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import {
  FileText,
  Download,
  Search,
  User,
  Calendar,
  Utensils,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  Award,
  AlertCircle,
  Printer
} from "lucide-react";

function DieticianReportsPage() {
  const router = useRouter();
  const printRef = useRef();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [mealHistory, setMealHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalMeals: 0,
    delivered: 0,
    pending: 0,
    deliveryRate: 0,
  });

  useEffect(() => {
    fetchAdmittedPatients();
  }, []);

  const fetchAdmittedPatients = async () => {
    try {
      const res = await fetch("/api/patients?status=Admitted");
      const data = await res.json();
      if (res.ok) {
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const fetchMealHistory = async (patientId) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/nutrition/meal-history?patientId=${patientId}`);
      const data = await res.json();
      if (res.ok) {
        setMealHistory(data.mealHistory || []);
        setSelectedPatient(data.patient);
        calculateStats(data.mealHistory);
      } else {
        toast.error(data.error || "Failed to load meal history");
      }
    } catch (error) {
      console.error("Error fetching meal history:", error);
      toast.error("Failed to load meal history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const calculateStats = (history) => {
    let totalMeals = 0;
    let delivered = 0;
    let pending = 0;

    history.forEach((plan) => {
      if (plan.meals.breakfast) {
        totalMeals++;
        if (plan.meals.breakfast.delivered) delivered++;
        else pending++;
      }
      if (plan.meals.lunch) {
        totalMeals++;
        if (plan.meals.lunch.delivered) delivered++;
        else pending++;
      }
      if (plan.meals.dinner) {
        totalMeals++;
        if (plan.meals.dinner.delivered) delivered++;
        else pending++;
      }
    });

    const rate = totalMeals > 0 ? ((delivered / totalMeals) * 100).toFixed(1) : 0;
    setStats({ totalMeals, delivered, pending, deliveryRate: rate });
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Meal_History_${selectedPatient?.admissionNumber || "Report"}`,
  });

  const filteredPatients = patients.filter(
    (p) =>
      p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">Meal History Reports</h1>
              <p className="text-gray-600 text-xl">Generate detailed nutrition reports for patients</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Patient</h2>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No admitted patients found</p>
                ) : (
                  filteredPatients.map((patient) => (
                    <button
                      key={patient._id}
                      onClick={() => fetchMealHistory(patient._id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedPatient?._id === patient._id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                          {patient.firstName?.[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-sm text-gray-600">#{patient.admissionNumber}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!selectedPatient ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <Utensils className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Select a patient to view their meal history</p>
              </div>
            ) : loadingHistory ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading meal history...</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Meal History Report</h2>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-teal-700 transition-colors shadow-lg"
                    >
                      <Printer className="w-5 h-5" />
                      Download PDF
                    </button>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between">
                        <Utensils className="w-8 h-8 opacity-80" />
                        <div className="text-right">
                          <div className="text-2xl font-bold">{stats.totalMeals}</div>
                          <div className="text-blue-100 text-sm">Total Meals</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between">
                        <CheckCircle className="w-8 h-8 opacity-80" />
                        <div className="text-right">
                          <div className="text-2xl font-bold">{stats.delivered}</div>
                          <div className="text-green-100 text-sm">Delivered</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between">
                        <Clock className="w-8 h-8 opacity-80" />
                        <div className="text-right">
                          <div className="text-2xl font-bold">{stats.pending}</div>
                          <div className="text-yellow-100 text-sm">Pending</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between">
                        <TrendingUp className="w-8 h-8 opacity-80" />
                        <div className="text-right">
                          <div className="text-2xl font-bold">{stats.deliveryRate}%</div>
                          <div className="text-purple-100 text-sm">Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div ref={printRef} className="print-content">
                    <div className="print-header mb-6">
                      <div className="border-b-4 border-green-900 pb-4 mb-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h1 className="text-4xl font-bold text-green-900 mb-1">MEAL HISTORY REPORT</h1>
                            <p className="text-lg text-gray-700 font-semibold">Nutritional Care Documentation</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 font-semibold">Report ID</p>
                            <p className="text-lg font-bold text-green-900">{selectedPatient.admissionNumber}</p>
                            <p className="text-xs text-gray-500 mt-2">Generated: {new Date().toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="medical-section mb-6">
                      <div className="section-header">
                        <h2 className="section-title">PATIENT INFORMATION</h2>
                      </div>
                      <div className="section-content">
                        <table className="info-table">
                          <tbody>
                            <tr>
                              <td className="label-cell">Full Name:</td>
                              <td className="value-cell font-bold">{selectedPatient.patientName}</td>
                              <td className="label-cell">Admission Number:</td>
                              <td className="value-cell">{selectedPatient.admissionNumber}</td>
                            </tr>
                            <tr>
                              <td className="label-cell">Date of Birth:</td>
                              <td className="value-cell">
                                {selectedPatient.dateOfBirth
                                  ? new Date(selectedPatient.dateOfBirth).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td className="label-cell">Gender:</td>
                              <td className="value-cell">{selectedPatient.gender || "N/A"}</td>
                            </tr>
                            <tr>
                              <td className="label-cell">Ward:</td>
                              <td className="value-cell">{selectedPatient.assignedWard}</td>
                              <td className="label-cell">Bed:</td>
                              <td className="value-cell">{selectedPatient.assignedBed || "N/A"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="medical-section mb-6">
                      <div className="section-header">
                        <h2 className="section-title">NUTRITION STATISTICS</h2>
                      </div>
                      <div className="section-content">
                        <div className="data-grid">
                          <div className="data-item">
                            <div className="data-item-label">Total Meals</div>
                            <div className="data-item-value">{stats.totalMeals}</div>
                          </div>
                          <div className="data-item">
                            <div className="data-item-label">Delivered</div>
                            <div className="data-item-value text-green-700">{stats.delivered}</div>
                          </div>
                          <div className="data-item">
                            <div className="data-item-label">Pending</div>
                            <div className="data-item-value text-yellow-700">{stats.pending}</div>
                          </div>
                          <div className="data-item">
                            <div className="data-item-label">Delivery Rate</div>
                            <div className="data-item-value text-blue-700">{stats.deliveryRate}%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="medical-section mb-6">
                      <div className="section-header">
                        <h2 className="section-title">MEAL HISTORY (Last 30 Days)</h2>
                      </div>
                      <div className="section-content">
                        {mealHistory.length === 0 ? (
                          <p className="text-gray-600 text-center py-8">No meal history available</p>
                        ) : (
                          <div className="space-y-4">
                            {mealHistory.map((plan, index) => (
                              <div key={plan._id} className="border-l-4 border-green-600 bg-gray-50 p-4 rounded">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <div className="font-bold text-gray-900 mb-1">
                                      Day #{mealHistory.length - index} - {new Date(plan.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-600">Diet Type: {plan.dietType}</div>
                                    {plan.specialInstructions && (
                                      <div className="text-xs text-blue-700 mt-1">
                                        Special: {plan.specialInstructions}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-gray-600">Status</div>
                                    <div className="text-sm font-semibold">{plan.status}</div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                  {plan.meals.breakfast && (
                                    <div className="bg-white p-3 rounded border">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="font-bold text-sm">Breakfast</div>
                                        {plan.meals.breakfast.delivered ? (
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                          <XCircle className="w-4 h-4 text-red-600" />
                                        )}
                                      </div>
                                      {plan.meals.breakfast.time && (
                                        <div className="text-xs text-gray-600 mb-1">
                                          Time: {plan.meals.breakfast.time}
                                        </div>
                                      )}
                                      {plan.meals.breakfast.items && (
                                        <ul className="text-xs space-y-0.5">
                                          {plan.meals.breakfast.items.slice(0, 3).map((item, i) => (
                                            <li key={i}>• {item}</li>
                                          ))}
                                        </ul>
                                      )}
                                      {plan.meals.breakfast.delivered && plan.meals.breakfast.deliveredBy && (
                                        <div className="text-xs text-green-600 mt-2">
                                          By: {plan.meals.breakfast.deliveredBy}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {plan.meals.lunch && (
                                    <div className="bg-white p-3 rounded border">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="font-bold text-sm">Lunch</div>
                                        {plan.meals.lunch.delivered ? (
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                          <XCircle className="w-4 h-4 text-red-600" />
                                        )}
                                      </div>
                                      {plan.meals.lunch.time && (
                                        <div className="text-xs text-gray-600 mb-1">Time: {plan.meals.lunch.time}</div>
                                      )}
                                      {plan.meals.lunch.items && (
                                        <ul className="text-xs space-y-0.5">
                                          {plan.meals.lunch.items.slice(0, 3).map((item, i) => (
                                            <li key={i}>• {item}</li>
                                          ))}
                                        </ul>
                                      )}
                                      {plan.meals.lunch.delivered && plan.meals.lunch.deliveredBy && (
                                        <div className="text-xs text-green-600 mt-2">
                                          By: {plan.meals.lunch.deliveredBy}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {plan.meals.dinner && (
                                    <div className="bg-white p-3 rounded border">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="font-bold text-sm">Dinner</div>
                                        {plan.meals.dinner.delivered ? (
                                          <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                          <XCircle className="w-4 h-4 text-red-600" />
                                        )}
                                      </div>
                                      {plan.meals.dinner.time && (
                                        <div className="text-xs text-gray-600 mb-1">Time: {plan.meals.dinner.time}</div>
                                      )}
                                      {plan.meals.dinner.items && (
                                        <ul className="text-xs space-y-0.5">
                                          {plan.meals.dinner.items.slice(0, 3).map((item, i) => (
                                            <li key={i}>• {item}</li>
                                          ))}
                                        </ul>
                                      )}
                                      {plan.meals.dinner.delivered && plan.meals.dinner.deliveredBy && (
                                        <div className="text-xs text-green-600 mt-2">
                                          By: {plan.meals.dinner.deliveredBy}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="print-footer">
                      <div className="border-t-2 border-gray-300 pt-4 mt-12">
                        <div className="flex justify-between items-center text-xs text-gray-600">
                          <div>
                            <p className="font-semibold">CONFIDENTIAL NUTRITION REPORT</p>
                            <p>This document contains protected health information</p>
                          </div>
                          <div className="text-right">
                            <p>Report ID: {selectedPatient.admissionNumber}</p>
                            <p>Generated: {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-center mt-4 text-xs text-gray-500">
                          <p>This report is subject to medical confidentiality laws and regulations.</p>
                          <p>Unauthorized disclosure or use is strictly prohibited.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .medical-section {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .section-header {
          background: linear-gradient(to right, #059669, #10b981);
          padding: 12px 20px;
          border-bottom: 3px solid #10b981;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .section-content {
          padding: 20px;
        }

        .info-table {
          width: 100%;
          border-collapse: collapse;
        }

        .info-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .label-cell {
          font-weight: 600;
          color: #374151;
          width: 20%;
          background: #f9fafb;
        }

        .value-cell {
          color: #111827;
          width: 30%;
        }

        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .data-item {
          padding: 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          text-align: center;
        }

        .data-item-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .data-item-value {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }

        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }

          .print-content {
            max-width: 100%;
            padding: 30px 40px;
            margin: 0;
          }

          .print-header {
            margin-bottom: 30px;
          }

          .print-footer {
            margin-top: 40px;
            page-break-inside: avoid;
          }

          .medical-section {
            page-break-inside: avoid;
            margin-bottom: 20px;
            border: 1px solid #000;
          }

          .section-header {
            background: #059669 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .section-title {
            color: white !important;
          }

          .info-table td {
            padding: 8px 10px;
            font-size: 12px;
          }

          .label-cell {
            background: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .data-item {
            background: #f9fafb !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          @page {
            margin: 1.5cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}

export default withAuth(DieticianReportsPage, ["dietician", "admin"]);
