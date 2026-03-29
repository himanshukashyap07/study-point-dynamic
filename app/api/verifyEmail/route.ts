import { User } from "@/lib/models/User";
import connectDB from "@/lib/db";
import { secretVerification } from "@/schemas/UserSchema";

import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const mail = searchParams.get("email") || ""
    const secretCode = searchParams.get("secret") || ""
    try {
        const validateParams = secretVerification.safeParse({ email: mail, secret: secretCode })
        if (!validateParams.success) {
            return NextResponse.json({ message: "credentials are not valid" }, { status: 400 });
        }
        const { email, secret } = validateParams.data
        await connectDB()
        const user = await User.findOne({ email })
        if (!user) {
            return NextResponse.json({ message: "user not found" }, { status: 404 });
        }

        const isSecretCorrect = (secret === user.verificationCode);
        if (!isSecretCorrect) {
            return NextResponse.json({ message: "secret are not valid" }, { status: 400 });
        }
        await User.findOneAndUpdate({ email: user.email }, {
            $set: {
                isVerified: true
            },
            $unset: {
                verificationCode: 1
            }
        })

        return NextResponse.json({ message: "user verification successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "internal server error in verifing user" }, { status: 500 });
    }

}