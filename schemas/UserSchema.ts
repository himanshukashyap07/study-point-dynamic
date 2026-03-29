import { email, z } from 'zod';

export const emailValidationRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const LoginSchema = z.object({
    email: z.string().regex(emailValidationRegex, { message: "Invalid email address format" }),
    password: z.string().min(1, "Password is required")
});

export const secretVerification = z.object({
    email: z.string().regex(emailValidationRegex, { message: "Invalid email address format" }),
    secret: z.string().min(1, "Password is required")
})