import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Import NextAuth config

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 403 }
    );
  }

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

    if (!["doctor", "nurse", "receptionist", "admin", "patient", "labtech"].includes(role)) {
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
    console.log(name, title, email, idNumber, hashedPassword, phone, gender, role)
    const newUser = await User.create({ name, title, email, idNumber, password: hashedPassword, phone, gender, role });
    console.log(1)
    return new Response(
      JSON.stringify({ message: "User created successfully", user: newUser }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
