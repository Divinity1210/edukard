-- Migration 00002: API Integrations

-- Add API Metadata to Profiles (Sumsub, Stripe)
ALTER TABLE profiles 
ADD COLUMN sumsub_applicant_id TEXT UNIQUE,
ADD COLUMN stripe_customer_id TEXT UNIQUE;

-- Add API Metadata to Repayment Schedules (Stripe)
ALTER TABLE repayment_schedules
ADD COLUMN stripe_payment_intent_id TEXT UNIQUE,
ADD COLUMN stripe_invoice_id TEXT UNIQUE;

-- Add API Metadata to Universities (Stripe, Circle)
ALTER TABLE universities
ADD COLUMN stripe_account_id TEXT UNIQUE,
ADD COLUMN circle_wallet_id TEXT UNIQUE;

-- Add API Metadata to Investor Profiles (Circle)
ALTER TABLE investor_profiles
ADD COLUMN circle_wallet_id TEXT UNIQUE;

-- Add Plaid Items table
CREATE TABLE plaid_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_id TEXT UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    institution_id TEXT,
    institution_name TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security for Plaid Items
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own plaid items." ON plaid_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plaid items." ON plaid_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plaid items." ON plaid_items FOR UPDATE USING (auth.uid() = user_id);

-- Update loan applications with Circle metadata
ALTER TABLE loan_applications
ADD COLUMN circle_transfer_id TEXT UNIQUE;
