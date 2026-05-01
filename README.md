# Digital Kuralew — GDG 2026 Hackathon Project

A full-stack peer-to-peer marketplace built for Ethiopia, where buyers and sellers can trade everyday goods with trust, transparency, and local payment support.

**Live URLs**
- Backend API: https://gdg-2026-hackathon-project.onrender.com/api/v1
- Frontend: https://gdg-2026-hackathon-project.vercel.app

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Setup & Installation](#setup--installation)
- [API Reference](#api-reference)
- [Data Models](#data-models)

---

## Features

### For Buyers
- Browse and search active listings with filters (category, condition, price range, sort)
- View seller trust scores and profiles
- Add items to cart and checkout
- Create orders and pay via escrow
- Release payment to seller after confirming delivery
- Request refunds on held payments
- Leave reviews after completed orders
- Real-time in-app notifications
- Interactive map view of nearby listings (Leaflet)

### For Sellers
- Create, update, and delete product listings with images and geo-location
- Listings default to Addis Ababa if no location is provided
- View incoming orders and manage their status
- Mark listings as sold
- Receive payment notifications and email alerts when a buyer pays
- Build a trust score through buyer reviews

### For Admins
- View and manage all users (activate/deactivate accounts)
- Approve or reject listings before they go live
- Moderate chat messages
- View platform-wide statistics and dashboard

### Platform-wide
- JWT authentication with access + refresh token rotation
- Email verification required before making payments
- Password reset via email link
- Kafka-powered async email delivery (payment receipts, promo codes, verification emails)
- Escrow payment system — funds are held until buyer confirms delivery
- Trust score calculated from review ratings (0–100 scale)
- Dark/light theme toggle
- Fully responsive UI

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                         │
│         React 18 + Vite + Tailwind CSS                  │
│   React Router · Leaflet Maps · Lucide Icons            │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (HTTPS)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                    │
│              Express 5 · Mongoose · JWT                 │
│                                                         │
│  Auth · Buyer · Seller · Admin · Orders · Payments      │
│  Cart · Chat · Reviews · Notifications                  │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
           ▼                          ▼
    ┌─────────────┐           ┌──────────────┐
    │   MongoDB   │           │    Kafka      │
    │  (Mongoose) │           │  (KRaft mode) │
    └─────────────┘           └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │  Email       │
                              │  Consumer    │
                              │ (Nodemailer) │
                              └──────────────┘
```

**Payment escrow flow:**
```
Buyer creates order → Initiates payment → Funds held in escrow
       → Buyer confirms delivery → Funds released to seller
       → (or) Refund requested → Funds returned to buyer
```

---

## Tech Stack

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server and routing |
| MongoDB + Mongoose 9 | Database and ODM |
| jsonwebtoken | Access and refresh token auth |
| bcrypt | Password hashing |
| KafkaJS | Async email event queue |
| Nodemailer | Email delivery |
| Joi | Request validation |
| Multer | Avatar image uploads (base64) |
| Helmet + CORS | Security headers |
| Morgan | HTTP request logging |

### Frontend
| Package | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router 7 | Client-side routing |
| Tailwind CSS 3 | Utility-first styling |
| Leaflet + React-Leaflet | Interactive maps |
| Lucide React | Icon library |

### Infrastructure
| Service | Purpose |
|---|---|
| Apache Kafka 3.7 (KRaft) | Async email event streaming |
| Docker Compose | Local Kafka setup |
| Render | Backend hosting |
| Vercel | Frontend hosting |
| MongoDB Atlas | Cloud database |

---

## Project Structure

```
GDG-2026-Hackathon-Project/
├── docker-compose.yml          # Kafka (KRaft mode, no Zookeeper)
├── README.md
│
├── Backend/
│   ├── app.js                  # Express app, middleware, routes
│   ├── server.js               # Entry point, DB connect, Kafka consumer start
│   ├── seed.js                 # Database seeder
│   ├── package.json
│   │
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   ├── env.js              # Environment variable exports
│   │   └── kafka.js            # Kafka client + topic definitions
│   │
│   ├── controller/
│   │   ├── authController.js   # Register, login, logout, profile, password reset, email verify
│   │   ├── buyerController.js  # Browse listings, get listing detail
│   │   ├── sellerController.js # CRUD listings, seller orders
│   │   ├── orderController.js  # Create and manage orders
│   │   ├── paymentController.js# Escrow payments: initiate, confirm, release, refund
│   │   ├── cartController.js   # Cart management
│   │   ├── chatController.js   # Messaging between users
│   │   ├── reviewController.js # Post-order reviews and trust score updates
│   │   ├── notificationController.js
│   │   └── adminController.js  # User management, listing moderation
│   │
│   ├── middleware/
│   │   ├── authentication.js   # JWT verification
│   │   ├── autherization.js    # Role-based access control
│   │   └── errorHandler.js     # Global error handler
│   │
│   ├── models/
│   │   ├── userModel.js
│   │   ├── listingModel.js
│   │   ├── orderModel.js
│   │   ├── paymentModel.js
│   │   ├── cartModel.js
│   │   ├── chatModel.js
│   │   ├── reviewModel.js
│   │   ├── notificationModel.js
│   │   ├── entryModel.js       # Wallet/ledger entries
│   │   └── refreshToken.js
│   │
│   ├── routes/
│   │   ├── authRoute.js
│   │   ├── buyerRoute.js
│   │   ├── sellerRoute.js
│   │   ├── orderRoute.js
│   │   ├── paymentsRoute.js
│   │   ├── cartRoute.js
│   │   ├── chatRoute.js
│   │   ├── reviewRoute.js
│   │   ├── notificationRoute.js
│   │   └── adminRoute.js
│   │
│   ├── utils/
│   │   ├── emailService.js     # Email templates (verification, reset, payment)
│   │   ├── emailSender.js      # Nodemailer transport
│   │   ├── notify.js           # In-app notification helper
│   │   ├── error.util.js
│   │   └── kafka/
│   │       ├── producer.js     # Publish email events to Kafka
│   │       └── consumer.js     # Consume and send emails
│   │
│   └── validation/
│       ├── userValidation.js   # Joi schemas for user input
│       └── chatValidation.js
│
└── Frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx             # Routes definition
        ├── main.jsx
        ├── index.css
        │
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── MarketplacePage.jsx
        │   ├── ListingDetailPage.jsx
        │   ├── CreateListingPage.jsx
        │   ├── SellerDashboardPage.jsx
        │   ├── CartPage.jsx
        │   ├── CheckoutPage.jsx
        │   ├── OrdersPage.jsx
        │   ├── OrderDetailPage.jsx
        │   ├── PaymentsPage.jsx
        │   ├── ChatPage.jsx
        │   ├── AdminDashboardPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── ForgotPasswordPage.jsx
        │   ├── ResetPasswordPage.jsx
        │   ├── VerifyEmailPage.jsx
        │   └── ChangePasswordPage.jsx
        │
        ├── components/
        │   ├── SiteHeader.jsx
        │   ├── ListingCard.jsx
        │   ├── MarketplaceMap.jsx
        │   ├── LocationPicker.jsx
        │   ├── ImageUploader.jsx
        │   ├── NotificationBell.jsx
        │   ├── OrderStatusBadge.jsx
        │   ├── TrustScore.jsx
        │   └── ProtectedRoute.jsx
        │
        ├── context/
        │   ├── AuthContext.jsx
        │   └── CartContext.jsx
        │
        └── lib/
            ├── api.js          # Axios instance with auth headers
            ├── format.js       # Currency and date formatters
            └── tracking.js     # Order tracking helpers
```

---

## Environment Variables

### Backend — `Backend/.env`

Copy `Backend/.env.example` and fill in your values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET_KEY=your_super_secret_access_key
REFRESH_TOKEN_SECRET_KEY=your_super_secret_refresh_key
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_URL=http://localhost:6006

# Kafka (defaults work with the docker-compose setup)
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=kuralew-backend

# Email — use a Gmail App Password, NOT your account password
# Guide: https://support.google.com/accounts/answer/185833
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password
```

### Frontend — `Frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Docker (for Kafka)

### 1. Clone the repo

```bash
git clone https://github.com/TOT8894/GDG-2026-Hackathon-Project.git
cd GDG-2026-Hackathon-Project
```

### 2. Start Kafka

```bash
docker-compose up -d
```

This starts a single-node Kafka broker in KRaft mode (no Zookeeper needed) on port `9092`.

### 3. Start the Backend

```bash
cd Backend
cp .env.example .env
# fill in your .env values
npm install
npm run dev
```

Server starts on ``. Health check: `GET /api/v1/health`

### 4. Start the Frontend

```bash
cd Frontend
npm install
npm run dev
```

App starts on `https://gdg-2026-hackathon-project.vercel.app/` (or whichever port Vite assigns).

### 5. (Optional) Seed the database

```bash
cd Backend
node seed.js
```

---

## API Reference

All endpoints are prefixed with `/api/v1`. Protected routes require:
```
Authorization: Bearer <accessToken>
```

---

### Authentication — `/api/v1/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/signup` | Register a new user | ❌ |
| POST | `/auth/login` | Login and receive tokens | ❌ |
| POST | `/auth/refresh` | Get a new access token | ❌ |
| POST | `/auth/logout` | Invalidate refresh token | ✅ |
| GET | `/auth/me` | Get current user profile | ✅ |
| PUT | `/auth/update-profile` | Update profile fields | ✅ |
| POST | `/auth/change-password` | Change password (invalidates all sessions) | ✅ |
| POST | `/auth/forgot-password` | Send password reset email | ❌ |
| POST | `/auth/reset-password` | Reset password with token | ❌ |
| GET | `/auth/verify-email/:token` | Verify email address | ❌ |
| POST | `/auth/resend-verification` | Resend verification email | ✅ |
| POST | `/auth/upload-avatar` | Upload profile avatar (multipart) | ✅ |

---

### Buyer — `/api/v1/buyer`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/buyer/listings` | Browse active listings (search, filter, paginate) | ❌ |
| GET | `/buyer/listings/:id` | Get listing detail (increments view count) | ❌ |

**Query params for `GET /buyer/listings`:**
- `search` — full-text search on title and description
- `category` — filter by category
- `condition` — `new`, `used`, or `old`
- `minPrice` / `maxPrice` — price range in ETB
- `sort` — `price-low`, `price-high`, `oldest` (default: newest)
- `page` / `limit` — pagination (default: page 1, limit 20)

---

### Seller — `/api/v1/seller`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/seller/listings` | Create a new listing | ✅ seller |
| PUT | `/seller/listings/:id` | Update own listing | ✅ seller |
| DELETE | `/seller/listings/:id` | Delete own listing | ✅ seller |
| PATCH | `/seller/listings/:id/sold` | Mark listing as sold | ✅ seller |
| GET | `/seller/listings` | Get all own listings | ✅ seller |
| GET | `/seller/orders` | Get orders for own listings | ✅ seller |

---

### Orders — `/api/v1/orders`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/orders` | Create an order for a listing | ✅ |
| GET | `/orders` | Get own orders (buyer or seller) | ✅ |
| GET | `/orders/:id` | Get order detail | ✅ |
| PATCH | `/orders/:id/status` | Update order status | ✅ |

---

### Payments — `/api/v1/payments`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/payments/initiate` | Initiate payment (holds funds in escrow) | ✅ verified email |
| POST | `/payments/confirm` | Confirm a pending payment | ✅ |
| POST | `/payments/release` | Release escrow to seller (buyer confirms delivery) | ✅ buyer/admin |
| POST | `/payments/refund` | Refund held payment to buyer | ✅ buyer/seller/admin |
| GET | `/payments` | Get own payment history | ✅ |
| GET | `/payments/:id` | Get payment detail | ✅ participant/admin |

> Email verification is required before initiating any payment.

---

### Cart — `/api/v1/cart`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/cart` | Get current cart | ✅ |
| POST | `/cart` | Add item to cart | ✅ |
| DELETE | `/cart/:itemId` | Remove item from cart | ✅ |
| DELETE | `/cart` | Clear entire cart | ✅ |

---

### Chat — `/api/v1/chat`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/chat` | Send a message (text or image, optionally tied to a listing) | ✅ |
| GET | `/chat` | Get all conversations for current user | ✅ |
| GET | `/chat/conversation/:userId` | Get full conversation with a user | ✅ |
| GET | `/chat/:id` | Get a single message | ✅ |
| DELETE | `/chat/:id` | Delete a message | ✅ |
| PATCH | `/chat/:id/read` | Mark message as read | ✅ |

---

### Reviews — `/api/v1/reviews`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/reviews` | Submit a review for a completed order | ✅ |
| GET | `/reviews/user/:userId` | Get all reviews for a user | ❌ |
| GET | `/reviews/:id` | Get a single review | ❌ |
| GET | `/reviews/mine` | Get reviews written by current user | ✅ |
| GET | `/reviews/can-review/:orderId` | Check if current user can review an order | ✅ |

> Reviews are only allowed on completed orders. Each party (buyer/seller) can review the other once per order. Trust scores are recalculated automatically after each review.

---

### Notifications — `/api/v1/notifications`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/notifications` | Get all notifications | ✅ |
| GET | `/notifications/unread-count` | Get unread count | ✅ |
| PATCH | `/notifications/:id/read` | Mark one as read | ✅ |
| PATCH | `/notifications/read-all` | Mark all as read | ✅ |
| DELETE | `/notifications/:id` | Delete a notification | ✅ |

---

### Admin — `/api/v1/admin`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/admin/users` | List all users | ✅ admin |
| PATCH | `/admin/users/:id/toggle-active` | Activate or deactivate a user | ✅ admin |
| GET | `/admin/listings` | List all listings | ✅ admin |
| PATCH | `/admin/listings/:id/approve` | Approve a pending listing | ✅ admin |
| PATCH | `/admin/listings/:id/reject` | Reject a listing | ✅ admin |
| GET | `/admin/chat` | View all messages (moderation) | ✅ admin |
| GET | `/admin/stats` | Platform-wide statistics | ✅ admin |

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| fullName | String | required |
| email | String | unique, lowercase |
| password | String | bcrypt hashed |
| role | String | `buyer`, `seller`, `admin` |
| isVerified | Boolean | manual admin verification |
| isEmailVerified | Boolean | email link verification |
| isActive | Boolean | account status |
| avatar | String | base64 encoded image |
| phone | String | |
| location | Object | `{ latitude, longitude }` |
| trustScore | Number | 0–100, calculated from reviews |
| balance | Number | wallet balance in ETB |
| resetPasswordToken | String | hashed, expires in 1 hour |
| emailVerificationToken | String | hashed, expires in 24 hours |

### Listing
| Field | Type | Notes |
|---|---|---|
| title | String | required |
| description | String | required |
| price | Number | in ETB |
| currency | String | default `ETB` |
| images | [String] | array of URLs or base64 |
| category | String | required |
| condition | String | `new`, `used`, `old` |
| sellerId | ObjectId | ref User |
| location | Object | `{ latitude, longitude, address }` |
| status | String | `active`, `sold`, `pending`, `rejected` |
| isBoosted | Boolean | featured listing flag |
| views | Number | incremented on detail view |
| likes | Number | |

### Order
| Field | Type | Notes |
|---|---|---|
| listingId | ObjectId | ref Listing |
| buyerId | ObjectId | ref User |
| sellerId | ObjectId | ref User |
| price | Number | snapshot of listing price |
| status | String | `pending`, `paid`, `shipped`, `completed`, `cancelled` |
| paymentId | ObjectId | ref Payment |

### Payment
| Field | Type | Notes |
|---|---|---|
| orderId | ObjectId | ref Order |
| buyerId | ObjectId | ref User |
| sellerId | ObjectId | ref User |
| amount | Number | in ETB |
| currency | String | default `ETB` |
| status | String | `pending`, `held`, `released`, `refunded` |
| method | String | `telebirr`, `cbe_birr`, `amole`, `awash_birr`, `cash_on_delivery` |
| escrow | Boolean | always true |
| transactionRef | String | unique `TXN-XXXXXXXX` |
| isFlagged | Boolean | admin fraud flag |

### Review
| Field | Type | Notes |
|---|---|---|
| orderId | ObjectId | ref Order — must be `completed` |
| reviewerId | ObjectId | ref User |
| reviewedUserId | ObjectId | ref User |
| rating | Number | 1–5 |
| comment | String | optional |
| type | String | `buyer_to_seller` or `seller_to_buyer` |

### Chat Message
| Field | Type | Notes |
|---|---|---|
| senderId | ObjectId | ref User |
| receiverId | ObjectId | ref User |
| message | String | text content |
| imageUrl | String | optional image |
| listingId | ObjectId | optional — links message to a listing |
| status | String | `sent`, `delivered`, `seen` |

### Notification
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId | ref User |
| title | String | |
| message | String | |
| type | String | `order`, `payment`, `chat`, `review`, `system` |
| relatedId | ObjectId | linked entity |
| isRead | Boolean | default false |
| link | String | frontend route |

---

## Key Design Decisions

**Escrow payments** — funds are never sent directly to the seller. They are held until the buyer explicitly confirms delivery, protecting both parties.

**Trust score** — automatically recalculated as a 0–100 score from the average of all received reviews. Visible on every listing and seller profile.

**Kafka for emails** — email sending is decoupled from the request lifecycle. The API publishes an event to Kafka and returns immediately; the consumer processes and sends the email asynchronously. This prevents slow email providers from blocking API responses.

**Email verification gate** — users must verify their email before they can initiate any payment, reducing fraud from throwaway accounts.

**Role flexibility** — users can switch between `buyer` and `seller` roles from their profile. Only admins can assign the `admin` role.

**Location-aware listings** — every listing stores GPS coordinates. The frontend renders them on an interactive Leaflet map, making it easy to find nearby sellers.
