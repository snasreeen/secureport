## SecurePort – Ethical Educational Port Scanning Platform

**SecurePort** is a secure, educational cybersecurity platform demonstrating TCP port scanning principles with strict ethical enforcement, authentication controls, logging mechanisms, and misuse prevention safeguards.

The system is a real full‑stack web application:

- **Frontend**: React + Vite, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, Prisma ORM, MySQL, JWT auth, bcrypt
- **Scanner Engine**: Server‑side TCP connect scan using Node&apos;s `net` module

---

### 1. Features Overview

- **User authentication**
  - Registration, login, logout
  - Password hashing with bcrypt
  - JWT stored in HTTPOnly cookie
  - Account lock after 5 failed login attempts
  - Session expiry and `/auth/me` session check
- **Security middleware**
  - Helmet, custom security headers
  - CSRF protection (cookie + header token)
  - Rate limiting (global, login, and scan‑specific)
  - Centralized error handling and structured responses
  - CORS restricted to frontend origin
- **TCP Connect Scanner (server‑side only)**
  - Uses Node `net` module; never exposed to the client
  - Validates IPv4 addresses and port ranges
  - Maximum 1000 ports per scan
  - Blocks disallowed ranges and full 1–65535 scans
  - Per‑IP scan rate limiting (max 5 scans/minute)
- **Ethical enforcement**
  - Mandatory Ethical Agreement page
  - Checkbox acknowledgment required before scanning
  - Agreement timestamp stored per scan record
  - Legal warning banners and UI messaging
- **Scan history**
  - Per-user scan records stored via Prisma in MySQL
  - Target IP, port range, open ports, timestamps, ethical agreement time
  - View, delete own history, export as JSON report
- **AI educational search**
  - API accepts high‑level, defensive questions only
  - Filters harmful prompts (`exploit`, `hack`, `bypass`, etc.)
  - Responds with: “This platform supports defensive cybersecurity learning only.” for disallowed prompts

---

### 2. Project Structure

```text
hell/
  server/
    package.json
    prisma/
      schema.prisma
    src/
      index.js
      lib/
        prisma.js
      middleware/
        auth.js
        errorHandler.js
        rateLimiter.js
        security.js
      controllers/
        authController.js
        scanController.js
        historyController.js
        aiController.js
        adminController.js
      routes/
        authRoutes.js
        scanRoutes.js
        historyRoutes.js
        aiRoutes.js
        adminRoutes.js
      services/
        scannerService.js

  client/
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
    index.html
    src/
      main.jsx
      App.jsx
      index.css
      utils/
        apiClient.js
      state/
        AuthContext.jsx
      components/
        Layout.jsx
        ProtectedRoute.jsx
        LegalBanner.jsx
        LoadingSpinner.jsx
      pages/
        LoginPage.jsx
        DashboardPage.jsx
        EthicalAgreementPage.jsx
        ScannerPage.jsx
        HistoryPage.jsx
        EducationPage.jsx
        AdminDashboardPage.jsx
```

---

### 3. Environment Setup

#### Backend (`server/`)

1. Create an `.env` file in `server/`:

```bash
DATABASE_URL="mysql://<user>:<password>@localhost:3306/<database>"
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
# Optional: allow private/localhost scans only in non-production
ALLOW_PRIVATE_SCAN=true
```

2. Install dependencies, generate the Prisma client, run migrations, and start the server:

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init_mysql_schema
npm run dev
```

The backend will start on `http://localhost:5000` by default (or `PORT` from `.env`).

#### Frontend (`client/`)

1. Install dependencies and run:

```bash
cd client
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` and proxy `/api` to the backend.

---

### 4. Authentication & Security

- **JWT auth**
  - Auth cookie is HTTPOnly (`secure` + `sameSite` tightened in production).
  - `/api/auth/register` and `/api/auth/login` set the cookie; `/api/auth/logout` clears it.
  - `/api/auth/me` returns the current user for session restoration.
- **Account lockout**
  - After **5 failed logins**, the account is locked for a configurable window (default 15 minutes).
- **Rate limiting**
  - Global: caps requests per minute for generic abuse protection.
  - Login: tight limit for `/auth/login` to mitigate credential stuffing.
  - Scan: `/api/scans` limited to **5 scans per minute** per IP.
- **CSRF**
  - `csurf` middleware issues a CSRF cookie and token via `GET /api/csrf-token`.
  - The React app stores this token in `sessionStorage` and attaches it via `x-csrf-token` header for non‑GET requests.
