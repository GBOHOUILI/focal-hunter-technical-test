import { z } from "zod";

// Validates the email submitted when a user taps "Add to my list".
export const createSignupSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
});

export type CreateSignupInput = z.infer<typeof createSignupSchema>;
