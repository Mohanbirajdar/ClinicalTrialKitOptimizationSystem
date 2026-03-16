# ClinKit — Clinical Trial Kit Optimization System

A smart specimen kit management platform for clinical trials that reduces kit wastage through demand prediction, inventory tracking, and analytics.

## Quick Start

### Prerequisites
- Node.js 20+
- MySQL 8.0+
- Python 3.11+ (for ML service, optional)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials
```

### 3. Set Up Database
```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE clinical_kit_db;"

# Run migrations
npm run db:push

# Seed with sample data (optional)
npx tsx src/db/seed.ts
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ML Service (Optional)

```bash
cd ml-service
pip install -r requirements.txt

# Train initial model with synthetic data
python train_sample.py

# Start service
uvicorn main:app --reload --port 8000
```

---

## Docker Compose (Full Stack)

```bash
# Copy env file
cp .env.example .env

# Start everything
docker-compose up -d

# Run migrations
docker-compose exec app npm run db:push

# Seed data
docker-compose exec app npx tsx src/db/seed.ts
```

---

## Features

| Feature | Status |
|---|---|
| Clinical Trial Management | ✅ |
| Site Registration & Tracking | ✅ |
| Kit Inventory Management | ✅ |
| Shipment Tracking | ✅ |
| Kit Usage Logging | ✅ |
| Expiry Tracking (30/60 day) | ✅ |
| Alert System | ✅ |
| Analytics Dashboard | ✅ |
| Demand Prediction (Formula) | ✅ |
| Demand Prediction (ML) | ✅ |

## Stack

- **Frontend/Backend**: Next.js 14 App Router
- **Database**: MySQL 8.0 + Drizzle ORM
- **UI**: Shadcn/UI + Tailwind CSS
- **Charts**: Recharts
- **ML Service**: Python FastAPI + scikit-learn

## Formula

```
Required Kits = Predicted Demand + Safety Stock
Predicted Demand = Enrolled Patients × Samples per Patient × Phase Multiplier
Safety Stock = 20% of Predicted Demand
```
