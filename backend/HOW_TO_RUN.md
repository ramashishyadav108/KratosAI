# How to Run KratosAI Backend

## 🚀 Starting the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```
This will start the server with auto-reload on file changes using `tsx watch`

### Production Mode
```bash
# First build the TypeScript code
npm run build

# Then start the server
npm start
```

### Alternative: Direct Run
```bash
npx tsx src/server.ts
```

---

## 📊 Database Commands

### Run migrations
```bash
npm run prisma:migrate
```

### Generate Prisma Client
```bash
npm run prisma:generate
```

### Open Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

---

## 🧪 Testing All Routes (One by One)

### 1. Health Check
```bash
curl -s http://localhost:4000/health | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

### 2. User Signup
```bash
curl -s -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "password": "Test123456",
    "name": "Test User"
  }' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "name": "Test User",
      "isVerified": false
    }
  }
}
```

---

### 3. User Login
```bash
# Save cookies for subsequent requests
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }' \
  -c /tmp/cookies.txt | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User"
    }
  }
}
```

**Save the access token for next requests:**
```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}' \
  -c /tmp/cookies.txt | jq -r '.data.accessToken')

echo "Token: $TOKEN"
```

---

### 4. Get User Profile (Protected Route)
```bash
curl -s http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User",
      "isVerified": false
    }
  }
}
```

---

### 5. Refresh Access Token
```bash
curl -s -X POST http://localhost:4000/api/auth/refresh \
  -b /tmp/cookies.txt \
  -c /tmp/cookies.txt | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 6. Logout
```bash
curl -s -X POST http://localhost:4000/api/auth/logout \
  -b /tmp/cookies.txt | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 7. Logout from Other Devices
```bash
curl -s -X POST http://localhost:4000/api/auth/logout-other-devices \
  -H "Authorization: Bearer $TOKEN" \
  -b /tmp/cookies.txt | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logged out from all other devices successfully"
}
```

---

### 8. Google OAuth (Redirect)
```bash
curl -I http://localhost:4000/api/auth/google
```

**Expected Response:**
```
HTTP/1.1 302 Found
Location: https://accounts.google.com/o/oauth2/v2/auth?...
```

**Test in Browser:**
```
http://localhost:4000/api/auth/google
```

---

### 9. Request Password Reset
```bash
curl -s -X POST http://localhost:4000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent"
}
```

---

### 10. Verify Email
```bash
# Replace TOKEN_FROM_EMAIL with actual token from email/logs
curl -s "http://localhost:4000/api/auth/verify-email?token=TOKEN_FROM_EMAIL" | jq .
```

**Expected Response (with valid token):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "isVerified": true
    }
  }
}
```

---

### 11. Reset Password
```bash
# Replace TOKEN_FROM_EMAIL with actual reset token
curl -s -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL",
    "password": "NewPassword123"
  }' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 🔄 Complete Flow Test

Run all tests in sequence:
```bash
./test-complete-flow.sh
```

Or manually:
```bash
# 1. Health check
echo "=== Testing Health ==="
curl -s http://localhost:4000/health | jq .

# 2. Signup
echo "=== Testing Signup ==="
EMAIL="user$(date +%s)@example.com"
curl -s -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Test123456\",\"name\":\"Test User\"}" | jq .

# 3. Login
echo "=== Testing Login ==="
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Test123456\"}" \
  -c /tmp/cookies.txt | jq -r '.data.accessToken')
echo "Token: $TOKEN"

# 4. Get Profile
echo "=== Testing Profile ==="
curl -s http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq .

# 5. Refresh Token
echo "=== Testing Refresh ==="
curl -s -X POST http://localhost:4000/api/auth/refresh \
  -b /tmp/cookies.txt -c /tmp/cookies.txt | jq .

# 6. Logout
echo "=== Testing Logout ==="
curl -s -X POST http://localhost:4000/api/auth/logout \
  -b /tmp/cookies.txt | jq .
```

---

## 🐛 Debugging

### Check server logs
```bash
# If running with npm run dev
# Logs will appear in the terminal

# Check for errors
grep ERROR logs/*.log
```

### Check database connection
```bash
npx prisma studio
```

### View environment variables
```bash
cat .env
```

### Check if server is running
```bash
curl http://localhost:4000/health
```

### Check which port is being used
```bash
lsof -i :4000
# or
netstat -tulpn | grep 4000
```

---

## 📝 Notes

- **Development Mode**: Use `npm run dev` for auto-reload
- **Production Mode**: Use `npm run build` then `npm start`
- **Cookies**: Some routes use HTTP-only cookies for refresh tokens
- **JWT Tokens**: Access tokens expire in 15 minutes
- **Email**: In development mode, emails are logged to console instead of sent

---

## 🔒 Environment Variables Required

Make sure your `.env` file has:
```env
PORT=4000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
NODE_ENV=development
```
