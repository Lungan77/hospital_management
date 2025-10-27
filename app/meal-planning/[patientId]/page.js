"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/hoc/withAuth";
import {
  Utensils,
  Coffee,
  Sun,
  Moon,
  Clock,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  ClipboardList,
  Check,
  X
} from "lucide-react";

function MealPlanningPage({ params }) {
  const unwrappedParams = use(params);
  const { patientId } = unwrappedParams;
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [existingPlans, setExistingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [mealPlan, setMealPlan] = useState({
    planDate: new Date().toISOString().split("T")[0],
    dietType: "Regular",
    meals: {
      breakfast: {
        items: [],
        time: "08:00",
        specialInstructions: "",
      },
      lunch: {
        items: [],
        time: "12:00",
        specialInstructions: "",
      },
      dinner: {
        items: [],
        time: "18:00",
        specialInstructions: "",
      },
      snacks: [],
    },
    restrictions: {
      allergies: [],
      intolerances: [],
      culturalRestrictions: [],
      religiousRestrictions: [],
      dislikes: [],
    },
    nutritionalRequirements: {
      calories: "",
      protein: "",
      carbohydrates: "",
      fat: "",
      fiber: "",
      sodium: "",
      fluids: "",
      otherRequirements: "",
    },
    texture: "Regular",
    fluidConsistency: "Not Applicable",
    feedingMethod: "Oral",
    assistanceRequired: false,
    assistanceLevel: "Independent",
    medicalConditions: [],
    medications: [],
    dieticianConsulted: false,
    dieticianName: "",
    dieticianNotes: "",
    notes: "",
    specialConsiderations: "",
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
      fetchExistingPlans();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const res = await fetch(`/api/admission/resources?patientId=${patientId}`);
      const data = await res.json();
      if (res.ok && data.patients?.length > 0) {
        setPatient(data.patients[0]);
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingPlans = async () => {
    try {
      const res = await fetch(`/api/meal-plans?patientAdmissionId=${patientId}`);
      const data = await res.json();
      if (res.ok) {
        setExistingPlans(data.mealPlans || []);
      }
    } catch (error) {
      console.error("Error fetching meal plans:", error);
    }
  };

  const addMealItem = (mealType, item) => {
    if (!item.trim()) return;
    setMealPlan({
      ...mealPlan,
      meals: {
        ...mealPlan.meals,
        [mealType]: {
          ...mealPlan.meals[mealType],
          items: [...mealPlan.meals[mealType].items, item],
        },
      },
    });
  };

  const removeMealItem = (mealType, index) => {
    setMealPlan({
      ...mealPlan,
      meals: {
        ...mealPlan.meals,
        [mealType]: {
          ...mealPlan.meals[mealType],
          items: mealPlan.meals[mealType].items.filter((_, i) => i !== index),
        },
      },
    });
  };

  const addSnack = () => {
    setMealPlan({
      ...mealPlan,
      meals: {
        ...mealPlan.meals,
        snacks: [...mealPlan.meals.snacks, { items: [], time: "" }],
      },
    });
  };

  const removeSnack = (index) => {
    setMealPlan({
      ...mealPlan,
      meals: {
        ...mealPlan.meals,
        snacks: mealPlan.meals.snacks.filter((_, i) => i !== index),
      },
    });
  };

  const addSnackItem = (snackIndex, item) => {
    if (!item.trim()) return;
    const updatedSnacks = [...mealPlan.meals.snacks];
    updatedSnacks[snackIndex].items.push(item);
    setMealPlan({
      ...mealPlan,
      meals: { ...mealPlan.meals, snacks: updatedSnacks },
    });
  };

  const removeSnackItem = (snackIndex, itemIndex) => {
    const updatedSnacks = [...mealPlan.meals.snacks];
    updatedSnacks[snackIndex].items = updatedSnacks[snackIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    setMealPlan({
      ...mealPlan,
      meals: { ...mealPlan.meals, snacks: updatedSnacks },
    });
  };

  const addRestriction = (type, value) => {
    if (!value.trim()) return;
    setMealPlan({
      ...mealPlan,
      restrictions: {
        ...mealPlan.restrictions,
        [type]: [...mealPlan.restrictions[type], value],
      },
    });
  };

  const removeRestriction = (type, index) => {
    setMealPlan({
      ...mealPlan,
      restrictions: {
        ...mealPlan.restrictions,
        [type]: mealPlan.restrictions[type].filter((_, i) => i !== index),
      },
    });
  };

  const saveMealPlan = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientAdmissionId: patientId,
          ...mealPlan,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Meal plan saved successfully!");
        fetchExistingPlans();
        setTimeout(() => router.push("/dietician/meal-plans"), 2000);
      } else {
        setMessage(data.error || "Error saving meal plan");
      }
    } catch (error) {
      console.error("Error saving meal plan:", error);
      setMessage("Error saving meal plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-24 h-24 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load patient information</p>
          <button
            onClick={() => router.push("/nutrition/patients")}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-yellow-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Utensils className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Meal Planning</h1>
                <p className="text-gray-600 text-xl mt-2">
                  {patient.firstName} {patient.lastName} - {patient.admissionNumber}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/nutrition/patients")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-sm text-orange-600 font-semibold mb-1">Chief Complaint</p>
              <p className="text-lg font-bold text-orange-900">{patient.chiefComplaint}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
              <p className="text-sm text-yellow-600 font-semibold mb-1">Status</p>
              <p className="text-lg font-bold text-yellow-900">{patient.status}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-sm text-red-600 font-semibold mb-1">Admitted</p>
              <p className="text-lg font-bold text-red-900">
                {new Date(patient.admissionDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-8 p-6 rounded-2xl border-l-4 ${
              message.includes("successfully")
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-red-50 border-red-500 text-red-700"
            } shadow-lg flex items-center gap-4`}
          >
            {message.includes("successfully") ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
            <p className="font-semibold text-lg">{message}</p>
          </div>
        )}

        {existingPlans.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-orange-600" />
              Existing Meal Plans
            </h2>
            <div className="space-y-3">
              {existingPlans.map((plan) => (
                <div key={plan._id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {plan.dietType} - {new Date(plan.planDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Feeding: {plan.feedingMethod} | Texture: {plan.texture}
                      </p>
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          plan.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-orange-600 to-yellow-600 p-6 text-white">
            <h2 className="text-2xl font-bold">Create Meal Plan</h2>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Plan Date</label>
                <input
                  type="date"
                  value={mealPlan.planDate}
                  onChange={(e) => setMealPlan({ ...mealPlan, planDate: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Diet Type</label>
                <select
                  value={mealPlan.dietType}
                  onChange={(e) => setMealPlan({ ...mealPlan, dietType: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Regular">Regular</option>
                  <option value="Soft">Soft</option>
                  <option value="Liquid">Liquid</option>
                  <option value="Full Liquid">Full Liquid</option>
                  <option value="Clear Liquid">Clear Liquid</option>
                  <option value="Pureed">Pureed</option>
                  <option value="Low Sodium">Low Sodium</option>
                  <option value="Low Fat">Low Fat</option>
                  <option value="Diabetic">Diabetic</option>
                  <option value="Renal">Renal</option>
                  <option value="Cardiac">Cardiac</option>
                  <option value="High Protein">High Protein</option>
                  <option value="Low Protein">Low Protein</option>
                  <option value="Gluten Free">Gluten Free</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="NPO (Nothing by Mouth)">NPO (Nothing by Mouth)</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <MealSection
              title="Breakfast"
              icon={<Coffee className="w-5 h-5 text-yellow-600" />}
              mealType="breakfast"
              meal={mealPlan.meals.breakfast}
              onAddItem={addMealItem}
              onRemoveItem={removeMealItem}
              onUpdateTime={(time) =>
                setMealPlan({
                  ...mealPlan,
                  meals: {
                    ...mealPlan.meals,
                    breakfast: { ...mealPlan.meals.breakfast, time },
                  },
                })
              }
              onUpdateInstructions={(specialInstructions) =>
                setMealPlan({
                  ...mealPlan,
                  meals: {
                    ...mealPlan.meals,
                    breakfast: { ...mealPlan.meals.breakfast, specialInstructions },
                  },
                })
              }
              color="yellow"
            />

            <MealSection
              title="Lunch"
              icon={<Sun className="w-5 h-5 text-orange-600" />}
              mealType="lunch"
              meal={mealPlan.meals.lunch}
              onAddItem={addMealItem}
              onRemoveItem={removeMealItem}
              onUpdateTime={(time) =>
                setMealPlan({
                  ...mealPlan,
                  meals: {
                    ...mealPlan.meals,
                    lunch: { ...mealPlan.meals.lunch, time },
                  },
                })
              }
              onUpdateInstructions={(specialInstructions) =>
                setMealPlan({
                  ...mealPlan,
                  meals: {
                    ...mealPlan.meals,
                    lunch: { ...mealPlan.meals.lunch, specialInstructions },
                  },
                })
              }
              color="orange"
            />

            <MealSection
              title="Dinner"
              icon={<Moon className="w-5 h-5 text-blue-600" />}
              mealType="dinner"
              meal={mealPlan.meals.dinner}
              onAddItem={addMealItem}
              onRemoveItem={removeMealItem}
              onUpdateTime={(time) =>
                setMealPlan({
                  ...mealPlan,
                  meals: {
                    ...mealPlan.meals,
                    dinner: { ...mealPlan.meals.dinner, time },
                  },
                })
              }
              onUpdateInstructions={(specialInstructions) =>
                setMealPlan({
                  ...mealPlan,
                  meals: {
                    ...mealPlan.meals,
                    dinner: { ...mealPlan.meals.dinner, specialInstructions },
                  },
                })
              }
              color="blue"
            />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Snacks</h3>
                <button
                  onClick={addSnack}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Snack
                </button>
              </div>
              <div className="space-y-4">
                {mealPlan.meals.snacks.map((snack, index) => (
                  <SnackSection
                    key={index}
                    index={index}
                    snack={snack}
                    onAddItem={addSnackItem}
                    onRemoveItem={removeSnackItem}
                    onUpdateTime={(time) => {
                      const updatedSnacks = [...mealPlan.meals.snacks];
                      updatedSnacks[index].time = time;
                      setMealPlan({
                        ...mealPlan,
                        meals: { ...mealPlan.meals, snacks: updatedSnacks },
                      });
                    }}
                    onRemove={() => removeSnack(index)}
                  />
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Texture</label>
                <select
                  value={mealPlan.texture}
                  onChange={(e) => setMealPlan({ ...mealPlan, texture: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Regular">Regular</option>
                  <option value="Minced">Minced</option>
                  <option value="Pureed">Pureed</option>
                  <option value="Liquid">Liquid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Fluid Consistency
                </label>
                <select
                  value={mealPlan.fluidConsistency}
                  onChange={(e) =>
                    setMealPlan({ ...mealPlan, fluidConsistency: e.target.value })
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="Thin">Thin</option>
                  <option value="Nectar Thick">Nectar Thick</option>
                  <option value="Honey Thick">Honey Thick</option>
                  <option value="Pudding Thick">Pudding Thick</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Feeding Method
                </label>
                <select
                  value={mealPlan.feedingMethod}
                  onChange={(e) => setMealPlan({ ...mealPlan, feedingMethod: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Oral">Oral</option>
                  <option value="NG Tube">NG Tube</option>
                  <option value="PEG Tube">PEG Tube</option>
                  <option value="TPN">TPN</option>
                  <option value="IV Nutrition">IV Nutrition</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={mealPlan.assistanceRequired}
                    onChange={(e) =>
                      setMealPlan({ ...mealPlan, assistanceRequired: e.target.checked })
                    }
                    className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded"
                  />
                  <span className="text-sm font-bold text-gray-700">Assistance Required</span>
                </label>

                {mealPlan.assistanceRequired && (
                  <select
                    value={mealPlan.assistanceLevel}
                    onChange={(e) =>
                      setMealPlan({ ...mealPlan, assistanceLevel: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Independent">Independent</option>
                    <option value="Setup Only">Setup Only</option>
                    <option value="Supervision">Supervision</option>
                    <option value="Partial Assistance">Partial Assistance</option>
                    <option value="Full Assistance">Full Assistance</option>
                  </select>
                )}
              </div>

              <div>
                <label className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={mealPlan.dieticianConsulted}
                    onChange={(e) =>
                      setMealPlan({ ...mealPlan, dieticianConsulted: e.target.checked })
                    }
                    className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded"
                  />
                  <span className="text-sm font-bold text-gray-700">Dietician Consulted</span>
                </label>

                {mealPlan.dieticianConsulted && (
                  <input
                    type="text"
                    value={mealPlan.dieticianName}
                    onChange={(e) =>
                      setMealPlan({ ...mealPlan, dieticianName: e.target.value })
                    }
                    placeholder="Dietician name"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                )}
              </div>
            </div>

            <RestrictionSection
              restrictions={mealPlan.restrictions}
              onAdd={addRestriction}
              onRemove={removeRestriction}
            />

            <NutritionalRequirements
              requirements={mealPlan.nutritionalRequirements}
              onChange={(field, value) =>
                setMealPlan({
                  ...mealPlan,
                  nutritionalRequirements: {
                    ...mealPlan.nutritionalRequirements,
                    [field]: value,
                  },
                })
              }
            />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Special Considerations
              </label>
              <textarea
                value={mealPlan.specialConsiderations}
                onChange={(e) =>
                  setMealPlan({ ...mealPlan, specialConsiderations: e.target.value })
                }
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows="3"
                placeholder="Any special considerations..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Additional Notes
              </label>
              <textarea
                value={mealPlan.notes}
                onChange={(e) => setMealPlan({ ...mealPlan, notes: e.target.value })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows="4"
                placeholder="Any additional notes..."
              />
            </div>

            <button
              onClick={saveMealPlan}
              disabled={saving}
              className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-orange-700 hover:to-yellow-700 transition-all duration-200 shadow-xl hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {saving ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving Meal Plan...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Save Meal Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MealSection({
  title,
  icon,
  mealType,
  meal,
  onAddItem,
  onRemoveItem,
  onUpdateTime,
  onUpdateInstructions,
  color,
}) {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    onAddItem(mealType, newItem);
    setNewItem("");
  };

  const colorClasses = {
    yellow: "bg-yellow-50 border-yellow-100 text-yellow-900",
    orange: "bg-orange-50 border-orange-100 text-orange-900",
    blue: "bg-blue-50 border-blue-100 text-blue-900",
  };

  return (
    <div className={`p-5 ${colorClasses[color]} rounded-2xl border`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <input
          type="time"
          value={meal.time}
          onChange={(e) => onUpdateTime(e.target.value)}
          className="p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="space-y-3 mb-4">
        {meal.items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
            <span className="text-sm font-medium text-gray-900">{item}</span>
            <button
              onClick={() => onRemoveItem(mealType, index)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add food item..."
          className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <textarea
        value={meal.specialInstructions}
        onChange={(e) => onUpdateInstructions(e.target.value)}
        placeholder="Special instructions..."
        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        rows="2"
      />
    </div>
  );
}

function SnackSection({ index, snack, onAddItem, onRemoveItem, onUpdateTime, onRemove }) {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    onAddItem(index, newItem);
    setNewItem("");
  };

  return (
    <div className="p-5 bg-green-50 border border-green-100 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-bold text-green-900">Snack {index + 1}</h4>
        <div className="flex items-center gap-3">
          <input
            type="time"
            value={snack.time}
            onChange={(e) => onUpdateTime(e.target.value)}
            className="p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={onRemove}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {snack.items.map((item, itemIndex) => (
          <div
            key={itemIndex}
            className="flex items-center justify-between p-3 bg-white rounded-lg"
          >
            <span className="text-sm font-medium text-gray-900">{item}</span>
            <button
              onClick={() => onRemoveItem(index, itemIndex)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add snack item..."
          className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function RestrictionSection({ restrictions, onAdd, onRemove }) {
  const [newItems, setNewItems] = useState({
    allergies: "",
    intolerances: "",
    culturalRestrictions: "",
    religiousRestrictions: "",
    dislikes: "",
  });

  const handleAdd = (type) => {
    if (newItems[type].trim()) {
      onAdd(type, newItems[type]);
      setNewItems({ ...newItems, [type]: "" });
    }
  };

  const restrictionTypes = [
    { key: "allergies", label: "Allergies", color: "red" },
    { key: "intolerances", label: "Intolerances", color: "orange" },
    { key: "culturalRestrictions", label: "Cultural Restrictions", color: "blue" },
    { key: "religiousRestrictions", label: "Religious Restrictions", color: "purple" },
    { key: "dislikes", label: "Dislikes", color: "gray" },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Dietary Restrictions</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {restrictionTypes.map(({ key, label, color }) => (
          <div key={key} className={`p-4 bg-${color}-50 border border-${color}-100 rounded-xl`}>
            <h4 className="text-sm font-bold text-gray-700 mb-3">{label}</h4>
            <div className="space-y-2 mb-3">
              {restrictions[key].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded-lg"
                >
                  <span className="text-sm text-gray-900">{item}</span>
                  <button
                    onClick={() => onRemove(key, index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItems[key]}
                onChange={(e) => setNewItems({ ...newItems, [key]: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && handleAdd(key)}
                placeholder={`Add ${label.toLowerCase()}...`}
                className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <button
                onClick={() => handleAdd(key)}
                className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NutritionalRequirements({ requirements, onChange }) {
  const fields = [
    { key: "calories", label: "Calories", placeholder: "e.g., 2000 kcal/day" },
    { key: "protein", label: "Protein", placeholder: "e.g., 50g/day" },
    { key: "carbohydrates", label: "Carbohydrates", placeholder: "e.g., 250g/day" },
    { key: "fat", label: "Fat", placeholder: "e.g., 70g/day" },
    { key: "fiber", label: "Fiber", placeholder: "e.g., 25g/day" },
    { key: "sodium", label: "Sodium", placeholder: "e.g., 2000mg/day" },
    { key: "fluids", label: "Fluids", placeholder: "e.g., 2000ml/day" },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Nutritional Requirements</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <input
              type="text"
              value={requirements[key]}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        ))}
        <div className="md:col-span-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Other Requirements
          </label>
          <textarea
            value={requirements.otherRequirements}
            onChange={(e) => onChange("otherRequirements", e.target.value)}
            placeholder="Any other nutritional requirements..."
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            rows="3"
          />
        </div>
      </div>
    </div>
  );
}

export default withAuth(MealPlanningPage, ["dietician", "doctor", "nurse"]);
