import kafka, { TOPICS } from "../../config/kafka.js";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendPaymentPromoCode,
  sendPaymentReceivedEmail,
  sendOrderNotification,
} from "../emailSender.js";

const consumer = kafka.consumer({ groupId: "kuralew-email-group" });

/**
 * Map each topic to the handler that actually sends the email via nodemailer.
 */
const topicHandlers = {
  [TOPICS.EMAIL_VERIFICATION]: async (data) => {
    const { to, verificationToken } = data;
    return sendEmailVerification(to, verificationToken);
  },

  [TOPICS.EMAIL_PASSWORD_RESET]: async (data) => {
    const { to, resetToken } = data;
    return sendPasswordResetEmail(to, resetToken);
  },

  [TOPICS.EMAIL_PAYMENT_CONFIRMATION]: async (data) => {
    const { to, ...details } = data;
    return sendPaymentPromoCode(to, details);
  },

  [TOPICS.EMAIL_PAYMENT_RECEIVED]: async (data) => {
    const { to, ...details } = data;
    return sendPaymentReceivedEmail(to, details);
  },

  [TOPICS.EMAIL_ORDER_NOTIFICATION]: async (data) => {
    const { to, ...orderDetails } = data;
    return sendOrderNotification(to, orderDetails);
  },
};

/**
 * Start consuming email events from all email topics.
 */
export async function startEmailConsumer() {
  try {
    await consumer.connect();
    console.log("✅ Kafka email consumer connected");

    // Initialize topics using Admin client to prevent "This server does not host this topic-partition" error
    const admin = kafka.admin();
    await admin.connect();
    const existingTopics = await admin.listTopics();
    const topicsToCreate = Object.values(TOPICS).filter((topic) => !existingTopics.includes(topic));
    
    if (topicsToCreate.length > 0) {
      console.log(`Creating missing topics: ${topicsToCreate.join(", ")}`);
      await admin.createTopics({
        topics: topicsToCreate.map((topic) => ({ topic, numPartitions: 3, replicationFactor: 1 })),
      });
    }
    await admin.disconnect();

    // Subscribe to every email topic
    for (const topic of Object.values(TOPICS)) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        const handler = topicHandlers[topic];

        if (!handler) {
          console.warn(`⚠️  No handler for topic: ${topic}`);
          return;
        }

        console.log(`📨 Processing email event from topic: ${topic} | to: ${data.to}`);

        try {
          const success = await handler(data);
          if (success) {
            console.log(`✅ Email sent successfully | topic: ${topic} | to: ${data.to}`);
          } else {
            console.error(`❌ Email sending returned false | topic: ${topic} | to: ${data.to}`);
          }
        } catch (error) {
          console.error(`❌ Error processing email event | topic: ${topic}:`, error.message);
        }
      },
    });

    console.log("📧 Kafka email consumer is running and listening for events...");
  } catch (error) {
    console.error("❌ Failed to start email consumer:", error.message);
    // Retry connection after delay
    setTimeout(() => startEmailConsumer(), 5000);
  }
}

/**
 * Gracefully disconnect the consumer (call on server shutdown).
 */
export async function disconnectConsumer() {
  await consumer.disconnect();
  console.log("Kafka email consumer disconnected");
}

export default consumer;
