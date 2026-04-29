import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

console.log("Email Service - EMAIL_USER:", process.env.EMAIL_USER ? "set" : "not set");
console.log("Email Service - EMAIL_PASS:", process.env.EMAIL_PASS ? "set" : "not set");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter on startup (only if credentials exist)
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.error("Email transporter verification failed:", error.message);
    } else {
      console.log("Email transporter is ready");
    }
  });
} else {
  console.log("Email transporter not configured - EMAIL_USER or EMAIL_PASS not set");
}

const BASE = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">
    <div style="background:#4F46E5;padding:16px 24px;border-radius:8px 8px 0 0;">
      <h1 style="color:white;margin:0;font-size:20px;">Kuralew Marketplace</h1>
    </div>
    <div style="background:white;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
      {{CONTENT}}
    </div>
    <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:16px;">© Kuralew Marketplace</p>
  </div>
`;

function wrap(content) {
  return BASE.replace("{{CONTENT}}", content);
}

async function send(to, subject, html) {
  try {
    console.log(`Sending email to: ${to}, subject: ${subject}`);
    const info = await transporter.sendMail({
      from: `"Kuralew" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log("Email sent successfully, MessageId:", info.messageId);
    return true;
  } catch (err) {
    console.error("Email error:", err.message);
    console.error("Full error:", err);
    return false;
  }
}

export async function sendPasswordResetEmail(email, resetToken) {
  const url = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  return send(email, "Reset Your Password – Kuralew", wrap(`
    <h2 style="color:#111827;">Password Reset Request</h2>
    <p style="color:#374151;">Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
    <a href="${url}" style="display:inline-block;padding:12px 28px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0;">Reset Password</a>
    <p style="color:#6b7280;font-size:13px;">Or copy: <span style="word-break:break-all;">${url}</span></p>
    <p style="color:#9ca3af;font-size:12px;">If you didn't request this, ignore this email.</p>
  `));
}

export async function sendEmailVerification(email, verificationToken) {
  const url = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  return send(email, "Verify Your Email – Kuralew", wrap(`
    <h2 style="color:#111827;">Verify Your Email</h2>
    <p style="color:#374151;">Thanks for joining Kuralew! Verify your email to unlock payments and all features.</p>
    <a href="${url}" style="display:inline-block;padding:12px 28px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0;">Verify Email</a>
    <p style="color:#6b7280;font-size:13px;">Link expires in 24 hours.</p>
  `));
}

export async function sendPaymentPromoCode(email, { promoCode, amount, method, transactionRef, buyerName }) {
  return send(email, `Payment Confirmation – ${transactionRef}`, wrap(`
    <h2 style="color:#111827;">Payment Confirmed ✅</h2>
    <p style="color:#374151;">Hi <strong>${buyerName}</strong>, your payment has been received and is held in escrow.</p>
    <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
      <p style="margin:4px 0;"><strong>Transaction Ref:</strong> ${transactionRef}</p>
      <p style="margin:4px 0;"><strong>Amount:</strong> ${amount} ETB</p>
      <p style="margin:4px 0;"><strong>Method:</strong> ${method}</p>
      ${promoCode ? `<p style="margin:4px 0;"><strong>Promo Code Applied:</strong> <span style="color:#4F46E5;font-weight:700;">${promoCode}</span></p>` : ""}
    </div>
    <p style="color:#374151;">Funds will be released to the seller once you confirm delivery.</p>
    <a href="${process.env.CLIENT_URL}/orders" style="display:inline-block;padding:12px 28px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0;">View Orders</a>
  `));
}

export async function sendPaymentReceivedEmail(email, { amount, buyerName, listingTitle, transactionRef, orderId }) {
  return send(email, `You received a payment – Kuralew`, wrap(`
    <h2 style="color:#111827;">Payment Received 💰</h2>
    <p style="color:#374151;"><strong>${buyerName}</strong> paid for your listing.</p>
    <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
      <p style="margin:4px 0;"><strong>Listing:</strong> ${listingTitle}</p>
      <p style="margin:4px 0;"><strong>Amount:</strong> ${amount} ETB</p>
      <p style="margin:4px 0;"><strong>Transaction Ref:</strong> ${transactionRef}</p>
    </div>
    <p style="color:#374151;">Funds are in escrow and will be released after the buyer confirms delivery.</p>
    <a href="${process.env.CLIENT_URL}/orders/${orderId}" style="display:inline-block;padding:12px 28px;background:#059669;color:white;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0;">View Order</a>
  `));
}

export async function sendOrderNotification(email, orderDetails) {
  return send(email, "New Order – Kuralew", wrap(`
    <h2 style="color:#111827;">New Order Received</h2>
    <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
      <p style="margin:4px 0;"><strong>Order ID:</strong> ${orderDetails.orderId}</p>
      <p style="margin:4px 0;"><strong>Product:</strong> ${orderDetails.productTitle}</p>
      <p style="margin:4px 0;"><strong>Price:</strong> ${orderDetails.price} ETB</p>
      <p style="margin:4px 0;"><strong>Buyer:</strong> ${orderDetails.buyerName}</p>
    </div>
    <a href="${process.env.CLIENT_URL}/orders" style="display:inline-block;padding:12px 28px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0;">View Order</a>
  `));
}
