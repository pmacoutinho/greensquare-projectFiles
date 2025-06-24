CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'sold', 'cancelled');
CREATE TYPE auction_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE buyers (
    id UUID DEFAULT uuid_generate_v4() NOT NULL,
    user_id UUID NOT NULL,
    company_name VARCHAR(100),
    industry_sector VARCHAR(100),
    annual_carbon_footprint DECIMAL(10,2),
    website VARCHAR(255),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE sellers (
    id UUID DEFAULT uuid_generate_v4() NOT NULL,
    user_id UUID NOT NULL,
    verification_status verification_status DEFAULT 'pending',
    verification_date TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE lands (
    id UUID DEFAULT uuid_generate_v4() NOT NULL,
    owner_id UUID NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    size_square_meters DECIMAL(12,2) NOT NULL,
    location VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    biome_type VARCHAR(50) NOT NULL,
    average_humidity DECIMAL(5,2),
    average_temperature DECIMAL(5,2),
    elevation_meters DECIMAL(7,2),
    forest_density_percentage DECIMAL(5,2),
    tree_species TEXT[],
    soil_type VARCHAR(50),
    certification_date DATE,
    certification_authority VARCHAR(100),
    verification_status verification_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (owner_id) REFERENCES sellers(id)
);

-- all credit inventory
CREATE TABLE carbon_credits (
    id UUID DEFAULT uuid_generate_v4() NOT NULL,
    land_id UUID NOT NULL,
    verification_id VARCHAR(100), -- NOT NULL,
    total_credits DECIMAL(12,2) NOT NULL,
    credits_available DECIMAL(12,2) NOT NULL,
    credits_sold DECIMAL(12,2) DEFAULT 0,
    vintage_year INT, -- NOT NULL,
    expiration_date DATE,
    verification_standard VARCHAR(50), -- NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (land_id) REFERENCES lands(id)
);
-- direct listings
CREATE TABLE credit_listings (
    id UUID DEFAULT uuid_generate_v4() NOT NULL,
    carbon_credits_id UUID NOT NULL,
    price_per_credit DECIMAL(10,2) NOT NULL,
    minimum_purchase DECIMAL(10,2) NOT NULL,
    maximum_purchase DECIMAL(10,2),
    status listing_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (carbon_credits_id) REFERENCES carbon_credits(id)
);
-- auction listings
CREATE TABLE credit_auctions (
    id UUID DEFAULT uuid_generate_v4() NOT NULL,
    carbon_credits_id UUID NOT NULL,
    starting_price DECIMAL(10,2) NOT NULL,
    reserve_price DECIMAL(10,2),
    min_increment DECIMAL(10,2) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status auction_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (carbon_credits_id) REFERENCES carbon_credits(id)
);

CREATE TABLE auction_bids (
    id UUID DEFAULT uuid_generate_v4() NOT NULL,
    auction_id UUID NOT NULL,
    bidder_id UUID NOT NULL,
    bid_amount DECIMAL(10,2) NOT NULL,
    bid_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (auction_id) REFERENCES credit_auctions(id),
    FOREIGN KEY (bidder_id) REFERENCES users(id)
);

CREATE TABLE purchases (
    id UUID DEFAULT uuid_generate_v4() NOT NULL,
    buyer_id UUID NOT NULL,
    carbon_credits_id UUID NOT NULL,
    auction_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    price_per_credit DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transaction_hash VARCHAR(255),
    PRIMARY KEY (id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (carbon_credits_id) REFERENCES carbon_credits(id),
    FOREIGN KEY (auction_id) REFERENCES credit_auctions(id)
);

CREATE TABLE credit_wallets (
    id UUID DEFAULT uuid_generate_v4() NOT NULL,
    owner_id UUID NOT NULL,
    purchase_id UUID NOT NULL,
    credits_remaining DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (purchase_id) REFERENCES purchases(id)
);

CREATE INDEX idx_land_owner ON lands(owner_id);
CREATE INDEX idx_carbon_credits_land ON carbon_credits(land_id);
CREATE INDEX idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX idx_credit_wallet_owner ON credit_wallets(owner_id);