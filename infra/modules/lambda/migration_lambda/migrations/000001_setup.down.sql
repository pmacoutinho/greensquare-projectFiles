DROP INDEX IF EXISTS idx_credit_wallet_owner;
DROP INDEX IF EXISTS idx_purchases_buyer;
DROP INDEX IF EXISTS idx_carbon_credits_land;
DROP INDEX IF EXISTS idx_land_owner;

DROP TABLE IF EXISTS credit_wallets;
DROP TABLE IF EXISTS auction_bids;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS credit_auctions;
DROP TABLE IF EXISTS credit_listings;
DROP TABLE IF EXISTS carbon_credits;
DROP TABLE IF EXISTS lands;
DROP TABLE IF EXISTS sellers;
DROP TABLE IF EXISTS buyers;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS verification_status;
DROP TYPE IF EXISTS auction_status;
DROP TYPE IF EXISTS listing_status;
DROP TYPE IF EXISTS u_type;
DROP EXTENSION IF EXISTS "uuid-ossp";