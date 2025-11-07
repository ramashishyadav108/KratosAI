# KratosAI Authentication Backend

Production-ready authentication backend with JWT and Custom Google OAuth 2.0 support.

## ✨ Features

- ✅ Email/Password & Google OAuth 2.0 Authentication
- ✅ JWT tokens (15min access + 30day refresh) with rotation
- ✅ Email verification & Password reset
- ✅ OAuth-Password account syncing (no duplicates)
- ✅ Secure HTTP-only cookies
- ✅ Input validation with Zod
- ✅ Comprehensive error handling
- ✅ Plain text email notifications
- ✅ Multi-device session management

**Stack:** Node.js • Express • TypeScript • Prisma • PostgreSQL • JWT • Google APIs • Bcrypt • Zod

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env  # Edit with your credentials

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev

# Or start in production mode
npm run build
npm start
```

Server will run on `http://localhost:4000`

## 🔧 Environment Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=http://localhost:4000/api/auth/google/callback

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# SMTP Configuration (for emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourapp.com
```

### 📝 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** or **People API**
4. Create **OAuth 2.0 Client ID** credentials
5. Add authorized redirect URI: `http://localhost:4000/api/auth/google/callback`
6. Configure OAuth consent screen with test users
7. Copy Client ID and Client Secret to `.env`

See `GOOGLE_OAUTH_SETUP.md` for detailed instructions.

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/health` | Health check 
| `POST` | `/api/auth/signup` | Register with email/password 
| `POST` | `/api/auth/login` | Login 
| `POST` | `/api/auth/refresh` | Refresh access token
| `GET` | `/api/auth/profile` | Get user profile 
| `POST` | `/api/auth/logout` | Logout current session 
| `POST` | `/api/auth/logout-other-devices` | Logout all other devices 
| `GET` | `/api/auth/verify-email?token=<token>` | Verify email 
| `POST` | `/api/auth/request-password-reset` | Request reset link 
| `POST` | `/api/auth/reset-password` | Reset password 
| `GET` | `/api/auth/google` | Google OAuth login (redirects) 
| `GET` | `/api/auth/google/callback` | Google OAuth callback 



## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration files
├── src/
│   ├── config/
│   │   ├── auth.ts           # Custom Google OAuth config
│   │   ├── db.ts             # Prisma client
│   │   └── env.ts            # Environment validation
│   ├── constants/
│   │   └── index.ts          # App constants
│   ├── controllers/
│   │   ├── authController.ts # Auth route handlers
│   │   └── googleController.ts # OAuth handlers
│   ├── middlewares/
│   │   ├── authMiddleware.ts # JWT verification
│   │   └── errorHandler.ts   # Error handling
│   ├── routes/
│   │   ├── authRoutes.ts     # Auth endpoints
│   │   └── googleRoutes.ts   # OAuth endpoints
│   ├── services/
│   │   ├── mailService.ts    # Email service
│   │   ├── tokenService.ts   # Token management
│   │   └── userService.ts    # User operations
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── utils/
│   │   ├── jwtUtils.ts       # JWT utilities
│   │   ├── logger.ts         # Winston logger
│   │   ├── response.ts       # Response helpers
│   │   └── validate.ts       # Input validation
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── .env                       # Environment variables
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── HOW_TO_RUN.md             # Detailed instructions
├── GOOGLE_OAUTH_SETUP.md     # OAuth setup guide
└── TEST_RESULTS.md           # Test results
```

## 💻 Available Commands

```bash
# Development
npm run dev                  # Start dev server with auto-reload
npm run build                # Build TypeScript to JavaScript
npm start                    # Start production server

# Database
npm run prisma:generate      # Generate Prisma client
npm run prisma:migrate       # Create new migration
npm run prisma:studio        # Open Prisma Studio (DB GUI)

# Testing
bash test-complete-flow.sh   # Test complete auth flow
bash test-all-routes.sh      # Test all individual routes
bash test-email-flows.sh     # Test email verification flow

# Utilities
npm run type-check           # Check TypeScript types
```

## 🔒 Security Features

- **Password Security**: Bcrypt hashing with 12 rounds
- **JWT Tokens**: 
  - Access tokens: 15 minutes expiry
  - Refresh tokens: 30 days expiry
  - Automatic token rotation
- **HTTP-Only Cookies**: Refresh tokens stored securely
- **Email Verification**: Required for account activation
- **CORS Protection**: Configured for frontend origin
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **Input Validation**: Zod schema validation on all inputs
- **Error Handling**: Centralized error handling middleware
- **Rate Limiting**: Recommended for production (not included)

## 🔄 OAuth-Password Account Linking

Users can sign up with either email/password or Google OAuth, and later add the other authentication method. The system automatically links accounts by email - **no duplicate accounts are created**.

**Flow Examples:**
1. Sign up with email → Later link Google account
2. Sign up with Google → Later set password


