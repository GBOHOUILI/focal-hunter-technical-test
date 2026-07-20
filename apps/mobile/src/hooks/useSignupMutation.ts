import { useMutation } from "@tanstack/react-query";
import { submitSignup } from "../api/client";

export function useSignupMutation(productId: string) {
  return useMutation({
    mutationFn: (email: string) => submitSignup(productId, email),
  });
}
