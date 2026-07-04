import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { checkDbConnection } from "./db/pool";

async function main(): Promise<void> {
  const dbOk = await checkDbConnection();
  if (!dbOk) {
    logger.warn("Could not reach the database on startup. The server will still start; check DATABASE_URL.");
  }

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`Acowale feedback API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
