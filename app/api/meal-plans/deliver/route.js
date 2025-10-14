import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import MealPlan from "@/models/MealPlan";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["doctor", "nurse", "nursing_staff"].includes(session.user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await dbConnect();

    const { mealPlanId, mealType, snackIndex } = await req.json();

    const mealPlan = await MealPlan.findById(mealPlanId);

    if (!mealPlan) {
      return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
    }

    if (mealType === "snack" && snackIndex !== undefined) {
      if (mealPlan.meals.snacks[snackIndex]) {
        mealPlan.meals.snacks[snackIndex].delivered = true;
        mealPlan.meals.snacks[snackIndex].deliveredAt = new Date();
        mealPlan.meals.snacks[snackIndex].deliveredBy = session.user.name;
      }
    } else if (mealPlan.meals[mealType]) {
      mealPlan.meals[mealType].delivered = true;
      mealPlan.meals[mealType].deliveredAt = new Date();
      mealPlan.meals[mealType].deliveredBy = session.user.name;
    }

    mealPlan.lastModifiedBy = {
      userId: session.user.id,
      name: session.user.name,
      role: session.user.role,
    };
    mealPlan.lastModifiedAt = new Date();

    await mealPlan.save();

    return NextResponse.json({ mealPlan });
  } catch (error) {
    console.error("Error marking meal as delivered:", error);
    return NextResponse.json(
      { error: "Failed to mark meal as delivered" },
      { status: 500 }
    );
  }
}
