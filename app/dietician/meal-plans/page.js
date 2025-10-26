"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Utensils,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Filter
} from "lucide-react";

function DieticianMealPlansPage() {
  const router = useRouter();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      const res = await fetch("/api/meal-plans");
      const data = await res.json();
      if (res.ok) {
        setMealPlans(data.mealPlans || []);
      }
    } catch (error) {
      console.error("Error fetching meal plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border-green-200";
      case "Completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Modified":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getMealDeliveryStatus = (meals) => {
    const totalMeals = 3;
    let deliveredCount = 0;

    if (meals.breakfast?.delivered) deliveredCount++;
    if (meals.lunch?.delivered) deliveredCount++;
    if (meals.dinner?.delivered) deliveredCount++;

    return { delivered: deliveredCount, total: totalMeals };
  };

  const filteredMealPlans = mealPlans.filter((plan) => {
    const matchesSearch =
      plan.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "All" || plan.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading meal plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-green-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Utensils className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Meal Plans</h1>
                <p className="text-gray-600 text-xl">View and manage patient meal plans</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/nutrition/patients")}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Meal Plan
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Meal Plans</h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Modified">Modified</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredMealPlans.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No meal plans found</p>
              <button
                onClick={() => router.push("/nutrition/patients")}
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
              >
                Create First Meal Plan
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMealPlans.map((plan) => {
                const deliveryStatus = getMealDeliveryStatus(plan.meals);

                return (
                  <div
                    key={plan._id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => router.push(`/meal-planning/${plan.patientAdmissionId}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {plan.patientName?.[0] || "?"}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{plan.patientName}</h3>
                            <p className="text-sm text-gray-600">Admission: {plan.admissionNumber}</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-5 gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(plan.status)}`}>
                              {plan.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Utensils className="w-4 h-4 text-green-600" />
                            <span>{plan.dietType}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>{new Date(plan.planDate).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{deliveryStatus.delivered}/{deliveryStatus.total} meals delivered</span>
                          </div>

                          {plan.texture !== "Regular" && (
                            <div className="flex items-center gap-2 text-sm text-purple-600">
                              <span className="font-semibold">Texture: {plan.texture}</span>
                            </div>
                          )}
                        </div>

                        {plan.specialConsiderations && (
                          <div className="mt-3 bg-yellow-50 rounded-lg p-3">
                            <p className="text-sm font-semibold text-gray-900 mb-1">Special Considerations:</p>
                            <p className="text-sm text-gray-700">{plan.specialConsiderations}</p>
                          </div>
                        )}

                        {plan.restrictions && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {plan.restrictions.allergies?.length > 0 && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg">
                                Allergies: {plan.restrictions.allergies.join(", ")}
                              </span>
                            )}
                            {plan.restrictions.intolerances?.length > 0 && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">
                                Intolerances: {plan.restrictions.intolerances.join(", ")}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(DieticianMealPlansPage, ["dietician", "admin"]);
