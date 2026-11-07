# ReLoop — Community Circular Economy Marketplace

> **"Good things deserve another life."**  
> A hyperlocal, community-driven marketplace empowering people to buy, sell, rent, and exchange pre-owned goods while curbing waste and promoting circular consumption.  
> *Developed as a VTU Computer Science & Engineering Societal Project pilot for Davanagere, Karnataka, India.*

---

## 🌟 Key Capabilities & Highlights

1. **Circular Transaction Modes**
   - **Buy & Sell**: Fair local pricing for textbooks, electronics, mobility gear, and hostel necessities.
   - **Rent**: Affordable day-to-day rentals with configurable minimum periods and security deposit estimates.
   - **Exchange & Barter**: Direct item-for-item proposals with optional UPI cash balancing.

2. **Davanagere Hyperlocal Intelligence**
   - Pre-mapped neighborhood clusters: *BIET Campus*, *MCC A & B Block*, *Vidyanagar*, *Hadadi Road*, *KBL Layout*, *PJ Extension*, *Bapuji Layout*.
   - Public meetup recommendations to encourage safe transactions at verified community landmarks.

3. **Trust & Community Moderation**
   - **Verified Reviews**: Reviews can only be submitted after confirmed transactions to prevent manipulation.
   - **Real-Time Notification Centre**: Live alerts for offers, messages, and review feedback.
   - **Admin Moderation Suite** (`/admin`): Executive metrics, reports queue, user suspension/reactivation, listing flagging, and immutable audit logs.

4. **ReLoop Sustainability Intelligence**
   - Science-based metrics grounded in the **EPA Waste Reduction Model (WARM v15)** and VTU Davanagere Circular Campus data.
   - Live computations for **CO₂e emissions avoided**, **virtual water conserved**, **toxic e-waste diverted**, and **student pocketbook savings**.
   - Public community leaderboard celebrating local circular champions.

5. **Production Architecture & Security**
   - **Dual-mode Authentication**: HTTP-only secure cookie (`reloop_token`) for browsers + `Authorization: Bearer <token>` for API clients.
   - **Multi-tier Rate Limiting**: Dedicated rate limiters for authentication brute-force prevention, uploads, and general API traffic.
   - **Image Validation**: Binary magic-byte inspection (JPEG, PNG, WebP) enforcing true 5MB limits with Cloudinary integration.
   - **Real-time WebSockets**: Low-latency gateway (`/ws`) for instant messaging and notifications.
   - **PostgreSQL Connection Pooling**: Transactional migration runner with development fallback store.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+ (tested on Node v20/v26)
- npm or yarn

### 2. Installation
```bash
git clone <repo-url>
cd reloop
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
*(The system runs out of the box in development mode using the high-fidelity persistent relational JSON store.)*

### 4. Running the Development Server
Run frontend and backend concurrently:
```bash
npm run dev:all
```
Or independently:
```bash
# Terminal 1: Backend API & WebSocket Gateway (Port 4000)
npm run server

# Terminal 2: Vite Frontend Dev Server (Port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Verification

Run the automated 24-point End-to-End integration test suite:
```bash
npx tsx server/test_e2e.ts
```

Run TypeScript compilation and production build:
```bash
npx tsc --noEmit
npm run build
```

---

## 🔑 Demo Accounts (Development)

| Name | Role | Email | Password |
|---|---|---|---|
| Platform Admin | Admin | `admin@reloop.in` | `password123` |
| Ananya Sharma | Student / Seller (BIET) | `ananya.sharma@example.com` | `password123` |
| Karthik Gowda | Neighbor / Buyer (MCC B Block) | `karthik.gowda@example.com` | `password123` |

---

## 📁 Repository Structure

```text
reloop/
├── server/
│   ├── config/env.ts             # Zod environment validation & strict checks
│   ├── db/
│   │   ├── index.ts              # Dual PostgreSQL pool & JSON store adapter
│   │   ├── migrations.ts         # Versioned PostgreSQL migration runner
│   │   └── schema.sql            # 14-table relational schema & indexes
│   ├── lib/
│   │   └── cloudinary.ts         # Cloudinary SDK & binary magic-number validation
│   ├── middleware/
│   │   ├── auth.ts               # Cookie & Bearer JWT authentication & role checks
│   │   ├── errorHandler.ts       # Centralized error handler
│   │   ├── rateLimit.ts          # Express rate limiting
│   │   └── validation.ts         # Zod request body validation
│   ├── routes/                   # API routers (auth, products, orders, reviews, etc.)
│   ├── websocket.ts              # Real-time WebSocket server gateway
│   ├── index.ts                  # Main Express HTTP & WebSocket entrypoint
│   └── test_e2e.ts               # Automated 24-point integration suite
├── src/
│   ├── components/
│   │   ├── auth/                 # ProtectedRoute & auth utilities
│   │   ├── layout/               # Navbar with notification bell, DashboardLayout
│   │   ├── marketplace/          # ProductCard, filters, image gallery
│   │   ├── reviews/              # ReviewModal for verified handovers
│   │   └── ui/                   # Button, Badge, DoodleCrewFooter, ClothingRail
│   ├── contexts/                 # AuthContext & ToastContext
│   ├── pages/
│   │   ├── admin/                # AdminDashboardPage (moderation & metrics)
│   │   ├── auth/                 # LoginPage, ForgotPasswordPage, ResetPasswordPage
│   │   ├── dashboard/            # Overview, Listings, Orders, Requests, Messages
│   │   ├── LandingPage.tsx       # Hero, DoodleCrew footer, curated rail
│   │   ├── MarketplacePage.tsx   # Multi-facet search, filters, conditions
│   │   ├── ProductDetailPage.tsx # Purchase, rental, exchange & report actions
│   │   ├── CreateListingPage.tsx # Multi-step listing creation & live preview
│   │   ├── MapDiscoveryPage.tsx  # Hyperlocal Davanagere map explorer
│   │   └── SustainabilityPage.tsx# Scorecard, leaderboard, EPA WARM methodology
│   ├── services/
│   │   └── api.ts                # Typed Universal API client
│   └── types/                    # Domain data models & TypeScript interfaces
├── public/                       # Static public assets & uploads
└── package.json
```

---

## 📜 Academic Attribution
- **Institution**: Visvesvaraya Technological University (VTU)
- **Department**: Computer Science & Engineering
- **Course**: Societal Project (1BCP308)
- **Focus**: Circular Economy, Hyperlocal Resource Sharing, Environmental Diversion
