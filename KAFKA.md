# Kuralew Kafka Guide

Welcome! This guide explains why and how we use **Apache Kafka** in our backend. You do not need to be a Kafka expert to work on this project; this document covers everything you need to know.

---

## 1. Why are we using Kafka?

Originally, when a user registered or made a payment, the backend would try to send an email immediately using NodeMailer. 
This caused a few problems:
- **Slow Requests:** Sending an email takes a few seconds. The user would have to stare at a loading screen while waiting for Google's SMTP server to respond.
- **Failures:** If the email server was down or credentials were wrong, the entire user registration would fail and throw an error.

**The Solution:** Asynchronous Event Messaging with Kafka.
Now, when a user registers, the API instantly drops a small message (an "event") into Kafka saying *"Hey, please send an email to this user"*, and immediately returns a `201 Created` response to the frontend.
A background worker (the Consumer) picks up that message and does the heavy lifting of actually sending the email, completely invisible to the user.

---

## 2. How to run it locally

We run Kafka locally using Docker. You must start the Kafka container before starting your Node.js backend.

1. **Start Kafka:**
   Open a terminal in the root project folder (where `docker-compose.yml` is) and run:
   ```bash
   docker compose up -d
   ```
   *(This downloads and runs the official Apache Kafka image in the background).*

2. **Verify it's running:**
   ```bash
   docker ps
   ```
   You should see a container named `kuralew-kafka` up and running.

3. **Start the Backend:**
   Go to the `Backend/` folder and run:
   ```bash
   npm run dev
   ```
   In the console logs, you will see the Kafka producer and consumer connect automatically!

---

## 3. How the Code Works

If you ever need to create a new email notification, here is how the flow works:

### A. The Producer (`Backend/utils/kafka/producer.js`)
This is the tool that "publishes" messages to Kafka. We've created a helper function inside `Backend/utils/emailService.js` that makes this super easy.
If you are writing a new Controller, **always import from `emailService.js`** — do not use NodeMailer directly!

```javascript
// Example inside a Controller:
import { sendOrderNotification } from "../utils/emailService.js";

// Instantly returns, doesn't block!
await sendOrderNotification(user.email, { orderId: 123, price: 50 });
```

### B. The Consumer (`Backend/utils/kafka/consumer.js`)
This is the background worker. When the server boots up, it automatically connects and listens for new messages.
When it receives the message from the example above, it routes it to the actual NodeMailer functions inside `Backend/utils/emailSender.js` to send the physical email.

---

## 4. Troubleshooting

**"This server does not host this topic-partition" error on startup?**
Ignore it! This just means the backend started faster than Kafka could create the topics. We built an auto-retry system that will automatically fix it within a few seconds.

**"Failed to connect to Kafka" or ECONNREFUSED?**
Your Docker container isn't running. Make sure you ran `docker compose up -d`!

**Kafka is running, but emails aren't arriving?**
Check your `Backend/.env` file. You MUST have real Gmail credentials set under `EMAIL_USER` and `EMAIL_PASS`. Note that `EMAIL_PASS` must be a **Google App Password**, not your standard Google login password.
