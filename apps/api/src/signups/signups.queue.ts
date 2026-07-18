import { Queue } from "bullmq";
import { redisConnection } from "../common/queue/connection";
import { env } from "../common/config/env";
import { SIGNUP_NOTIFICATION_QUEUE, SIGNUP_NOTIFICATION_JOB } from "@zte/shared";
import type { SignupNotificationJobPayload } from "@zte/shared";

export const signupNotificationQueue = new Queue<SignupNotificationJobPayload>(
  SIGNUP_NOTIFICATION_QUEUE,
  { connection: redisConnection }
);

// Adds a job to be processed later by the worker, after a delay (not sent immediately).
export async function scheduleSignupNotification(
  payload: SignupNotificationJobPayload
): Promise<void> {
  await signupNotificationQueue.add(SIGNUP_NOTIFICATION_JOB, payload, {
    delay: env.SIGNUP_NOTIFICATION_DELAY_MS,
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  });
}
