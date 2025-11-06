# Authentication Backend API

Production-ready authentication backend with JWT and OAuth 2.0 support built with Node.js, Express, Prisma, and PostgreSQL.

## Features

- **Email/Password Authentication**: Secure signup and login with bcrypt password hashing
- **Google OAuth 2.0**: Social login with passport-google-oauth20
- **JWT-based Authentication**: Short-lived access tokens (15 min) + long-lived refresh tokens (30 days)
- **Token Management**: Refresh token rotation, revocation, and automatic cleanup
- **Secure Cookies**: HttpOnly cookies for refresh tokens
- **Input Validation**: Request validation using Zod
- **Error Handling**: Centralized error handling middleware
- **Email Verification**: User email verification flow with Nodemailer
- **Password Reset**: Secure two-step password reset functionality
- **OAuth-Password Sync**: Users can add password to OAuth accounts
- **Account Deletion**: Secure account deletion with token revocation

## Tech Stack

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT (jsonwebtoken)
- Passport.js (Google OAuth)
- Bcrypt
- Zod (validation)
- Nodemailer (email)

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Google OAuth credentials (for social login)

## Installation

1. **Clone the repository**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
PORT=4000
DATABASE_URL=postgresql://username:password@localhost:5432/auth_db?schema=public

JWT_ACCESS_SECRET=your_strong_access_secret_here
JWT_REFRESH_SECRET=your_strong_refresh_secret_here

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=http://localhost:4000/api/auth/google/callback

FRONTEND_URL=http://localhost:5173

NODE_ENV=development
```

4. **Set up the database**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. **Start the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Health Check

#### GET `/health`
Check if the server is running.

**Method:** `GET`

**Request:**
```bash
curl http://localhost:4000/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

### Authentication Endpoints

#### 1. POST `/api/auth/signup`
Register a new user with email and password. Sends verification email.

**Method:** `POST`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "c362f609-b563-44bd-ac47-0752ebe1e153",
      "email": "user@example.com",
      "name": "John Doe",
      "isVerified": false,
      "createdAt": "2025-11-06T09:23:02.295Z"
    }
  }
}
```

**Error Response - Duplicate Email (409):**
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

**Error Response - Validation (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Please provide a valid email address",
    "Password must be at least 6 characters long"
  ]
}
```

**Note:** If user signed up with Google OAuth previously, this will add password to existing account (account sync).

---

#### 2. POST `/api/auth/login`
Login with email and password. Returns access token and sets refresh token cookie.

**Method:** `POST`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjMzYy...",
    "user": {
      "id": "c362f609-b563-44bd-ac47-0752ebe1e153",
      "email": "user@example.com",
      "name": "John Doe",
      "isVerified": true
    }
  }
}
```

**Error Response - Invalid Credentials (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Cookies Set:**
- `refreshToken` - HttpOnly, Secure (production), SameSite=Strict, 30 days expiry

---

#### 3. POST `/api/auth/refresh`
Refresh access token using refresh token from cookie.

**Method:** `POST`

**Headers:**
```
Cookie: refreshToken=<refresh_token>
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjMzYy..."
  }
}
```

**Error Response - Invalid Token (401):**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

**Note:** Old refresh token is revoked and new one is issued (token rotation).

---

#### 4. GET `/api/auth/profile`
Get authenticated user profile.

**Method:** `GET`

**Headers:**
```
Authorization: Bearer <access_token>
```

**cURL Example:**
```bash
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "c362f609-b563-44bd-ac47-0752ebe1e153",
      "email": "user@example.com",
      "name": "John Doe",
      "isVerified": true,
      "createdAt": "2025-11-06T09:23:02.295Z"
    }
  }
}
```

**Error Response - No Token (401):**
```json
{
  "success": false,
  "message": "Access token required"
}
```

**Error Response - Invalid Token (403):**
```json
{
  "success": false,
  "message": "Invalid access token"
}
```

---

#### 5. POST `/api/auth/logout`
Logout current session and revoke refresh token.

**Method:** `POST`

**Headers:**
```
Cookie: refreshToken=<refresh_token>
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -b cookies.txt
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Note:** Revokes refresh token and clears cookie.

---

#### 6. POST `/api/auth/logout-all`
Logout from all devices (revokes all refresh tokens).

**Method:** `POST`

