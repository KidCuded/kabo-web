# KABO — Digital Loyalty & Review Acceleration Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Apple Wallet](https://img.shields.io/badge/Apple_Wallet-PassKit-black?style=flat&logo=apple)](https://developer.apple.com/wallet/)
[![Google Wallet](https://img.shields.io/badge/Google_Wallet-REST_API-4285F4?style=flat&logo=google)](https://developers.google.com/wallet)

**KABO** is a lightning-fast digital loyalty platform that replaces traditional paper punch cards with native **Apple Wallet** and **Google Wallet** passes. It keeps customers engaged with instant rewards, routes critical customer feedback into a private merchant inbox, and automatically directs your happiest customers to leave **5-star Google Reviews**.

---

## ✨ Features

- 🎟️ **Native Mobile Wallet Passes**
  - Instant Apple Wallet (`.pkpass`) and Google Wallet pass issuance.
  - No app download required for customers — passes live directly in their native phone wallet.
- 🎨 **Dynamic Stamp Strips & Visual Customization**
  - Server-side canvas rendering (`@napi-rs/canvas`) for live visual stamp cards.
  - Merchant-customizable card colors, logos, reward thresholds, and icons.
- ⚡ **Real-Time Push Synchronization**
  - **Apple APNs**: Silent push notifications update Apple Wallet passes dynamically when stamps are earned or redeemed.
  - **Google Wallet API**: Direct REST updates to sync pass classes and objects instantly.
- ⭐ **Smart Feedback & Review Booster**
  - Filters customer sentiment at the point of stamp lookup.
  - Prompts high-satisfaction customers to post directly to Google Reviews.
  - Routes constructive or negative feedback privately to the business owner before it becomes a public review.
- 📊 **Merchant Command Center**
  - **Analytics & Customer CRM**: Track visits, stamp velocity, and retention trends.
  - **QR Code Management**: Downloadable and printable in-store counter QR codes for customer registration and stamp scanning.
  - **Feedback Inbox**: Manage customer responses and resolve issues directly.
  - **Customization Studio**: Live preview and editor for digital pass styling.
- 💳 **Subscription & Billing**
  - Automated merchant billing via the **CHIP Payment Gateway** with webhook validation.
- 🔒 **Enterprise-Grade Authentication**
  - Built with **Supabase SSR Auth** and route middleware protection.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Frontend** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Auth SSR) |
| **Wallet Generation** | `passkit-generator` (Apple Wallet), `google-auth-library` (Google Wallet) |
| **Pass Push Updates** | HTTP/2 APNs client (Apple), Google Wallet REST API |
| **Image & Canvas** | `@napi-rs/canvas`, `canvas`, `react-easy-crop`, `ogl` |
| **QR Code Engine** | `@yudiel/react-qr-scanner`, `qrcode.react` |
| **Payments** | CHIP Payment Gateway API & Webhooks |

---

## 📁 Project Structure

```text
kabo-web/
├── app/
│   ├── actions/                  # Server actions (auth, store, stamps)
│   ├── api/
│   │   ├── chip/                 # CHIP payment checkout & webhook handlers
│   │   └── wallet/
│   │       ├── apple/            # Apple PassKit generation, webhooks, & APNs push
│   │       ├── dynamic-strip/    # Canvas-rendered dynamic pass strip images
│   │       └── google/           # Google Wallet pass generation & update endpoints
│   ├── auth/                     # Authentication pages (login, register, forgot-password)
│   ├── dashboard/                # Merchant dashboard (analytics, customers, QR, settings)
│   ├── onboarding/               # Business onboarding flow
│   ├── store/[businessId]/       # Public customer store & pass registration pages
│   ├── layout.tsx                # Root layout & font configuration
│   └── page.tsx                  # Public marketing landing page
├── certificates/                 # Apple PassKit & APNs certificates (gitignored keys)
├── components/                   # Shared UI components (header, footer, DarkVeil, etc.)
├── features/                     # Core domain services (applePush.ts, updateGooglePass.ts)
├── proxy.ts                      # Supabase SSR session validation & route protection
├── supabase/                     # Supabase migrations & configurations
├── types/                        # TypeScript type definitions
└── utils/                        # Supabase client/server helpers, strip generators, etc.
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory and configure the following variables:

```bash
# ----------------------------------------
# Site Configuration
# ----------------------------------------
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ----------------------------------------
# Supabase (Database & Authentication)
# ----------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ----------------------------------------
# Apple Wallet & APNs Configuration
# ----------------------------------------
APPLE_PASS_TYPE_IDENTIFIER=pass.com.yourdomain.kabo
APPLE_TEAM_ID=your-apple-team-id
APPLE_WEB_SERVICE_AUTH_TOKEN=your-custom-auth-token
APPLE_APNS_KEY_ID=your-apns-key-id
APPLE_APNS_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# ----------------------------------------
# Google Wallet Configuration
# ----------------------------------------
GOOGLE_WALLET_ISSUER_ID=your-google-issuer-id
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# ----------------------------------------
# CHIP Payment Gateway
# ----------------------------------------
CHIP_BRAND_ID=your-chip-brand-id
CHIP_API_KEY=your-chip-api-key
CHIP_WEBHOOK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js** 20.x or higher
- **npm**, **pnpm**, or **yarn**

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Certificates (For Apple Wallet)

Place your Apple Pass signing credentials inside the `certificates/` directory:
- `wwdr.pem` (Apple Worldwide Developer Relations Intermediate Certificate)
- `signerCert.pem` (Pass Type ID Certificate)
- `signerKey.pem` (Pass Type ID Private Key)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server with hot-reload |
| `npm run build` | Compiles and builds the production bundle |
| `npm run start` | Runs the production build server |
| `npm run lint` | Runs ESLint to check code quality and formatting |

---

## 🔒 Security & Best Practices

- Never commit `.env.local` or private `.pem` / `.p8` key files in `certificates/` to source control.
- Sensitive endpoints (such as `SUPABASE_SERVICE_ROLE_KEY`, APNs keys, and Google Wallet signing keys) are isolated to server-side routes and never exposed to the client bundle.
- Pass update webhooks are protected with Apple authentication tokens and CHIP cryptographic signature verification.
