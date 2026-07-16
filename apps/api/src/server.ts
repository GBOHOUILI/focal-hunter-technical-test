import "dotenv/config";
import { createApp } from "./app";
import { env } from "./common/config/env";
import { logger } from "./common/logger";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`API running on port ${env.PORT} (${env.NODE_ENV})`);
});
