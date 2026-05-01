/**
 * Email Service — Public API
 *
 * This module is imported by controllers. Instead of sending emails directly
 * via nodemailer (which blocks the request and fails silently when SMTP is
 * misconfigured), it publishes email events to Kafka topics.
 *
 * A separate Kafka consumer (utils/kafka/consumer.js) picks up these events
 * and delivers the emails asynchronously via nodemailer.
 */
import { publishEmailEvent } from "./kafka/producer.js";
import { TOPICS } from "../config/kafka.js";

export async function sendEmailVerification(email, verificationToken) {
  return publishEmailEvent(TOPICS.EMAIL_VERIFICATION, {
    to: email,
    verificationToken,
  });
}

export async function sendPasswordResetEmail(email, resetToken) {
  return publishEmailEvent(TOPICS.EMAIL_PASSWORD_RESET, {
    to: email,
    resetToken,
  });
}

export async function sendPaymentPromoCode(email, { promoCode, amount, method, transactionRef, buyerName }) {
  return publishEmailEvent(TOPICS.EMAIL_PAYMENT_CONFIRMATION, {
    to: email,
    promoCode,
    amount,
    method,
    transactionRef,
    buyerName,
  });
}

export async function sendPaymentReceivedEmail(email, { amount, buyerName, listingTitle, transactionRef, orderId }) {
  return publishEmailEvent(TOPICS.EMAIL_PAYMENT_RECEIVED, {
    to: email,
    amount,
    buyerName,
    listingTitle,
    transactionRef,
    orderId,
  });
}

export async function sendOrderNotification(email, orderDetails) {
  return publishEmailEvent(TOPICS.EMAIL_ORDER_NOTIFICATION, {
    to: email,
    ...orderDetails,
  });
}
