-- Run this in your Supabase SQL editor to create the match_confirmations table
CREATE TABLE IF NOT EXISTS match_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    sport VARCHAR(50) NOT NULL,
    confirmed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(profile_id, sport, confirmed_date)
);
