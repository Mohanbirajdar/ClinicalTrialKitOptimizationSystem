-- ============================================================
-- Clinical Trial Kit Optimization System — Database Schema
-- MySQL 8.0+
-- ============================================================

-- ─── CLINICAL TRIALS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trials (
  id                VARCHAR(36)   NOT NULL,
  trial_name        VARCHAR(255)  NOT NULL,
  trial_phase       ENUM('Phase I','Phase II','Phase III','Phase IV') NOT NULL,
  status            ENUM('planning','active','completed','suspended') DEFAULT 'planning',
  start_date        DATE          NOT NULL,
  end_date          DATE,
  description       TEXT,
  sponsor           VARCHAR(255),
  protocol_number   VARCHAR(100),
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── RESEARCH SITES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sites (
  id                  VARCHAR(36)   NOT NULL,
  trial_id            VARCHAR(36)   NOT NULL,
  site_name           VARCHAR(255)  NOT NULL,
  location            VARCHAR(255)  NOT NULL,
  country             VARCHAR(100)  NOT NULL,
  activation_date     DATE          NOT NULL,
  patient_capacity    INT           NOT NULL,
  enrolled_patients   INT           DEFAULT 0,
  samples_per_patient INT           DEFAULT 1,
  coordinator_name    VARCHAR(255),
  coordinator_email   VARCHAR(255),
  status              ENUM('pending','active','closed') DEFAULT 'pending',
  created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX trial_idx (trial_id),
  CONSTRAINT fk_sites_trial FOREIGN KEY (trial_id) REFERENCES trials(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── KIT INVENTORY ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kits (
  id                    VARCHAR(36)     NOT NULL,
  kit_type              VARCHAR(100)    NOT NULL,
  lot_number            VARCHAR(100)    NOT NULL UNIQUE,
  manufacturing_date    DATE            NOT NULL,
  expiry_date           DATE            NOT NULL,
  quantity              INT             NOT NULL DEFAULT 0,
  unit_cost             DECIMAL(10,2),
  storage_requirements  VARCHAR(255),
  status                ENUM('available','low_stock','expired','depleted') DEFAULT 'available',
  created_at            TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX expiry_idx (expiry_date),
  INDEX status_idx (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── SHIPMENTS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipments (
  id                      VARCHAR(36)   NOT NULL,
  site_id                 VARCHAR(36)   NOT NULL,
  kit_id                  VARCHAR(36)   NOT NULL,
  quantity                INT           NOT NULL,
  shipment_date           DATE          NOT NULL,
  expected_delivery_date  DATE,
  actual_delivery_date    DATE,
  tracking_number         VARCHAR(100),
  status                  ENUM('preparing','shipped','in_transit','delivered','cancelled') DEFAULT 'preparing',
  notes                   TEXT,
  created_at              TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX site_idx (site_id),
  INDEX kit_idx (kit_id),
  INDEX date_idx (shipment_date),
  CONSTRAINT fk_shipments_site FOREIGN KEY (site_id) REFERENCES sites(id),
  CONSTRAINT fk_shipments_kit  FOREIGN KEY (kit_id)  REFERENCES kits(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── KIT USAGE ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kit_usage (
  id              VARCHAR(36)   NOT NULL,
  site_id         VARCHAR(36)   NOT NULL,
  kit_id          VARCHAR(36)   NOT NULL,
  kits_used       INT           NOT NULL,
  kits_returned   INT           DEFAULT 0,
  kits_wasted     INT           DEFAULT 0,
  usage_date      DATE          NOT NULL,
  patient_count   INT,
  notes           TEXT,
  reported_by     VARCHAR(255),
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX site_idx (site_id),
  INDEX date_idx (usage_date),
  CONSTRAINT fk_usage_site FOREIGN KEY (site_id) REFERENCES sites(id),
  CONSTRAINT fk_usage_kit  FOREIGN KEY (kit_id)  REFERENCES kits(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── DEMAND FORECASTS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demand_forecasts (
  id                VARCHAR(36)     NOT NULL,
  site_id           VARCHAR(36)     NOT NULL,
  kit_type          VARCHAR(100)    NOT NULL,
  forecast_date     DATE            NOT NULL,
  predicted_demand  INT             NOT NULL,
  safety_stock      INT             NOT NULL,
  recommended_qty   INT             NOT NULL,
  confidence_score  DECIMAL(5,2),
  model_version     VARCHAR(50),
  months_ahead      INT             DEFAULT 3,
  created_at        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_forecasts_site FOREIGN KEY (site_id) REFERENCES sites(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── ALERTS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id           VARCHAR(36)   NOT NULL,
  alert_type   ENUM('expiry_warning','low_stock','overstock','shipment_delayed','high_wastage') NOT NULL,
  severity     ENUM('info','warning','critical') NOT NULL,
  entity_type  VARCHAR(50),
  entity_id    VARCHAR(36),
  message      TEXT          NOT NULL,
  is_resolved  BOOLEAN       DEFAULT FALSE,
  resolved_at  TIMESTAMP,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX resolved_idx (is_resolved),
  INDEX type_idx (alert_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- SAMPLE SEED DATA
-- ============================================================

-- Trials
INSERT INTO trials (id, trial_name, trial_phase, status, start_date, end_date, sponsor, protocol_number, description) VALUES
('trial-aurora-001', 'AURORA Phase III Oncology Study',    'Phase III', 'active', '2024-01-15', '2025-12-31', 'Aurora Pharma Inc.',    'AUR-2024-003', 'A randomized controlled trial for novel oncology treatment.'),
('trial-nexus-002',  'NEXUS Phase II Cardiology Trial',    'Phase II',  'active', '2024-03-01', '2025-06-30', 'Nexus Medical Corp.',   'NEX-2024-011', 'Phase II trial for new cardiovascular intervention.');

-- Sites
INSERT INTO sites (id, trial_id, site_name, location, country, activation_date, patient_capacity, enrolled_patients, samples_per_patient, coordinator_name, coordinator_email, status) VALUES
('site-bmc-001',     'trial-aurora-001', 'Boston Medical Center',   'Boston, MA',    'USA',    '2024-02-01', 100, 72, 3, 'Dr. Sarah Chen',    's.chen@bmc.org',    'active'),
('site-mayo-002',    'trial-aurora-001', 'Mayo Clinic Rochester',   'Rochester, MN', 'USA',    '2024-02-15',  80, 45, 3, 'Dr. James Liu',     'j.liu@mayo.edu',    'active'),
('site-jhu-003',     'trial-nexus-002',  'Johns Hopkins Hospital',  'Baltimore, MD', 'USA',    '2024-04-01',  60, 38, 2, 'Dr. Emily Ross',    'e.ross@jhu.edu',    'active'),
('site-toronto-004', 'trial-nexus-002',  'Toronto General Hospital','Toronto, ON',   'Canada', '2024-05-01',  50, 22, 2, 'Dr. Michael Park',  'm.park@tgh.ca',     'active');

-- Kits  (dates relative to a fixed reference; adjust as needed)
INSERT INTO kits (id, kit_type, lot_number, manufacturing_date, expiry_date, quantity, unit_cost, storage_requirements, status) VALUES
('kit-bdk-001', 'Blood Draw Collection Kit',  'LOT-BDK-2024-001',      '2024-12-17', '2025-12-17', 500,  12.50, '2-8°C, Refrigerated',   'available'),
('kit-usk-002', 'Urine Sample Collection Kit','LOT-USK-2024-002',      '2025-01-17', '2025-07-17', 300,   8.75, 'Room temperature',      'available'),
('kit-tbk-003', 'Tissue Biopsy Kit',          'LOT-TBK-2024-003',      '2025-02-17', '2026-02-17', 150,  45.00, '-20°C, Frozen',         'available'),
('kit-bdk-004', 'Blood Draw Collection Kit',  'LOT-BDK-2023-OLD',      '2024-07-17', '2027-03-17',   8,  12.50, '2-8°C, Refrigerated',   'low_stock'),
('kit-pck-005', 'Plasma Collection Kit',      'LOT-PCK-2024-EXPIRING', '2024-10-17', '2025-03-31',  75,  18.00, '-80°C, Ultra-frozen',   'available');
