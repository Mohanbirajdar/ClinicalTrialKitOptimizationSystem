# ClinKit — Clinical Trial Kit Optimization System

A full-stack web application for managing specimen kit logistics across multi-site clinical trials. Built with Next.js 14, Drizzle ORM, MySQL (Aiven), and a Python FastAPI ML microservice for demand forecasting.

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Real-time KPIs — kits shipped, used, wasted, wastage %, active trials |
| **Trials** | Create and track clinical trials (Phase I–IV) with status management |
| **Sites** | Manage trial sites globally — enrollment, capacity, coordinators |
| **Kit Inventory** | Track kit lots, quantities, expiry dates, storage requirements |
| **Expiring Kits** | Categorised view — expired / expiring in 30 days / 30–60 days |
| **Shipments** | Full shipment lifecycle — preparing → shipped → in transit → delivered |
| **Kit Usage** | Record and audit kit consumption, returns, and wastage per site |
| **Analytics** | Monthly wastage trends, site-level usage charts, efficiency metrics |
| **Alerts** | Auto-generated alerts for low stock, expiry warnings, shipment delays, high wastage |
| **Demand Forecasting** | ML-powered (Ridge Regression) + formula fallback for kit demand prediction per site |

---

## Tech Stack

### Frontend / Backend (Next.js)
- **Next.js 14** — App Router, Server Components, API Routes
- **Drizzle ORM** — Type-safe MySQL queries
- **MySQL** — Hosted on [Aiven](https://aiven.io) free tier
- **Tailwind CSS** + **shadcn/ui** — UI components
- **Recharts** — Analytics charts
- **NextAuth.js** — Authentication
- **React Hook Form** + **Zod** — Form validation
- **TanStack Table** — Data tables

### ML Microservice (Python)
- **FastAPI** — REST API for demand prediction
- **scikit-learn** — Ridge Regression model
- **Pandas / NumPy** — Feature engineering
- **Uvicorn** — ASGI server
- **Docker** — Containerised deployment

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # All UI pages
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── trials/           # Trials CRUD
│   │   │   ├── sites/            # Sites + forecast
│   │   │   ├── inventory/        # Kit inventory + expiring
│   │   │   ├── shipments/        # Shipment tracking
│   │   │   ├── usage/            # Kit usage logs
│   │   │   ├── analytics/        # Charts & metrics
│   │   │   └── alerts/           # System alerts
│   │   └── api/                  # REST API routes
│   │       ├── trials/
│   │       ├── sites/
│   │       ├── kits/
│   │       ├── shipments/
│   │       ├── usage/
│   │       ├── alerts/
│   │       ├── analytics/
│   │       └── forecast/
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema
│   │   ├── index.ts              # DB connection pool (SSL-aware)
│   │   └── seed.ts               # CVD trial seed data
│   ├── lib/
│   │   ├── data.ts               # Server-side data access functions
│   │   ├── utils.ts              # Helpers (formatDate, getExpiryStatus, generateId)
│   │   └── api-response.ts       # Standardised API response helpers
│   └── components/
│       ├── layout/               # Sidebar, Topbar
│       └── ui/                   # shadcn/ui components
├── ml-service/
│   ├── main.py                   # FastAPI app (predict, train, batch predict)
│   ├── train_sample.py           # Sample training script
│   ├── requirements.txt
│   └── Dockerfile
├── drizzle.config.ts
├── next.config.mjs
└── docker-compose.yml
```

---

## Database Schema

```
trials ──< sites ──< shipments >── kits
                 ──< kit_usage >── kits
                 ──< demand_forecasts
alerts (standalone)
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.10+ (for ML service)
- MySQL database (local or Aiven)

### 1. Clone the repository

```bash
git clone https://github.com/Mohanbirajdar/ClinicalTrialKitOptimizationSystem.git
cd ClinicalTrialKitOptimizationSystem
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
# Database
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# ML Service (optional — formula fallback used if not running)
ML_SERVICE_URL=http://localhost:8000

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

NODE_ENV=development
```

> **Aiven MySQL note:** SSL is automatically enabled when `DB_HOST` contains `aivencloud.com`.

### 4. Push database schema

```bash
npm run db:push
```

### 5. Seed sample data

```bash
npx tsx src/db/seed.ts
```

### 6. Start the app

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

### ML Service (optional)

```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API docs at `http://localhost:8000/docs`.

Or with Docker:

```bash
docker build -t clinkit-ml ./ml-service
docker run -p 8000:8000 clinkit-ml
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |

---

## Seed Data (Cardiovascular Disease Trials)

The seed script populates the database with realistic CVD trial data referencing [ClinicalTrials.gov](https://clinicaltrials.gov):

| Trial | Reference | Sites |
|-------|-----------|-------|
| TARTAN-HF: Diabetes & Heart Failure Biomarker Screening | NCT05705869 | Glasgow, Edinburgh |
| HEART-PROTECT Phase III: Proteomics in CAD | NCT06900270 | São Paulo, Cleveland, Singapore |
| CARISMA-HF Phase II: Cardiac Remodelling Inhibition | — | Berlin, Paris, Baltimore, Toronto |
| PREVENT-ACS Phase IV: Post-MI Secondary Prevention | — | Mayo Clinic, Karolinska |

Kit types seeded: EDTA, SST, Plasma, NT-proBNP, hs-Troponin I, Lipid Panel, Biopsy, Platelet Function, Coagulation, PBMC.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | Yes | MySQL host |
| `DB_PORT` | Yes | MySQL port (default 3306) |
| `DB_USER` | Yes | MySQL user |
| `DB_PASSWORD` | Yes | MySQL password |
| `DB_NAME` | Yes | Database name |
| `ML_SERVICE_URL` | No | FastAPI ML service URL (falls back to formula if unset) |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `NEXTAUTH_URL` | Yes | Full URL of your deployment |
| `NODE_ENV` | No | `development` or `production` |

---

## License

MIT