**Headers:**
```
Authorization: Bearer <access_token>
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/logout-all \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

**Note:** Revokes all refresh tokens for the user across all devices.

---

#### 7. DELETE `/api/auth/delete-account`
Permanently delete user account.

**Method:** `DELETE`

**Headers:**
```
Authorization: Bearer <access_token>
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:4000/api/auth/delete-account \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Error Response - User Not Found (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

**⚠️ Warning:** This action:
- Permanently deletes the user account
- Revokes all refresh tokens
- Clears refresh token cookie
- Deletes all user data (cascading delete)
- **Cannot be undone**

---

### Email Verification

#### 8. GET `/api/auth/verify-email`
Verify user email address using token from email.

**Method:** `GET`

**Query Parameters:**
- `token` (required) - Verification token from email

**cURL Example:**
```bash
curl "http://localhost:4000/api/auth/verify-email?token=88fba2d89545c32f1a4583ed9ac696d8e81557657ff8dfdefb38fbdcb0baa072"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "c362f609-b563-44bd-ac47-0752ebe1e153",
      "email": "user@example.com",
      "name": "John Doe",
      "isVerified": true
    }
  }
}
```

**Error Response - Invalid Token (400):**
```json
{
  "success": false,
  "message": "Invalid or expired verification token"
}
```

---

### Password Reset

#### 9. POST `/api/auth/request-password-reset`
Request password reset link (Step 1 of 2).

**Method:** `POST`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent"
}
```

**Note:** 
- Always returns success (security - prevents email enumeration)
- Email sent only if account exists
- Token expires in 1 hour

---

#### 10. POST `/api/auth/reset-password`
Reset password using token from email (Step 2 of 2).

**Method:** `POST`

**Request Body:**
```json
{
  "token": "abc123xyz",
  "password": "newSecurePassword123"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123xyz",
    "password": "newSecurePassword123"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Response - Invalid/Expired Token (400):**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

**Note:** 
- Revokes all refresh tokens after successful reset
- Token can only be used once
- User must login again with new password

---

### Google OAuth

#### 11. GET `/api/auth/google`
Initiate Google OAuth login flow.

**Method:** `GET`

**Browser Example:**
```
http://localhost:4000/api/auth/google
```

**What Happens:**
1. Redirects to Google login page
2. User grants permissions
3. Google redirects back to callback
4. Access token in URL, refresh token in cookie

**Callback Redirect:**
```
http://localhost:5173/auth/callback?token=<access_token>
```

---

#### 12. GET `/api/auth/google/callback`
Google OAuth callback (handled automatically by Passport.js).

**Method:** `GET`

**Note:** This route is called by Google after authentication. Users don't call this directly.

---

### Error Responses

#### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Error message 1", "Error message 2"]
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

#### 403 - Forbidden
```json
{
  "success": false,
  "message": "Invalid access token"
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "message": "Route not found"
}
```

#### 409 - Conflict
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

#### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---
  "email": "user@example.com"
}
```

#### POST `/api/auth/reset-password`
Reset password with token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

### Google OAuth

#### GET `/api/auth/google`
Initiate Google OAuth flow.

#### GET `/api/auth/google/callback`
Google OAuth callback (handled automatically).

## Database Schema

### User Model
```prisma
model User {
  id                String         @id @default(uuid())
  email             String         @unique
  password          String?
  name              String?
  googleId          String?        @unique
  isVerified        Boolean        @default(false)
  verificationToken String?
  resetToken        String?
  resetTokenExpiry  DateTime?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  refreshTokens     RefreshToken[]
}
```

### RefreshToken Model
```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  revoked   Boolean  @default(false)
}
```

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT-based authentication with separate access and refresh tokens
- HttpOnly cookies for refresh token storage
- Token rotation on refresh
- Automatic token cleanup
- CORS configuration
- Input validation
- SQL injection protection (via Prisma)

## Testing All Endpoints

### Quick Test Script

You can use the included test script to test all endpoints sequentially:

```bash
chmod +x test-endpoints.sh
./test-endpoints.sh
```

### Manual Testing Flow

1. **Start the server**: `npm run dev`

2. **Test Signup**:
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","name":"Test User"}'
```

3. **Check verification email in console** and copy the verification token

4. **Verify Email**:
```bash
curl "http://localhost:4000/api/auth/verify-email?token=YOUR_TOKEN"
```

5. **Test Login** (save the cookies):
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}' \
  -c cookies.txt -v
```

6. **Access Protected Route**:
```bash
curl http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

7. **Test Google OAuth** (in browser):
```
http://localhost:4000/api/auth/google
```

8. **Test Password Reset**:
```bash
# Request reset
curl -X POST http://localhost:4000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Reset password with token from email
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_RESET_TOKEN","newPassword":"NewPass@456"}'
```

9. **Test Logout**:
```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

10. **Test Delete Account** (irreversible!):
```bash
curl -X DELETE http://localhost:4000/api/auth/delete-account \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

### Testing OAuth-Password Sync

To test that OAuth users can add passwords without creating duplicates:

1. Login with Google OAuth first
2. Then signup with the same email and password
3. Verify the same user ID is returned (no duplicate created)

```bash
# Check OAuth users
node check-oauth-users.js

# Test sync
node test-oauth-sync.js
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── passport.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── googleController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── googleRoutes.js
│   ├── services/
│   │   ├── mailService.js
│   │   ├── tokenService.js
│   │   └── userService.js
│   ├── utils/
│   │   ├── jwtUtils.js
│   │   └── validate.js
│   ├── app.js
│   └── server.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Development

Run Prisma Studio to view/edit database:
```bash
npm run prisma:studio
```

Generate Prisma Client:
```bash
npm run prisma:generate
```

Create new migration:
```bash
npm run prisma:migrate
```

## Deployment

1. Set `NODE_ENV=production` in environment variables
2. Update `DATABASE_URL` with production database credentials
3. Update `FRONTEND_URL` with production frontend URL
4. Set strong secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
5. Configure Google OAuth redirect URL for production
6. Run database migration: `npx prisma migrate deploy`
7. Start the server: `npm start`

## License

ISC
