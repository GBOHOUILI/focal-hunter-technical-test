import "dotenv/config";
import { logger } from "./logger";
import { signupNotificationWorker } from "./signup-notification.worker";

logger.info("Worker started, listening for signup-notification jobs...");

// Graceful shutdown: stop accepting new jobs and let any in-flight job
// finish before the process exits — avoids killing a job mid-processing.
async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down...`);

  try {
    await signupNotificationWorker.close();
    logger.info("Worker closed cleanly.");
    process.exit(0);
  } catch (err) {
    logger.error({ err }, "Error during shutdown");
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
