import { Kafka, logLevel } from "kafkajs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || "kuralew-backend";

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
  logLevel: logLevel.WARN,
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

export const TOPICS = {
  EMAIL_VERIFICATION: "email.verification",
  EMAIL_PASSWORD_RESET: "email.password-reset",
  EMAIL_PAYMENT_CONFIRMATION: "email.payment-confirmation",
  EMAIL_PAYMENT_RECEIVED: "email.payment-received",
  EMAIL_ORDER_NOTIFICATION: "email.order-notification",
};

export default kafka;
