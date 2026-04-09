# ClinKit — Clinical Trial Kit Optimization System

A full-stack web application for managing specimen kit logistics across multi-site clinical trials. ClinKit provides real-time inventory tracking, demand forecasting, shipment management, wastage analytics, and automated alert generation — all in one unified dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Schema](#database-schema)
- [Pages & Routes](#pages--routes)
- [API Reference](#api-reference)
- [Business Logic Engines](#business-logic-engines)
- [Analytics & Charts](#analytics--charts)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

---

## Overview

ClinKit streamlines the end-to-end lifecycle of clinical trial specimen kits — from procurement and storage to shipment, usage logging, and wastage reporting. It supports multiple trials, multiple research sites per trial, and provides ML-powered demand forecasting so coordinators always know when to reorder.

### Key Capabilities

- Track kits across trials, phases, and geographically distributed sites
- Monitor inventory expiry with automated critical/warning alerts
- Predict future kit demand using a blended ML + formula model
- Visualize wastage trends, sponsor-level analytics, and site-level performance
- Full shipment lifecycle tracking from preparation to delivery

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Database | MySQL 8 on Aiven (cloud-hosted) |
| ORM | Drizzle ORM (type-safe, schema-first) |
| UI | Tailwind CSS + shadcn/ui (Radix primitives) |
| Charts | Recharts |
| Forms | React Hook Form + Zod validation |
| Auth | NextAuth.js |
| ML Service | Python FastAPI microservice |
| Language | TypeScript (full-stack) |
| Deployment | Vercel (frontend) + Aiven (database) |

---

## Features

### Dashboard (3-Tab Analytics)

**Overview Tab**
- KPI cards: Total Kits Shipped, Kits Used, Kits Wasted, Wastage Rate %
- Summary badges: Active Trials, Active Sites, Kits Expiring in 30 Days
- 6-month monthly wastage line chart (shipped / used / wasted)
- Expiry heatmap: Expired / <30 days / 30-60 days buckets
- Top 10 site usage table with per-site wastage %
- Live alert feed showing recent unresolved alerts

**Trials Tab**
- Per-trial analytics: sites, enrolled patients, kits shipped, used, wasted
- Wastage rate per trial with trend indicators

**Sponsors Tab**
- Sponsor-level aggregation of trial and kit metrics
- Compare kit wastage and shipment efficiency across sponsors

---

### Clinical Trials Management

- Create trials with full metadata: name, phase (I-IV), status, dates, sponsor, protocol number
- **Drug Information fields:** drug name, drug class, dosage, administration route (Oral, IV, Subcutaneous, Intramuscular, Topical, Inhalation)
- View all trials in a sortable table with status badges and phase indicators
- Trial detail page showing drug information, site enrollment summary, and linked research sites
- Filter trials by phase, status, and sponsor

---

### Research Sites

- Register sites linked to a parent trial
- Track per-site: location, country, activation date, patient capacity, enrolled patients, samples per patient
- Coordinator contact management (name + email)
- Enrollment progress bar showing enrolled vs. capacity
- Estimated kit demand calculation (enrolled x samples/patient)
- Demand forecast section per site showing predicted demand, safety stock, and recommended order quantity
- "Run Forecast" button triggers on-demand ML prediction for any kit type

---

### Kit Inventory Management

- Track kit lots: type, lot number (unique), manufacturing date, expiry date, quantity, unit cost, storage requirements
- Auto-computed status: `available` -> `low_stock` (< threshold) -> `depleted` -> `expired`
- Color-coded expiry badges with days-remaining countdown
- Expiring kits view grouped into three risk buckets: Expired / < 30 days / 30-60 days
- Inventory summary cards: total lots, total units in stock

---

### Shipment Tracking

- Create shipments linking a kit lot to a research site
- Business logic: validates kit availability, deducts quantity from inventory, updates kit status automatically
- Full shipment lifecycle: Preparing -> Shipped -> In Transit -> Delivered / Cancelled
- Track expected vs. actual delivery dates, tracking numbers, and notes
- Status update form per shipment with timeline view

---

### Kit Usage Logging

- Log kit consumption per site: kits used, returned, and wasted
- Business logic: subtracts used kits, adds back returned kits, updates kit inventory status
- Per-record metadata: patient count, usage date, reported by, notes
- Summary cards: Total Used, Total Returned, Total Wasted
- Usage table sortable by site, date, kit type

---

### Demand Forecasting (ML-Powered)

- Generates kit demand predictions per site and kit type
- Blended model: 60% historical usage average + 40% formula (if >= 3 months data), otherwise pure formula
- Formula: `enrolled_patients x samples_per_patient x phase_multiplier x months_ahead`
- Phase multipliers: Phase I = 0.6, Phase II = 0.8, Phase III = 1.0, Phase IV = 0.9
- Trend adjustment: +/- 30% based on last 2 months trend
- Safety stock: 20% of predicted demand
- Confidence score: 0.60-0.95 depending on data quality
- Falls back gracefully to formula if ML microservice is unavailable
- Results stored in `demand_forecasts` table for historical comparison

---

### Automated Alert System

- **Alert types:** Expiry Warning, Low Stock, Overstock, Shipment Delayed, High Wastage
- **Severity levels:** Info, Warning, Critical
- Alert scan checks:
  - Kits expiring in 30 days -> Warning; <= 14 days -> Critical
  - Kits with < 10 units -> Warning; < 5 units -> Critical
  - Expired kits still in inventory -> Critical (auto-updates kit status)
- "Run Alert Scan" button in the Alert Center triggers a fresh scan
- Resolve individual alerts with one click (marks resolved_at timestamp)
- Alert feed on dashboard shows latest unresolved alerts

---

### Analytics Page

- Comprehensive analytics with multiple chart types:
  - **Line chart** — Monthly kits shipped / used / wasted (6-month window)
  - **Bar chart** — Monthly wastage rate % with color coding (> 20% = red, > 10% = orange, <= 10% = green)
  - **Pie / Donut chart** — Kit distribution: Used vs. Wasted vs. Remaining
  - **Expiry risk summary** — Visual buckets for Expired, < 30 days, 30-60 days
- KPI counters: Active Trials, Active Sites, Kits Expiring <= 30d, Kits Expiring <= 60d
- Top 10 sites by shipment volume with wastage %

---

## Database Schema

```
trials
├── id (UUID, PK)
├── trial_name, trial_phase, status
├── start_date, end_date, description
├── sponsor, protocol_number
├── drug_name, drug_dosage, drug_administration_route, drug_class
└── created_at, updated_at

sites (-> trials)
├── id, trial_id (FK)
├── site_name, location, country, activation_date
├── patient_capacity, enrolled_patients, samples_per_patient
├── coordinator_name, coordinator_email, status
└── created_at, updated_at

kits
├── id, kit_type, lot_number (UNIQUE)
├── manufacturing_date, expiry_date
├── quantity, unit_cost, storage_requirements, status
└── created_at, updated_at

shipments (-> sites, kits)
├── id, site_id (FK), kit_id (FK)
├── quantity, shipment_date, expected_delivery_date, actual_delivery_date
├── tracking_number, status, notes
└── created_at, updated_at

kit_usage (-> sites, kits)
├── id, site_id (FK), kit_id (FK)
├── kits_used, kits_returned, kits_wasted
├── usage_date, patient_count, notes, reported_by
└── created_at

demand_forecasts (-> sites)
├── id, site_id (FK), kit_type, forecast_date
├── predicted_demand, safety_stock, recommended_qty
├── confidence_score, model_version, months_ahead
└── created_at

alerts
├── id, alert_type, severity
├── entity_type, entity_id, message
├── is_resolved, resolved_at
└── created_at
```

---

## Pages & Routes

| Route | Description |
|---|---|
| `/` | Dashboard with Overview, Trials, Sponsors tabs |
| `/trials` | All clinical trials list |
| `/trials/new` | Create a new trial (including drug info) |
| `/trials/[id]` | Trial detail — drug info, sites, enrollment |
| `/sites` | All research sites list |
| `/sites/new` | Register a new site |
| `/sites/[id]` | Site detail — enrollment, forecasts |
| `/inventory` | Kit inventory list with expiry indicators |
| `/inventory/new` | Add a new kit lot |
| `/inventory/expiring` | Expiring kits grouped by risk bucket |
| `/shipments` | All shipments with status |
| `/shipments/new` | Create a new shipment |
| `/shipments/[id]` | Shipment detail and status update |
| `/usage` | Kit usage logs |
| `/usage/new` | Log kit usage/wastage |
| `/alerts` | Alert center with resolve functionality |
| `/analytics` | Full analytics dashboard with charts |

---

## API Reference

### Trials
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trials` | List all trials |
| `POST` | `/api/trials` | Create a trial |
| `GET` | `/api/trials/[id]` | Get trial by ID |

### Sites
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sites` | List sites (optional `?trial_id=`) |
| `POST` | `/api/sites` | Register a site |
| `GET` | `/api/sites/[id]` | Get site with forecasts |
| `POST` | `/api/sites/[id]/forecast` | Generate demand forecast |

### Kits
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/kits` | List kits (optional `?status=`) |
| `POST` | `/api/kits` | Add a kit lot |
| `GET` | `/api/kits/[id]` | Get kit by ID |
| `GET` | `/api/kits/expiring` | Expiring kits (optional `?days=60`) |

### Shipments
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/shipments` | List shipments |
| `POST` | `/api/shipments` | Create shipment (deducts kit inventory) |
| `GET` | `/api/shipments/[id]` | Get shipment |
| `PATCH` | `/api/shipments/[id]/status` | Update shipment status |

### Usage
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/usage` | List usage records |
| `POST` | `/api/usage` | Log kit usage (updates kit inventory) |

### Alerts
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/alerts` | List alerts (optional `?resolved=false`) |
| `POST` | `/api/alerts/check` | Run alert scan |
| `PATCH` | `/api/alerts/[id]/resolve` | Resolve an alert |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/dashboard` | Full dashboard summary |

### Forecast
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/forecast/predict` | Generate ML demand forecast |

---

## Business Logic Engines

### Alert Engine (`src/lib/alert-engine.ts`)
Runs `runAlertScan()` which:
1. Queries all kits and checks expiry dates
2. Checks stock levels against thresholds
3. Inserts new alert records into the database
4. Auto-updates `kit.status` to `expired` for past-expiry kits

### Demand Engine (`src/lib/demand-engine.ts`)
Runs `predictDemandWithML()` which:
1. Calls the Python ML microservice (5s timeout)
2. Falls back to formula-based prediction if ML is unavailable
3. Returns `{ predicted_demand, safety_stock, recommended_qty, confidence_score }`

---

## Analytics & Charts

All charts use **Recharts** and are rendered as client components.

| Chart | Type | Data Source |
|---|---|---|
| Monthly Wastage | Line (3 series) | `getDashboardSummary()` |
| Monthly Wastage Rate | Bar (color-coded) | `getDashboardSummary()` |
| Kit Distribution | Pie / Donut | Usage aggregate |
| Trial Analytics | Table with badges | `getTrialAnalytics()` |
| Sponsor Analytics | Table with badges | `getSponsorAnalytics()` |
| Expiry Risk | Summary buckets | `getExpiringKits()` |
| Site Usage | Table (top 10) | `getDashboardSummary()` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8 database (local or Aiven)
- (Optional) Python 3.10+ for the ML microservice

### Installation

```bash
# Clone the repository
git clone https://github.com/Mohanbirajdar/ClinicalTrialKitOptimizationSystem.git
cd ClinicalTrialKitOptimizationSystem

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your DB credentials
```

### Database Setup

```bash
# Push schema to your database
npm run db:push

# (Optional) Run seed data
npx tsx src/db/seed.ts
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema directly (no migrations) |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |

---

## Environment Variables

Create a `.env.local` file with the following:

```env
# Database (Aiven MySQL)
DB_HOST=mysql-xxxxxxxx-yourproject.h.aivencloud.com
DB_PORT=28392
DB_USER=avnadmin
DB_PASSWORD=your_password_here
DB_NAME=defaultdb

# ML Microservice (optional)
ML_SERVICE_URL=http://localhost:8000

# Auth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

> **Note:** `.env.local` is gitignored. For Vercel deployments, set these in the Vercel dashboard under **Settings -> Environment Variables**.

---

## Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add all environment variables in **Settings -> Environment Variables**
4. Deploy

### Aiven (Database)

1. Create a MySQL service on [Aiven](https://aiven.io)
2. Set IP Filter to **Open to all** (0.0.0.0/0) to allow Vercel serverless IPs
3. Run `npm run db:push` to initialize schema

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx              # Main dashboard (Overview/Trials/Sponsors tabs)
│   │   ├── trials/               # Trial management pages
│   │   ├── sites/                # Site management pages
│   │   ├── inventory/            # Kit inventory pages
│   │   ├── shipments/            # Shipment tracking pages
│   │   ├── usage/                # Kit usage logging pages
│   │   ├── alerts/               # Alert center
│   │   └── analytics/            # Analytics dashboard
│   └── api/
│       ├── trials/               # Trials CRUD API
│       ├── sites/                # Sites + forecast API
│       ├── kits/                 # Kit inventory API
│       ├── shipments/            # Shipments API
│       ├── usage/                # Usage logging API
│       ├── alerts/               # Alerts + alert scan API
│       ├── forecast/             # ML forecast API
│       └── analytics/            # Analytics summary API
├── components/
│   ├── layout/                   # Sidebar, Topbar
│   ├── dashboard/                # KpiCard, WastageChart, ExpiryHeatmap, AlertFeed, etc.
│   └── ui/                       # shadcn/ui base components
├── db/
│   ├── schema.ts                 # Drizzle ORM schema
│   ├── index.ts                  # DB connection pool
│   ├── seed.ts                   # Realistic seed data
│   └── migrations/               # Drizzle migration files
└── lib/
    ├── data.ts                   # Server-side data fetching functions
    ├── alert-engine.ts           # Automated alert scan logic
    ├── demand-engine.ts          # ML demand forecasting logic
    ├── utils.ts                  # Helper utilities
    └── validators/               # Zod validation schemas
        ├── trial.schema.ts
        ├── site.schema.ts
        ├── kit.schema.ts
        ├── shipment.schema.ts
        └── usage.schema.ts
```

---

## License

MIT — built for clinical trial logistics optimization.