- **Input validation**
  - Auth: email format and strong password checks.
  - Scanner: IPv4 validation, port range and size validation, blocklisted ranges.
  - Centralized error handler avoids leaking stack traces to clients.

---

### 5. TCP Connect Scan Implementation

- Implemented in `server/src/services/scannerService.js` using Node&apos;s `net` module.
- The scan logic:
  - Validates input (`validateScanInput`) and enforces:
    - Ports between 1–65535
    - `startPort ≤ endPort`
    - Maximum **1000** ports per scan
    - Disallows full 1–65535 scans
    - Blocks reserved-only scans (strictly 0–1023)
  - **IP safety rules**:
    - Always blocks non-routable/broadcast addresses such as `0.0.0.0` and `255.255.255.255`.
    - Treats the following as **private/loopback** IPv4 ranges:
      - `10.0.0.0/8`
      - `172.16.0.0/12` (172.16.x.x – 172.31.x.x)
      - `192.168.0.0/16`
      - `127.0.0.0/8` (localhost)
    - In **production** (`NODE_ENV=production`), private and localhost ranges are **always blocked** regardless of configuration.
    - In **non-production**:
      - If `ALLOW_PRIVATE_SCAN=true` in `.env`, private and localhost IPs are allowed (for local lab/testing only).
      - If `ALLOW_PRIVATE_SCAN` is missing or not `"true"`, private and localhost IPs remain blocked.
  - Performs TCP connect attempts with a 3000ms timeout using `net.Socket`, with a concurrency cap of 50 connections to avoid overwhelming systems.
  - Collects open ports and annotates them with simple service names and risk levels (e.g., SSH, HTTP, RDP).
  - All scanning happens entirely on the server; the frontend only calls the REST API.

The scanner is intentionally conservative and educational, not optimized for speed or stealth.

---

### 6. Frontend UX & Pages

- **Theme**
  - Background: `#121212`
  - Accent: `#00E5FF`
  - Error/Warning: `#FF3B3B`
  - Dark, modern dashboard with sidebar navigation and cards.

- **Pages**
  - `LoginPage`
    - Email + password, validation and error messages in red.
    - Toggle between register and login modes.
    - Redirects to dashboard on success.
  - `DashboardPage`
    - Welcome message, platform overview, quick‑start steps.
    - Legal banner explaining ethical and legal constraints.
  - `EthicalAgreementPage`
    - Detailed ethical disclaimer.
    - Checkbox: “I confirm that I have authorization to scan this system.”
    - Agreement state and timestamp stored in `sessionStorage` and required for scans.
  - `ScannerPage`
    - Inputs: target IPv4, start port, end port.
    - Client‑side progress bar and loading indicator.
    - Results table with **Port**, **Status**, **Service**, **Risk level**.
  - `HistoryPage`
    - Lists per‑user scan records from the database via Prisma.
    - Delete an entry or export all as JSON.
  - `EducationPage`
    - AI‑style text box for defensive questions.
    - Harmful prompts are detected and answered with a defensive‑only message.

---

### 7. Ethical Disclaimer

SecurePort is intended **solely** for:

- Demonstrating how TCP port scanning works in a controlled, educational context.
- Helping defenders understand the exposure created by open ports.
- Reinforcing best practices like limiting attack surface, patching, and monitoring.

You **must not** use SecurePort to scan systems without explicit authorization. Unauthorized port
scanning may be illegal and can violate organizational policies or regulations. The application
logs:

- Authenticated user identifier
- Target IP
- Port range
- Open ports detected
- Timestamps and ethical agreement confirmation

Operators should monitor these logs for suspicious behavior.

---

### 8. Deployment Notes

- Run the backend behind HTTPS (e.g., via a reverse proxy such as Nginx or a cloud load balancer).
- Set secure production values:
  - `NODE_ENV=production`
  - Strong `JWT_SECRET`
  - Correct `CLIENT_ORIGIN` (your production frontend URL)
- Ensure MongoDB is secured (authentication, network restrictions, regular backups).
- Consider extending:
  - Admin views for aggregated scan monitoring and anomaly detection.
  - More refined IP allowlists/blacklists and alerting hooks.

---

This project is designed as a **defensive, educational platform**, not an offensive toolset. All
logic, wording, and safeguards are oriented toward responsible use and risk reduction.

