import app from "./app.js";
import connectDB from "./config/database.js";
import { PORTNUM } from "./config/env.js";
import { startEmailConsumer, disconnectConsumer } from "./utils/kafka/consumer.js";
import { disconnectProducer } from "./utils/kafka/producer.js";

const startServer = async () => {
  try {
    await connectDB();

    // Start the Kafka email consumer
    startEmailConsumer().catch((err) => {
      console.error("⚠️  Kafka email consumer failed to start:", err.message);
      console.error("   Emails will not be sent until Kafka is available.");
    });

    const server = app.listen(PORTNUM, () => {
      console.log(`Server is running on port ${PORTNUM}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down gracefully...`);
      server.close(async () => {
        await disconnectConsumer().catch(() => {});
        await disconnectProducer().catch(() => {});
        console.log("Server shut down.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

startServer();