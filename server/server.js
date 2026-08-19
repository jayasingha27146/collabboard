const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { connectDB, closeDB } = require("./config/db");

async function startServer() {
  await connectDB();

  const server = http.createServer(app);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.port}`);
  });

  const shutdown = async () => {
    // eslint-disable-next-line no-console
    console.log("Shutting down gracefully...");
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`Server failed to start: ${error.message}`);
  process.exit(1);
});
