import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function GET(req) {
  const auth = await isAuthenticated(req, ["admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const users = await User.find({ role: { $ne: "admin" } }).select("name title email phone gender role isActive");

    return Response.json({ users }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Error fetching users" }, { status: 500 });
  }
}

export async function PUT(req) {
  const auth = await isAuthenticated(req, ["admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const body = await req.json();
    const { userId, name, title, email, phone, gender, role } = body;

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (title) updateData.title = title;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ message: "User updated successfully", user }, { status: 200 });
  } catch (error) {
    if (error.code === 11000) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }
    return Response.json({ error: "Error updating user" }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = await isAuthenticated(req, ["admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const body = await req.json();
    const { userId, isActive } = body;

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    if (typeof isActive !== "boolean") {
      return Response.json({ error: "isActive must be a boolean" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Error updating user status" }, { status: 500 });
  }
}