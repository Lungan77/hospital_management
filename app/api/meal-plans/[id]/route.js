import { connectDB } from "@/lib/mongodb";
import MealPlan from "@/models/MealPlan";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req, { params }) {
  const auth = await isAuthenticated(req, ["dietician", "doctor", "nurse", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { id } = await params;
    const mealPlan = await MealPlan.findById(id).lean();

    if (!mealPlan) {
      return Response.json({ error: "Meal plan not found" }, { status: 404 });
    }

    return Response.json({ mealPlan });
  } catch (error) {
    console.error("Error fetching meal plan:", error);
    return Response.json(
      { error: "Failed to fetch meal plan" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const auth = await isAuthenticated(req, ["dietician", "doctor", "nurse"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { id } = await params;
    const data = await req.json();

    const mealPlan = await MealPlan.findByIdAndUpdate(
      id,
      {
        ...data,
        lastModifiedBy: {
          userId: auth.session.user.id,
          name: auth.session.user.name,
          role: auth.session.user.role,
        },
        lastModifiedAt: new Date(),
      },
      { new: true }
    );

    if (!mealPlan) {
      return Response.json({ error: "Meal plan not found" }, { status: 404 });
    }

    return Response.json({ mealPlan });
  } catch (error) {
    console.error("Error updating meal plan:", error);
    return Response.json(
      { error: "Failed to update meal plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const auth = await isAuthenticated(req, ["dietician", "doctor", "nurse", "admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { id } = await params;
    const mealPlan = await MealPlan.findByIdAndDelete(id);

    if (!mealPlan) {
      return Response.json({ error: "Meal plan not found" }, { status: 404 });
    }

    return Response.json({ message: "Meal plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    return Response.json(
      { error: "Failed to delete meal plan" },
      { status: 500 }
    );
  }
}
