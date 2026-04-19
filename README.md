# 🚀 Digital Kuralew Backend

A marketplace and chat backend for buyers, sellers, and admins built with **Node.js**, **Express**, and **MongoDB**.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Project Structure](#-project-structure)
- [Technologies Used](#-technologies-used)
- [Environment Variables](#-environment-variables)
- [Setup & Installation](#-setup--installation)
- [API Endpoints](#-api-endpoints)
- [Request & Response Examples](#-request--response-examples)
- [Data Models](#-data-models)

---

Dployed Link:
https://gdg-2026-hackathon-project.onrender.com

---

## 🌟 Project Overview

Digital Kuralew is a backend service for a marketplace and chat system. The current backend supports:

- JWT-based authentication with refresh tokens
- User / Buyer / Seller / Admin roles
- User registration, login, profile, logout, and refresh token flow
- Chat messaging with single-content messages: text, image, audio, or video
- MongoDB persistence via Mongoose

> The codebase is implemented primarily in the `Backend/` folder.

---

## 📁 Project Structure

```
GDG-2026-Hackathon-Project/
├── README.md
└── Backend/
  ├── app.js
  ├── server.js
  ├── package.json
  ├── .gitignore
  ├── config/
  │   ├── database.js
  │   └── env.js
  ├── controller/
  │   ├── adminController.js
  │   ├── authController.js
  │   ├── buyerController.js
  │   ├── chatController.js
  │   ├── dashboardController.js
  │   ├── paymentController.js
  │   └── sellerController.js
  ├── middleware/
  │   ├── authentication.js
  │   ├── autherization.js
  │   └── errorHandler.js
  ├── models/
  │   ├── chatModel.js
  │   ├── entryModel.js
  │   ├── listingModel.js
  │   ├── paymentModel.js
  │   ├── refreshToken.js
  │   └── userModel.js
  ├── routes/
  │   ├── adminRoute.js
  │   ├── authRoute.js
  │   ├── buyerRoute.js
  │   ├── chatRoute.js
  │   ├── dashboardRoute.js
  │   ├── paymentsRoute.js
  │   └── sellerRoute.js
  ├── utils/
  │   └── error.util.js
  ├── validation/
  │   ├── chatValidation.js
  │   └── userValidation.js
```

---

## 🛠 Technologies Used

- Node.js
- Express
- MongoDB / Mongoose
- JWT
- crypto
- bcrypt
- Joi
- dotenv
- cors
- helmet
- morgan

---

## 🔑 Environment Variables

Create a `.env` file inside `Backend/` with these values:

```env
PORT=5000
MONGO_URI=your_mongo_connection_string
ACCESS_TOKEN_SECRET_KEY=your_access_secret
REFRESH_TOKEN_SECRET_KEY=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

---

## 🚀 Setup & Installation

```bash
cd Backend
npm install
npm run dev
```

The app will be available at:

```
https://gdg-2026-hackathon-project.onrender.com/api/v1
```

---

## 🔗 API Endpoints

### Authentication

| Method | Endpoint              | Description                 | Auth Required |
| ------ | --------------------- | --------------------------- | ------------- |
| POST   | `/auth/register`      | Register a new user         | ❌            |
| POST   | `/auth/login`         | Login user                  | ❌            |
| POST   | `/auth/refresh`       | Refresh access token        | ❌            |
| GET    | `/auth/profile`       | Get current user profile    | ✅            |
| PUT    | `/auth/updateProfile` | Update current user profile | ✅            |
| POST   | `/auth/logout`        | Logout current user         | ✅            |

### Chat

| Method | Endpoint                     | Description                    | Auth Required |
| ------ | ---------------------------- | ------------------------------ | ------------- |
| POST   | `/chat`                      | Send chat message              | ✅            |
| GET    | `/chat`                      | Get all chats for current user | ✅            |
| GET    | `/chat/conversation/:userId` | Get conversation with a user   | ✅            |
| GET    | `/chat/:id`                  | Get one chat message           | ✅            |
| PUT    | `/chat/:id`                  | Update a chat message          | ✅            |
| PUT    | `/chat/:id/read`             | Mark message as read           | ✅            |
| DELETE | `/chat/:id`                  | Delete a chat message          | ✅            |

### Listing

| Method | Endpoint                    | Description                     | Auth Required |
| ------ | --------------------------- | ------------------------------- | ------------- |
| GET    | `/buyer/listings`           | Get all active listings (buyer) | ✅            |
| POST   | `/seller/listings`          | Create a new listing (seller)   | ✅            |
| PUT    | `/seller/listings/:id`      | Update a listing (seller)       | ✅            |
| DELETE | `/seller/listings/:id`      | Delete a listing (seller)       | ✅            |
| PATCH  | `/seller/listings/:id/sold` | Mark listing as sold (seller)   | ✅            |
| GET    | `/admin/listings`           | Get all listings (admin)        | ✅            |
| POST   | `/admin/listings/approve`   | Approve listing (admin)         | ✅            |
| POST   | `/admin/listings/reject`    | Reject listing (admin)          | ✅            |

### Order

| Method | Endpoint               | Description                        | Auth Required |
| ------ | ---------------------- | ---------------------------------- | ------------- |
| POST   | `/buyer/orders/create` | Create order for a listing (buyer) | ✅            |
| GET    | `/seller/orders`       | Get seller's orders                | ✅            |

### Entry (Wallet/Transaction)

| Method            | Endpoint | Description | Auth Required |
| ----------------- | -------- | ----------- | ------------- |
| (not implemented) |          |             |               |

### Admin

| Method | Endpoint           | Description               | Auth Required |
| ------ | ------------------ | ------------------------- | ------------- |
| GET    | `/admin/users`     | Get all users             | ✅ (admin)    |
| POST   | `/admin/users/ban` | Ban a user                | ✅ (admin)    |
| GET    | `/admin/reports`   | Get reports (placeholder) | ✅ (admin)    |

### Payment

| Method | Endpoint               | Description               | Auth Required |
| ------ | ---------------------- | ------------------------- | ------------- |
| POST   | `/payments`            | Create a new payment      | ✅            |
| GET    | `/payments`            | Get all payments for user | ✅            |
| GET    | `/payments/:id`        | Get payment by ID         | ✅            |
| PUT    | `/payments/:id/status` | Update payment status     | ✅            |

---

## 📝 Numbered Request & Response Examples

### 1. Register User

**Request**

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user"
}
```

**Response**

```json
{
  "message": "user created successfully",
  "data": {
    "_id": "64fbe97a2c5b2f0012345678",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-04-14T10:00:00.000Z",
    "updatedAt": "2026-04-14T10:00:00.000Z"
  },
  "accessToken": "<JWT_ACCESS_TOKEN>",
  "refreshToken": "<JWT_REFRESH_TOKEN>"
}
```

---

### 2. Login User

**Request**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**

```json
{
  "message": "logged in successfully",
  "accessToken": "<ACCESS_TOKEN>",
  "refreshToken": "<REFRESH_TOKEN>"
}
```

---

### 3. Refresh Access Token

**Request**

```http
POST /api/v1/auth/refresh
Authorization: Bearer <refreshToken>
```

**Response**

```json
{
  "accessToken": "<NEW_ACCESS_TOKEN>"
}
```

---

### 4. Get Profile

**Request**

```http
GET /api/v1/auth/profile
Authorization: Bearer <accessToken>
```

**Response**

```json
{
  "data": {
    "_id": "64fbe97a2c5b2f0012345678",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-04-14T10:00:00.000Z",
    "updatedAt": "2026-04-14T10:00:00.000Z"
  }
}
```

---

### 5. Update Profile

**Request**

```http
PUT /api/v1/auth/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "fullName": "John Updated"
  "role": "seller",
  "password":"12345678",
}
```

**Response**

```json
{
  "data": {
    "_id": "64fbe97a2c5b2f0012345678",
    "fullName": "John Updated",
    "email": "john@example.com",
    "role": "seller",
    "createdAt": "2026-04-14T10:00:00.000Z",
    "updatedAt": "2026-04-14T10:10:00.000Z"
  }
}
```

> Note: current code uses `GET /auth/profile` and `PUT /auth/profile` but update logic is not fully implemented yet.

---

### 6. Logout

**Request**

```http
POST /api/v1/auth/logout
Authorization: Bearer <accessToken>
```

**Response**

```json
{
  "message": "logged out successfully"
}
```

---

### 7. Send Chat Message

**Request**

```http
POST /api/v1/chat
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "receiverId": "69dfd16779e0181efcf018c5",
  "message": "Hello, how are you?"
}
```

**Response**

```json
{
  "message": "Message sent successfully",
  "data": {
    "_id": "69dfd22a79e0181efcf018c7",
    "senderId": "69dfd18979e0181efcf018c6",
    "receiverId": "69dfd16779e0181efcf018c5",
    "message": "Hello, how are you?",
    "status": "sent",
    "createdAt": "2026-04-15T12:00:00.000Z",
    "updatedAt": "2026-04-15T12:00:00.000Z"
  }
}
```

---

### 8. Get My Chats

**Request**

```http
GET /api/v1/chat
Authorization: Bearer <accessToken>
```

**Response**

```json
{
  "data": [
    {
      "_id": "69dfd22a79e0181efcf018c7",
      "senderId": {
        "_id": "69dfd18979e0181efcf018c6",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "receiverId": {
        "_id": "69dfd16779e0181efcf018c5",
        "fullName": "Jane Doe",
        "email": "jane@example.com"
      },
      "message": "Hello, how are you?",
      "status": "sent",
      "createdAt": "2026-04-15T12:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20
}
```

---

### 9. Get Conversation

**Request**

```http
GET /api/v1/chat/conversation/69dfd16779e0181efcf018c5
Authorization: Bearer <accessToken>
```

**Response**

```json
{
  "data": [
    {
      "_id": "69dfd22a79e0181efcf018c7",
      "senderId": {
        "_id": "69dfd18979e0181efcf018c6",
        "fullName": "John Doe"
      },
      "receiverId": {
        "_id": "69dfd16779e0181efcf018c5",
        "fullName": "Jane Doe"
      },
      "message": "Hello, how are you?",
      "status": "sent",
      "createdAt": "2026-04-15T12:00:00.000Z"
    }
  ]
}
```

---

### 10. Get Single Chat Message

**Request**

```http
GET /api/v1/chat/69dfd22a79e0181efcf018c7
Authorization: Bearer <accessToken>
```

**Response**

```json
{
  "data": {
    "_id": "69dfd22a79e0181efcf018c7",
    "senderId": {
      "_id": "69dfd18979e0181efcf018c6",
      "fullName": "John Doe"
    },
    "receiverId": {
      "_id": "69dfd16779e0181efcf018c5",
      "fullName": "Jane Doe"
    },
    "message": "Hello, how are you?",
    "status": "sent",
    "createdAt": "2026-04-15T12:00:00.000Z"
  }
}
```

---

### 11. Update Chat Message

**Request**

```http
PUT /api/v1/chat/69dfd22a79e0181efcf018c7
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "message": "I am fine, thanks!"
}
```

**Response**

```json
{
  "message": "Message updated successfully",
  "data": {
    "_id": "69dfd22a79e0181efcf018c7",
    "senderId": "69dfd18979e0181efcf018c6",
    "receiverId": "69dfd16779e0181efcf018c5",
    "message": "I am fine, thanks!",
    "status": "sent",
    "createdAt": "2026-04-15T12:00:00.000Z",
    "updatedAt": "2026-04-15T12:05:00.000Z"
  }
}
```

---

### 12. Mark Chat Read

**Request**

```http
PUT /api/v1/chat/69dfd22a79e0181efcf018c7/read
Authorization: Bearer <accessToken>
```

**Response**

```json
{
  "message": "Message marked as read",
  "data": {
    "_id": "69dfd22a79e0181efcf018c7",
    "status": "seen"
  }
}
```

---

### 13. Delete Chat Message

**Request**

```http
DELETE /api/v1/chat/69dfd22a79e0181efcf018c7
Authorization: Bearer <accessToken>
```

**Response**

```json
{
  "message": "Message deleted successfully"
}
```

### 14. Create Payment

**Request**

```http
POST /api/v1/payments
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "amount": 100.5,
  "currency": "USD",
  "paymentMethod": "card",
  "description": "Order #1234",
  "reference": "ORDER-1234-2026-04-18"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "_id": "69e0f1a879e0181efcf01999",
    "userId": "69dfd18979e0181efcf018c6",
    "amount": 100.5,
    "currency": "USD",
    "paymentMethod": "card",
    "description": "Order #1234",
    "reference": "ORDER-1234-2026-04-18",
    "transactionId": "TXN-1713436800000-abc123xyz",
    "status": "pending",
    "createdAt": "2026-04-18T10:00:00.000Z",
    "updatedAt": "2026-04-18T10:00:00.000Z"
  }
}
```

---

### 15. Get User Payments

**Request**

```http
GET /api/v1/payments
Authorization: Bearer <accessToken>
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "_id": "69e0f1a879e0181efcf01999",
      "amount": 100.5,
      "currency": "USD",
      "status": "pending",
      "paymentMethod": "card",
      "reference": "ORDER-1234-2026-04-18",
      "transactionId": "TXN-1713436800000-abc123xyz",
      "createdAt": "2026-04-18T10:00:00.000Z"
    }
  ]
}
```

---

### 16. Update Payment Status

**Request**

```http
PUT /api/v1/payments/69e0f1a879e0181efcf01999/status
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "completed"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "_id": "69e0f1a879e0181efcf01999",
    "status": "completed"
  }
}
```

---

### 17. Get Payment By ID

**Request**

```http
GET /api/v1/payments/69e0f1a879e0181efcf01999
Authorization: Bearer <accessToken>
```

**Response**

```json
{
  "success": true,
  "data": {
    "_id": "69e0f1a879e0181efcf01999",
    "amount": 100.5,
    "currency": "USD",
    "status": "completed",
    "paymentMethod": "card",
    "reference": "ORDER-1234-2026-04-18",
    "transactionId": "TXN-1713436800000-abc123xyz",
    "createdAt": "2026-04-18T10:00:00.000Z"
  }
}
```

### 18. Create Listing (Seller)

**Request**

```http
POST /api/v1/seller/listings
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Item title",
  "description": "Item description",
  "price": 100,
  "category": "electronics",
  "images": ["url1", "url2"],
  "location": { "latitude": 9.03, "longitude": 38.74, "address": "Addis Ababa" }
}
```

**Response**

```json
{
  "_id": "listing_id",
  "title": "Item title",
  "description": "Item description",
  "price": 100,
  "category": "electronics",
  "images": ["url1", "url2"],
  "location": {
    "latitude": 9.03,
    "longitude": 38.74,
    "address": "Addis Ababa"
  },
  "sellerId": "user_id",
  "status": "pending",
  "createdAt": "2026-04-19T10:00:00.000Z",
  "updatedAt": "2026-04-19T10:00:00.000Z"
}
```

### 19. Update Listing (Seller)

**Request**

```http
PUT /api/v1/seller/listings/<listing_id>
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "price": 120
}
```

**Response**

```json
{
  "_id": "listing_id",
  ...updated fields...
}
```

### 20. Delete Listing (Seller)

**Request**

```http
DELETE /api/v1/seller/listings/<listing_id>
Authorization: Bearer <accessToken>
```

**Response**

```json
{
  "message": "Deleted"
}
```

### 21. Approve Listing (Admin)

**Request**

```http
POST /api/v1/admin/listings/approve
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "listingId": "listing_id"
}
```

**Response**

```json
{
  "_id": "listing_id",
  "status": "active"
}
```

### 22. Create Order (Buyer)

**Request**

```http
POST /api/v1/buyer/orders/create
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "listingId": "listing_id"
}
```

**Response**

```json
{
  "_id": "order_id",
  "listingId": "listing_id",
  "buyerId": "user_id",
  "sellerId": "seller_id",
  "price": 100,
  "status": "pending",
  "createdAt": "2026-04-19T10:00:00.000Z"
}
```

### 23. Get Seller Orders

**Request**

```http
GET /api/v1/seller/orders
Authorization: Bearer <accessToken>
```

**Response**

```json
[
  {
    "_id": "order_id",
    "listingId": "listing_id",
    "buyerId": "user_id",
    "sellerId": "seller_id",
    "price": 100,
    "status": "pending",
    "createdAt": "2026-04-19T10:00:00.000Z"
  }
]
```

### 24. Ban User (Admin)

**Request**

```http
POST /api/v1/admin/users/ban
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "userId": "user_id"
}
```

**Response**

```json
{
  "_id": "user_id",
  "isActive": false
}
```

---

---

## 📊 Data Models

### User Model

- `_id`
- `fullName`
- `email`
- `password` (hashed)
- `role` (`buyer`, `seller`, `admin`, `user`)
- `createdAt`
- `updatedAt`

### Chat Model

- `_id`
- `senderId`
- `receiverId`
- `message`
- `audioUrl`
- `videoUrl`
- `imageUrl`
- `status` (`sent`, `delivered`, `seen`)
- `createdAt`
- `updatedAt`

### Listing Model

- `_id`
- `title`
- `description`
- `price`
- `currency`
- `images` (array of strings)
- `category`
- `sellerId`
- `location` (object: latitude, longitude, address)
- `status` (`active`, `sold`, `pending`, `rejected`)
- `isBoosted` (boolean)
- `views` (number)
- `likes` (number)
- `createdAt`
- `updatedAt`

### Order Model

- `_id`
- `listingId`
- `buyerId`
- `sellerId`
- `price`
- `status` (`pending`, `paid`, `completed`, etc.)
- `createdAt`
- `updatedAt`

### Entry Model (Wallet/Transaction)

- `_id`
- `userId`
- `paymentId`
- `amount`
- `type` (`debit`, `credit`)
- `description`
- `balanceBefore`
- `balanceAfter`
- `createdAt`
- `updatedAt`

### Payment Model

- `_id`
- `senderId`
- `receiverId`
- `amount`
- `currency`
- `status` (`pending`, `processing`, `completed`, `failed`, `cancelled`)
- `paymentMethod` (`card`, `bank_transfer`, `wallet`, `mobile_money`)
- `reference`
- `description`
- `failureReason`
- `createdAt`
- `updatedAt`

### Refresh Token Model

- `_id`
- `userId`
- `token`
- `expiresAt`
- `createdAt`

---
