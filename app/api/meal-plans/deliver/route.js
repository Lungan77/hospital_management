import { connectDB } from "@/lib/mongodb";
import MealPlan from "@/models/MealPlan";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["dietician", "doctor", "nurse", "nursing_staff"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { mealPlanId, mealType, snackIndex } = await req.json();

    const mealPlan = await MealPlan.findById(mealPlanId);

    if (!mealPlan) {
      return Response.json({ error: "Meal plan not found" }, { status: 404 });
    }

    if (mealType === "snack" && snackIndex !== undefined) {
      if (mealPlan.meals.snacks[snackIndex]) {
        mealPlan.meals.snacks[snackIndex].delivered = true;
        mealPlan.meals.snacks[snackIndex].deliveredAt = new Date();
        mealPlan.meals.snacks[snackIndex].deliveredBy = auth.session.user.name;
      }
    } else if (mealPlan.meals[mealType]) {
      mealPlan.meals[mealType].delivered = true;
      mealPlan.meals[mealType].deliveredAt = new Date();
      mealPlan.meals[mealType].deliveredBy = auth.session.user.name;
    }

    mealPlan.lastModifiedBy = {
      userId: auth.session.user.id,
      name: auth.session.user.name,
      role: auth.session.user.role,
    };
    mealPlan.lastModifiedAt = new Date();

    await mealPlan.save();

    return Response.json({ mealPlan });
  } catch (error) {
    console.error("Error marking meal as delivered:", error);
    return Response.json(
      { error: "Failed to mark meal as delivered" },
      { status: 500 }
    );
  }
}
