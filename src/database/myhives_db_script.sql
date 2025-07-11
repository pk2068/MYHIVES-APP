-- Enable the pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table for Users
-- Stores user authentication details, supporting traditional, Google, and LinkedIn logins.
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Storing hashed password for traditional login
    email VARCHAR(255) UNIQUE NOT NULL,
    google_id VARCHAR(255) UNIQUE, -- Google OAuth ID
    linkedin_id VARCHAR(255) UNIQUE, -- LinkedIn OAuth ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on commonly searched authentication fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_linkedin_id ON users(linkedin_id);


-- Table for Beehive Locations/Stands
-- Stores information about where beekeepers manage their hives.
CREATE TABLE locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Link to the owner
    name VARCHAR(255) NOT NULL, -- Name of the location (e.g., "Backyard Apiary", "Field A")
    address VARCHAR(500), -- Optional: physical address
    latitude NUMERIC(9,6), -- Latitude for map display
    longitude NUMERIC(9,6), -- Longitude for map display
    country VARCHAR(100), -- Country for potential regional filtering/map views
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UQ_LocationName_User UNIQUE (user_id, name) -- Location names must be unique per user
);

-- Indexes for location data
CREATE INDEX idx_locations_user_id ON locations(user_id);
CREATE INDEX idx_locations_lat_lon ON locations(latitude, longitude);


-- Table for Individual Beehives
-- Represents a specific beehive within a location, allowing tracking of its history.
CREATE TABLE hives (
    hive_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE, -- Link to its physical location
    hive_name VARCHAR(255) NOT NULL, -- Unique name/identifier for the hive within its location (e.g., "Hive 1", "Blue Box")
    description TEXT, -- General description of the hive
    is_active BOOLEAN DEFAULT TRUE, -- Flag if the hive is currently active at this location
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UQ_HiveName_Location UNIQUE (location_id, hive_name) -- Hive names must be unique within a location
);

-- Index for hive data
CREATE INDEX idx_hives_location_id ON hives(location_id);


-- Lookup Table: Colony Health Statuses
-- Predefined options for colony health (e.g., thriving, weak, failing)
CREATE TABLE colony_health_statuses (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) UNIQUE NOT NULL
);

-- Populate lookup table
INSERT INTO colony_health_statuses (status_name) VALUES
('Thriving'),
('Weak'),
('Failing'),
('Unknown');


-- Lookup Table: Queen Statuses
-- Predefined options for queen status (e.g., seen, not seen, laying well)
CREATE TABLE queen_statuses (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) UNIQUE NOT NULL
);

-- Populate lookup table
INSERT INTO queen_statuses (status_name) VALUES
('Seen'),
('Not Seen'),
('Laying Well'),
('Queen Cells Present'),
('Superseded'),
('Absent'),
('Virgin'),
('Unknown');


-- Lookup Table: Varroa Treatments
-- Predefined options for varroa treatments (e.g., Formic acid, Oxalic acid, None)
CREATE TABLE varroa_treatments (
    treatment_id SERIAL PRIMARY KEY,
    treatment_name VARCHAR(100) UNIQUE NOT NULL
);

-- Populate lookup table
INSERT INTO varroa_treatments (treatment_name) VALUES
('Formic Acid'),
('Oxalic Acid'),
('Apivar'),
('Api Life Var'),
('Mite Away Quick Strips'),
('None'),
('Other');


-- Lookup Table: Queen Cell Statuses
-- Predefined options for queen cell status (e.g., open, closed)
CREATE TABLE queen_cell_statuses (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) UNIQUE NOT NULL
);

-- Populate lookup table
INSERT INTO queen_cell_statuses (status_name) VALUES
('Open'),
('Closed'),
('Hatched'),
('Destroyed'),
('Emerging'),
('Unknown');


-- Table for Major Inspections
-- Represents a single visit to a location where one or more hives were inspected.
CREATE TABLE major_inspections (
    major_inspection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    inspection_date DATE NOT NULL,
    general_notes TEXT, -- General notes for the entire location visit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UQ_MajorInspection_LocationDate UNIQUE (location_id, inspection_date)
);

-- Index for major inspections
CREATE INDEX idx_major_inspections_location_date ON major_inspections(location_id, inspection_date);


-- Table for Individual Hive Inspections
-- Detailed records for each specific hive inspection within a major inspection.
CREATE TABLE hive_inspections (
    hive_inspection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    major_inspection_id UUID NOT NULL REFERENCES major_inspections(major_inspection_id) ON DELETE CASCADE,
    hive_id UUID NOT NULL REFERENCES hives(hive_id) ON DELETE CASCADE,
    inspection_time TIME WITHOUT TIME ZONE NOT NULL, -- Hour of inspection specific to this hive
    
    -- Colony Health
    colony_health_status_id INTEGER NOT NULL REFERENCES colony_health_statuses(status_id),
    num_chambers INTEGER NOT NULL, -- Number of hive boxes/chambers
    
    -- Brood details (allowing for either count or percentage, or both)
    brood_frames_count INTEGER, -- Number of frames with brood
    brood_percentage NUMERIC(5,2), -- Percentage of brood (e.g., 75.00 for 75%)
    
    -- Queen Status
    queen_status_id INTEGER NOT NULL REFERENCES queen_statuses(status_id),
    
    -- Honey and Drone Comb
    approx_honey_weight_kg NUMERIC(8,2), -- Approximate amount of honey in kg
    drone_comb_frames_count INTEGER, -- Number of frames with drone comb
    drone_comb_percentage NUMERIC(5,2), -- Percentage of drone comb
    
    -- Feeding and Configuration
    sugar_feed_added BOOLEAN NOT NULL DEFAULT FALSE,
    sugar_feed_quantity_kg NUMERIC(8,2), -- Quantity of sugar feed added in kg
    brood_chambers_count INTEGER NOT NULL,
    supers_count INTEGER NOT NULL,
    queen_excluder_present BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Varroa Mites
    num_varroa_mites_found INTEGER,
    varroa_treatment_id INTEGER REFERENCES varroa_treatments(treatment_id),
    varroa_treatment_dosage VARCHAR(255), -- Dosage/amount (e.g., "5ml", "2 strips")
    
    -- Queen Rearing
    raising_new_queen BOOLEAN NOT NULL DEFAULT FALSE,
    queen_cell_age_days INTEGER, -- Age in days, if known
    queen_cell_status_id INTEGER REFERENCES queen_cell_statuses(status_id),
    
    other_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- A specific hive should only be inspected once per major inspection event
    CONSTRAINT UQ_HiveInspection_MajorHive UNIQUE (major_inspection_id, hive_id)
);

-- Indexes for hive inspections
CREATE INDEX idx_hive_inspections_major_id ON hive_inspections(major_inspection_id);
CREATE INDEX idx_hive_inspections_hive_id ON hive_inspections(hive_id);


-- Function to update the `updated_at` column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update `updated_at` on row modification
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hives_updated_at
BEFORE UPDATE ON hives
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_major_inspections_updated_at
BEFORE UPDATE ON major_inspections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hive_inspections_updated_at
BEFORE UPDATE ON hive_inspections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
