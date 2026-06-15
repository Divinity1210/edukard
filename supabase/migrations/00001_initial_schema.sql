-- Enum Types
CREATE TYPE user_role AS ENUM ('student', 'investor', 'admin', 'university', 'agent');
CREATE TYPE kyc_status AS ENUM ('not_started', 'pending', 'approved', 'rejected');
CREATE TYPE loan_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'disbursing', 'disbursed', 'repaying', 'paid_off', 'defaulted', 'rejected');
CREATE TYPE payment_status AS ENUM ('scheduled', 'processing', 'completed', 'failed', 'late');
CREATE TYPE risk_flag AS ENUM ('green', 'yellow', 'red');
CREATE TYPE tranche_type AS ENUM ('senior', 'junior');
CREATE TYPE investment_status AS ENUM ('active', 'withdrawn', 'matured');
CREATE TYPE investor_entity_type AS ENUM ('individual', 'corporation', 'fund', 'trust');
CREATE TYPE deposit_status AS ENUM ('pending', 'processing', 'confirmed', 'failed');

-- Profiles Table (Extends Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    kyc_status kyc_status NOT NULL DEFAULT 'not_started',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to create profile on signup
-- SECURITY DEFINER trigger that mirrors each new auth.users row into profiles.
-- IMPORTANT: GoTrue inserts as the `supabase_auth_admin` role, whose search_path
-- does NOT include `public`. Without an explicit `SET search_path = public`, the
-- unqualified `user_role` cast cannot be resolved and the whole INSERT fails with
-- "Database error creating new user" — which silently breaks EVERY signup. Pin
-- the search_path and schema-qualify the enum so the trigger is role-agnostic.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'student')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Universities
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    dli_number TEXT UNIQUE NOT NULL,
    province TEXT NOT NULL,
    city TEXT NOT NULL,
    settlement_account TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Assessments
CREATE TABLE credit_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    monthly_income NUMERIC NOT NULL,
    dti_ratio NUMERIC NOT NULL,
    edukard_score INTEGER NOT NULL,
    approved_limit NUMERIC NOT NULL,
    employment_months INTEGER NOT NULL,
    risk_flag risk_flag NOT NULL,
    denial_reason TEXT,
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Profiles
CREATE TABLE agent_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    territory TEXT NOT NULL,
    commission_rate NUMERIC DEFAULT 0.10,
    referral_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan Applications
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES universities(id),
    student_id_number TEXT NOT NULL,
    tuition_amount NUMERIC NOT NULL,
    loan_amount NUMERIC NOT NULL,
    apr NUMERIC NOT NULL,
    term_months INTEGER NOT NULL,
    monthly_payment NUMERIC NOT NULL,
    total_cost NUMERIC NOT NULL,
    status loan_status NOT NULL DEFAULT 'draft',
    risk_flag risk_flag NOT NULL,
    admin_notes TEXT,
    invoice_url TEXT,
    referral_agent_id UUID REFERENCES agent_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repayment Schedules
CREATE TABLE repayment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    payment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    principal NUMERIC NOT NULL,
    interest NUMERIC NOT NULL,
    total_payment NUMERIC NOT NULL,
    remaining_balance NUMERIC NOT NULL,
    status payment_status NOT NULL DEFAULT 'scheduled',
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Investor Profiles
CREATE TABLE investor_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    entity_type investor_entity_type NOT NULL DEFAULT 'individual',
    total_invested NUMERIC DEFAULT 0,
    total_yield_earned NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Liquidity Pools
CREATE TABLE liquidity_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tranche tranche_type NOT NULL UNIQUE,
    total_capital NUMERIC DEFAULT 0,
    deployed_capital NUMERIC DEFAULT 0,
    available_capital NUMERIC DEFAULT 0,
    utilization_ratio NUMERIC DEFAULT 0,
    target_apy NUMERIC NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,
    tranche tranche_type NOT NULL REFERENCES liquidity_pools(tranche),
    principal NUMERIC NOT NULL,
    accrued_yield NUMERIC DEFAULT 0,
    target_apy NUMERIC NOT NULL,
    status investment_status NOT NULL DEFAULT 'active',
    invested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- University Invoices
CREATE TABLE university_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    student_id_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    program_name TEXT NOT NULL,
    term TEXT NOT NULL,
    tuition_amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'unmatched',
    edukard_loan_id UUID REFERENCES loan_applications(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- University Settlements
CREATE TABLE university_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'CAD',
    transaction_hash TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    student_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Referrals
CREATE TABLE agent_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agent_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id),
    university_target TEXT NOT NULL,
    loan_status loan_status NOT NULL,
    loan_amount NUMERIC,
    commission_earned NUMERIC DEFAULT 0,
    commission_status TEXT NOT NULL DEFAULT 'pending',
    referred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidity_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_referrals ENABLE ROW LEVEL SECURITY;

-- Basic Policies (To be expanded based on exact business logic)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Universities are viewable by everyone." ON universities FOR SELECT USING (true);

CREATE POLICY "Students can view their own loan applications." ON loan_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can insert their own loan applications." ON loan_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can view their own repayment schedules." ON repayment_schedules FOR SELECT USING (
    loan_id IN (SELECT id FROM loan_applications WHERE user_id = auth.uid())
);

CREATE POLICY "Investors can view their own investments." ON investments FOR SELECT USING (auth.uid() = investor_id);
