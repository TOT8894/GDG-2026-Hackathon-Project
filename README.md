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

├── Backend/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   ├── controller/
│   │   ├── authController.js
│   │   └── chatController.js
│   ├── errorHandler/
│   │   └── errorHandler.js
│   ├── middleware/
│   │   ├── authentication.js
│   │   └── autherization.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── refreshToken.js
│   │   └── chatModel.js
│   ├── routes/
│   │   ├── authRoute.js
│   │   └── chatRoute.js
│   └── validation/
│       ├── userValidation.js
│       └── chatValidation.js
└── README.md
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

| Method | Endpoint               | Description                 | Auth Required |
| ------ | -----------------------| --------------------------- | ------------- |
| POST   | `/auth/register`       | Register a new user         | ❌            |
| POST   | `/auth/login`          | Login user                  | ❌            |
| POST   | `/auth/refresh`        | Refresh access token        | ❌            |
| GET    | `/auth/profile`        | Get current user profile    | ✅            |
| PUT    | `/auth/updateProfile`  | Update current user profile | ✅            |
| POST   | `/auth/logout`         | Logout current user         | ✅            |

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

---

## 📝 Request & Response Examples

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

### Refresh Token Model

- `_id`
- `userId`
- `token`
- `expiresAt`
- `createdAt`

---

