import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { username, email, password, avatar } = body;

        if (!username || !email || !password) {
            return NextResponse.json({ message: "Username, email, and password are required" }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (!existingUser.isVerified) {
                return NextResponse.json({ message: "user email is not verified" }, { status: 409 });
            }
            return NextResponse.json({ message: "user already exists" }, { status: 409 });
        }

        const assignedRole = (email === process.env.ADMIN_EMAIL) ? "admin" : "student";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const secrete = await bcrypt.hash(email, 10)

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            avatar: avatar || "https://ik.imagekit.io/samanKridho/guest.png",
            role: assignedRole,
            verificationCode: secrete,
            isVerified: false,
        });
        //send a Verification Email

        const emailResponse = await sendVerificationEmail(email, username, secrete);
        if (!emailResponse.success) {
            console.error("Warning: Verification email failed to send.");
        }

        return NextResponse.json({
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            }
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error", error }, { status: 500 });
    }
}
