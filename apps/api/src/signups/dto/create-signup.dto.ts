import { createSignupSchema } from "@zte/shared";
import type { SignupStatus } from "@zte/shared";

// Re-exported from shared so the controller only ever imports from this module,
// not directly from @zte/shared — keeps the module self-contained.
export { createSignupSchema };

export interface SignupResponseDto {
  id: string;
  productId: string;
  email: string;
  status: SignupStatus;
  createdAt: string;
}
