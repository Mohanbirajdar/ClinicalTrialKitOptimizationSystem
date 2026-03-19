CREATE TABLE `alerts` (
	`id` varchar(36) NOT NULL,
	`alert_type` enum('expiry_warning','low_stock','overstock','shipment_delayed','high_wastage') NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL,
	`entity_type` varchar(50),
	`entity_id` varchar(36),
	`message` text NOT NULL,
	`is_resolved` boolean DEFAULT false,
	`resolved_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `demand_forecasts` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`kit_type` varchar(100) NOT NULL,
	`forecast_date` date NOT NULL,
	`predicted_demand` int NOT NULL,
	`safety_stock` int NOT NULL,
	`recommended_qty` int NOT NULL,
	`confidence_score` decimal(5,2),
	`model_version` varchar(50),
	`months_ahead` int DEFAULT 3,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `demand_forecasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kit_usage` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`kit_id` varchar(36) NOT NULL,
	`kits_used` int NOT NULL,
	`kits_returned` int DEFAULT 0,
	`kits_wasted` int DEFAULT 0,
	`usage_date` date NOT NULL,
	`patient_count` int,
	`notes` text,
	`reported_by` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `kit_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kits` (
	`id` varchar(36) NOT NULL,
	`kit_type` varchar(100) NOT NULL,
	`lot_number` varchar(100) NOT NULL,
	`manufacturing_date` date NOT NULL,
	`expiry_date` date NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`unit_cost` decimal(10,2),
	`storage_requirements` varchar(255),
	`status` enum('available','low_stock','expired','depleted') DEFAULT 'available',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kits_id` PRIMARY KEY(`id`),
	CONSTRAINT `kits_lot_number_unique` UNIQUE(`lot_number`)
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` varchar(36) NOT NULL,
	`site_id` varchar(36) NOT NULL,
	`kit_id` varchar(36) NOT NULL,
	`quantity` int NOT NULL,
	`shipment_date` date NOT NULL,
	`expected_delivery_date` date,
	`actual_delivery_date` date,
	`tracking_number` varchar(100),
	`status` enum('preparing','shipped','in_transit','delivered','cancelled') DEFAULT 'preparing',
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` varchar(36) NOT NULL,
	`trial_id` varchar(36) NOT NULL,
	`site_name` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`country` varchar(100) NOT NULL,
	`activation_date` date NOT NULL,
	`patient_capacity` int NOT NULL,
	`enrolled_patients` int DEFAULT 0,
	`samples_per_patient` int DEFAULT 1,
	`coordinator_name` varchar(255),
	`coordinator_email` varchar(255),
	`status` enum('pending','active','closed') DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trials` (
	`id` varchar(36) NOT NULL,
	`trial_name` varchar(255) NOT NULL,
	`trial_phase` enum('Phase I','Phase II','Phase III','Phase IV') NOT NULL,
	`status` enum('planning','active','completed','suspended') DEFAULT 'planning',
	`start_date` date NOT NULL,
	`end_date` date,
	`description` text,
	`sponsor` varchar(255),
	`protocol_number` varchar(100),
	`drug_name` varchar(255),
	`drug_dosage` varchar(100),
	`drug_administration_route` enum('oral','intravenous','subcutaneous','intramuscular','topical','inhalation'),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `demand_forecasts` ADD CONSTRAINT `demand_forecasts_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kit_usage` ADD CONSTRAINT `kit_usage_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kit_usage` ADD CONSTRAINT `kit_usage_kit_id_kits_id_fk` FOREIGN KEY (`kit_id`) REFERENCES `kits`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_kit_id_kits_id_fk` FOREIGN KEY (`kit_id`) REFERENCES `kits`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sites` ADD CONSTRAINT `sites_trial_id_trials_id_fk` FOREIGN KEY (`trial_id`) REFERENCES `trials`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `resolved_idx` ON `alerts` (`is_resolved`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `alerts` (`alert_type`);--> statement-breakpoint
CREATE INDEX `site_idx` ON `kit_usage` (`site_id`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `kit_usage` (`usage_date`);--> statement-breakpoint
CREATE INDEX `expiry_idx` ON `kits` (`expiry_date`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `kits` (`status`);--> statement-breakpoint
CREATE INDEX `site_idx` ON `shipments` (`site_id`);--> statement-breakpoint
CREATE INDEX `kit_idx` ON `shipments` (`kit_id`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `shipments` (`shipment_date`);--> statement-breakpoint
CREATE INDEX `trial_idx` ON `sites` (`trial_id`);