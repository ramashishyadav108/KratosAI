# KratosAI - Lead Management Platform

Full-stack CRM system with authentication and meeting scheduling.

## Features

- 🔐 Authentication (Email/Password & Google OAuth)
- 📊 Lead Management (CRUD, status tracking, priority levels)
- �� Meeting Scheduling (Calendly integration)
- 🎨 Modern React UI with dark/light themes
- 🔒 JWT tokens with refresh rotation
- 📧 Email verification & password reset

**Tech Stack:** Node.js • Express • TypeScript • Prisma • PostgreSQL • React • Vite

## Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Gmail account (for SMTP)

### Backend Setup

\`\`\`bash
cd backend
npm install
cp .env.example .env  # Edit with your credentials
npx prisma generate
npx prisma migrate dev
npm run dev
\`\`\`

Backend runs on \`http://localhost:4000\`

### Frontend Setup

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Frontend runs on \`http://localhost:5173\`

## Environment Variables

Create \`.env\` in backend directory:

\`\`\`env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=http://localhost:4000/api/auth/google/callback

# CORS
FRONTEND_URL=http://localhost:5173

# SMTP (for emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourapp.com

# Calendly (optional)
CALENDLY_ACCESS_TOKEN=your_calendly_token
\`\`\`

## API Endpoints

### Authentication
- \`POST /api/auth/signup\` - Register
- \`POST /api/auth/login\` - Login
- \`POST /api/auth/refresh\` - Refresh token
- \`GET /api/auth/profile\` - Get profile
- \`POST /api/auth/logout\` - Logout
- \`GET /api/auth/verify-email\` - Verify email
- \`POST /api/auth/request-password-reset\` - Request reset
- \`POST /api/auth/reset-password\` - Reset password
- \`GET /api/auth/google\` - Google OAuth login
- \`GET /api/auth/google/callback\` - OAuth callback

### Leads
- \`POST /api/leads\` - Create lead
- \`GET /api/leads\` - Get all leads
- \`GET /api/leads/:id\` - Get lead by ID
- \`PUT /api/leads/:id\` - Update lead
- \`DELETE /api/leads/:id\` - Delete lead
- \`GET /api/leads/stats\` - Get statistics

### Meetings
- \`POST /api/meetings/schedule\` - Schedule meeting
- \`GET /api/meetings\` - Get all meetings
- \`GET /api/meetings/borrower/:email\` - Get meetings by borrower
- \`GET /api/meetings/:id\` - Get meeting by ID
- \`POST /api/meetings/:id/cancel\` - Cancel meeting
- \`PATCH /api/meetings/:id/status\` - Update status
- \`GET /api/meetings/event-types\` - Get Calendly event types

## Commands

### Backend
\`\`\`bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npx prisma studio    # Open database GUI
\`\`\`

### Frontend
\`\`\`bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
\`\`\`

## Project Structure

\`\`\`
kratosAi/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── .env
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Auth/
│       │   ├── Dashboard/
│       │   ├── Leads/
│       │   └── Meetings/
│       ├── services/
│       └── context/
└── README.md
\`\`\`

## Troubleshooting

**Database Connection Error**
\`\`\`bash
# Check DATABASE_URL in .env
npx prisma migrate dev
\`\`\`

**CORS Error**
\`\`\`bash
# Ensure FRONTEND_URL matches your frontend URL
\`\`\`

**Email Not Sending**
\`\`\`bash
# For Gmail, use App Password
# Check spam folder
\`\`\`

**Prisma Issues**
\`\`\`bash
npx prisma generate
npx prisma migrate dev
\`\`\`

## License

ISC License

---

**KratosAI Team**
