import { sendEmailVerification } from "./utils/emailSender.js";

async function test() {
  console.log("Testing email sender directly...");
  const success = await sendEmailVerification("test-email@example.com", "dummy-token-123");
  console.log("Email send success:", success);
}

test();
