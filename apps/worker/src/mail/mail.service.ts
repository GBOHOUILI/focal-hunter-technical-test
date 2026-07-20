import type { SignupNotificationJobPayload } from "@zte/shared";
import { logger } from "../logger";

// Simulated email sending — no real provider integration, as explicitly
// allowed by the test brief ("can be simulated, e.g. via a log").
// The artificial delay mimics a realistic network round-trip to a real
// email provider (SendGrid, SES, etc.), so the worker's async behavior
// under load looks like it would with a real integration.
export async function sendSignupNotificationEmail(
  payload: SignupNotificationJobPayload
): Promise<void> {
  await sleep(300);

  logger.info(
    { email: payload.email, productId: payload.productId, signupId: payload.signupId },
    `Email sent to ${payload.email} (simulated)`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
