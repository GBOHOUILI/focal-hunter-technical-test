import { Worker, Job } from "bullmq";
import { redisConnection } from "./queue/connection";
import { SIGNUP_NOTIFICATION_QUEUE } from "@zte/shared";
import type { SignupNotificationJobPayload } from "@zte/shared";
import { sendSignupNotificationEmail } from "./mail/mail.service";
import { SignupsRepository } from "./database/signups.repository";
import { logger } from "./logger";

const signupsRepository = new SignupsRepository();

async function processor(job: Job<SignupNotificationJobPayload>): Promise<void> {
  await sendSignupNotificationEmail(job.data);
  await signupsRepository.updateStatus(job.data.signupId, "sent");
}

export const signupNotificationWorker = new Worker<SignupNotificationJobPayload>(
  SIGNUP_NOTIFICATION_QUEUE,
  processor,
  { connection: redisConnection }
);

signupNotificationWorker.on("completed", (job) => {
  logger.info({ jobId: job.id, signupId: job.data.signupId }, "Job completed");
});

signupNotificationWorker.on("failed", async (job, err) => {
  logger.error(
    { jobId: job?.id, signupId: job?.data.signupId, err: err.message },
    "Job failed"
  );

  // Only mark as "failed" once ALL retry attempts are exhausted —
  // not on every individual failed attempt (BullMQ retries automatically first).
  if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
    await signupsRepository.updateStatus(job.data.signupId, "failed");
  }
});
