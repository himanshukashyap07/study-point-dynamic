import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { User } from '@/lib/models/User'
import { LoginSchema } from "@/schemas/UserSchema";
import GoogleProvider from "next-auth/providers/google";


export const authOption: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_GOOGLE_CLIENT_ID!,
            clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET!
        }),
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email ", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await connectDB();
                try {
                    const result = LoginSchema.safeParse(credentials);
                    if (!result.success) {
                        return null;
                    }
                    const { email, password } = result.data;

                    const user = await User.findOne({ email });

                    if (!user) {
                        return null;
                    }

                    if (!user.isVerified) {
                        return null;
                    }

                    const isPasswordCorrect = await bcrypt.compare(password, user.password)

                    if (!isPasswordCorrect) {
                        return null;
                    }
                    return user;
                } catch (error: any) {
                    console.log(error);
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.email = user.email || ""
            }
            await connectDB();
            const dbUser = await User.findOne({ email: token.email })
            token._id = dbUser._id?.toString() || ""
            token.username = dbUser.username || ""
            token.email = dbUser.email || ""
            token.role = dbUser.role || "";
            token.avatar = dbUser.avatar || "";
            token.isVerified = dbUser.isVerified || false;
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    _id: token._id,
                    username: token.username,
                    email: token.email,
                    role: token.role,
                    avatar: token.avatar,
                    isVerified: token.isVerified
                };
            }
            return session;
        },
        async signIn({ user, profile }) {
            await connectDB()
            const newUser = await User.findOne({ email: user.email });
            if (!newUser) {
                const hashPassword = await bcrypt.hash(new Date().toString(), 10)
                await User.create({
                    username: user.name,
                    email: user.email,
                    avatar: user.image,
                    password: hashPassword,
                    isVerified: (profile as any)?.email_verified || false
                })
            }
            return true
        }


    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET
}














