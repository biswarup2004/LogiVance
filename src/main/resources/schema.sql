-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS location_updates CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_role CHECK (role IN ('SHIPPER', 'CARRIER', 'CUSTOMER', 'ADMIN'))
);

-- Create shipments table
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipper_id UUID NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    weight_kg DECIMAL(10, 2) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'POSTED',
    awarded_bid_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipper FOREIGN KEY (shipper_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (status IN ('POSTED', 'AWAITING_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'))
);

-- Create bids table
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL,
    carrier_id UUID NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    note TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    CONSTRAINT fk_carrier FOREIGN KEY (carrier_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_bid_status CHECK (status IN ('PENDING', 'AWARDED', 'REJECTED'))
);

-- Create location_updates table
CREATE TABLE location_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_location_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

-- Add foreign key constraint for awarded_bid_id (must be added after bids table exists)
ALTER TABLE shipments
ADD CONSTRAINT fk_awarded_bid FOREIGN KEY (awarded_bid_id) REFERENCES bids(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_shipments_shipper_id ON shipments(shipper_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_awarded_bid_id ON shipments(awarded_bid_id);
CREATE INDEX idx_shipments_created_at ON shipments(created_at);

CREATE INDEX idx_bids_shipment_id ON bids(shipment_id);
CREATE INDEX idx_bids_carrier_id ON bids(carrier_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_submitted_at ON bids(submitted_at);

CREATE INDEX idx_location_updates_shipment_id ON location_updates(shipment_id);
CREATE INDEX idx_location_updates_timestamp ON location_updates(timestamp);