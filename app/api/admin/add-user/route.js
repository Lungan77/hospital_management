import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { isAuthenticated } from "@/hoc/protectedRoute";

export async function POST(req) {
  const auth = await isAuthenticated(req, ["admin"]);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  try {
    const { name, title, email, idNumber, password, phone, gender, role } = await req.json();
    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User already exists" }),
        { status: 400 }
      );
    }

    if (!["doctor", "nurse", "receptionist", "admin", "patient", "labtech", "dispatcher"].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role" }),
        { status: 400 }
      );
    }

    if (!["Dr", "Mr", "Miss", "Mrs", "Prof"].includes(title)) {
      return new Response(
        JSON.stringify({ error: "Invalid title" }),
        { status: 400 }
      );
    }

    if (!["Male", "Female", "Other"].includes(gender)) {
      return new Response(
        JSON.stringify({ error: "Invalid gender" }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password || "Password01", 10);
    const newUser = await User.create({ name, title, email, idNumber, password: hashedPassword, phone, gender, role });
    
    return new Response(
      JSON.stringify({ message: "User created successfully", user: newUser }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}