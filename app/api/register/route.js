import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, title, email, idNumber, password, phone, gender } = await req.json();
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
    }

    // Validate title
    if (!["Dr", "Mr", "Miss", "Mrs", "Prof", "None"].includes(title)) {
      return new Response(JSON.stringify({ error: "Invalid title" }), { status: 400 });
    }

    // Validate gender
    if (!["Male", "Female", "Other"].includes(gender)) {
      return new Response(JSON.stringify({ error: "Invalid gender" }), { status: 400 });
    }

    // Validate password
    if (!password || password.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters long" }), { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({ 
      name, 
      title, 
      email, 
      idNumber, 
      password: hashedPassword, 
      phone, 
      gender, 
      role: "admin" 
    });

    return new Response(JSON.stringify({ message: "User created successfully", user: newUser }), { status: 201 });
  } catch (error) {
    console.error(error); // Log the error
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
