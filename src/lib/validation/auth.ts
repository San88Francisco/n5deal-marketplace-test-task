import { z } from "zod";

import { USER_ROLE } from "@/constants";

const password = z.string().min(10, "Use at least 10 characters").max(200, "That is too long");

const email = z.string().trim().toLowerCase().email("Enter a valid email");

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Tell us your name").max(120),
  email,
  password,
  role: z.enum([USER_ROLE.BUYER, USER_ROLE.SELLER]),
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
