import kafka from "../../config/kafka.js";

const producer = kafka.producer();
let isConnected = false;

async function connectProducer() {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
    console.log("✅ Kafka producer connected");
  }
}

/**
 * Publish an email event to a Kafka topic.
 * @param {string} topic - The Kafka topic name (use TOPICS from config/kafka.js)
 * @param {object} payload - The email payload (to, subject, template data, etc.)
 */
export async function publishEmailEvent(topic, payload) {
  try {
    await connectProducer();
    await producer.send({
      topic,
      messages: [
        {
          key: payload.to, // partition by recipient email
          value: JSON.stringify({
            ...payload,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`📧 Email event published to topic: ${topic}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to publish email event to ${topic}:`, error.message);
    return false;
  }
}

/**
 * Gracefully disconnect the producer (call on server shutdown).
 */
export async function disconnectProducer() {
  if (isConnected) {
    await producer.disconnect();
    isConnected = false;
    console.log("Kafka producer disconnected");
  }
}

export default producer;
