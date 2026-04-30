import { publishEmailEvent } from "./utils/kafka/producer.js";
import { TOPICS } from "./config/kafka.js";

async function run() {
  console.log("Publishing test event to Kafka...");
  const success = await publishEmailEvent(TOPICS.EMAIL_VERIFICATION, {
    to: "lumsk24@gmail.com",
    verificationToken: "kafka-test-token"
  });
  console.log("Published:", success);
  
  // Exit quickly so the script doesn't hang
  setTimeout(() => process.exit(0), 3000);
}

run();
