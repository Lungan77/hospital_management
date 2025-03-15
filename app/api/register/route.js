import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
 try {
     const { name, title, email, Id_number, password, phone, gender} = await req.json();
     await connectDB();
 
     const existingUser = await User.findOne({ email });
     if (existingUser) {
       return Response.json({ error: "User already exists" }, { status: 400 });
     }
 
     if (!["Dr", "Mr", "Miss", "Mrs", "Prof."].includes(title)) {
       return Response.json({ error: "Invalid title" }, { status: 400 });
     }
     
     if (!["Male", "Female", "Other"].includes(gender)) {
       return Response.json({ error: "Invalid gender" }, { status: 400 });
     }
 
     const hashedPassword = await bcrypt.hash(password, 10);
     const newUser = await User.create({ name, title, email, Id_number, password: hashedPassword, phone, gender, role: "patient" });
 
     return Response.json({ message: "User created successfully", user: newUser }, { status: 201 });
   } catch (error) {
     return Response.json({ error: "Internal Server Error" }, { status: 500 });
   }
}
