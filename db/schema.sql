-- ==============================================================================
-- JOOKOLANTE - ARCHITECTURE OFFICIELLE DE BASE DE DONNÉES (POSTGRESQL / CLOUD SQL)
-- ==============================================================================
-- Ce fichier contient le schéma SQL complet prêt à être exécuté sur :
-- 1. Google Cloud SQL (PostgreSQL)
-- 2. Supabase (PostgreSQL avec Auth & Realtime)
-- 3. Neon ou PostgreSQL hébergé
-- ==============================================================================

-- Activation de l'extension pgcrypto pour les UUID et le hachage
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABLE DES MEMBRES DE L'ASSOCIATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricule VARCHAR(30) UNIQUE NOT NULL,               -- Ex: "JK-2026-001"
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,                  -- Format international E.164 (+221...)
    email VARCHAR(150) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'Membre Actif',
    avatar_url TEXT,
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    address TEXT,
    city VARCHAR(100) NOT NULL DEFAULT 'Dakar',
    monthly_pledge NUMERIC(12, 2) NOT NULL DEFAULT 10000.00,
    blood_group VARCHAR(5),                             -- 'O+', 'A+', 'B+', etc.
    emergency_contact VARCHAR(150),
    national_id VARCHAR(50),                            -- Numéro CNI / Passeport
    pin_hash VARCHAR(255) NOT NULL,                     -- Haché avec bcrypt (coût 12)
    failed_attempts INT NOT NULL DEFAULT 0,              -- Anti-brute force rate limiting
    locked_until TIMESTAMP WITH TIME ZONE,              -- Blocage temporaire
    status VARCHAR(20) NOT NULL DEFAULT 'active',        -- 'active', 'suspended', 'honorary'
    occupation VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. TABLE DES COTISATIONS & PAIEMENTS (AVEC CONTRAINTES ANTI-FRAUDE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,         -- Séquence atomique Ex: "REC-2026-101"
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INT NOT NULL CHECK (period_year >= 2020),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    payment_method VARCHAR(30) NOT NULL,                -- 'Wave', 'Orange Money', 'Espèces', 'Virement'
    transaction_ref VARCHAR(100) UNIQUE,                -- RÈGLE ANTI-REPLAY : Unicité de la référence Wave/OM
    verification_hash VARCHAR(64) NOT NULL,             -- Sceau cryptographique du reçu
    recorded_by VARCHAR(100) NOT NULL,
    type VARCHAR(40) NOT NULL DEFAULT 'cotisation_mensuelle',
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- CONTRAINTE CRITIQUE ANTI-DOUBLON :
    -- Empêche qu'un membre paie deux fois par erreur la cotisation ordinaire du même mois
    CONSTRAINT unique_member_month_cotisation UNIQUE (member_id, period_month, period_year, type)
);

-- ------------------------------------------------------------------------------
-- 3. TABLE DES DÉCAISSEMENTS & AIDES DE SOLIDARITÉ
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses_and_aid (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(60) NOT NULL,                      -- 'Secours & Urgence', 'Solidarité Familiale', etc.
    beneficiary VARCHAR(150) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    approved_by VARCHAR(100) NOT NULL,                  -- Signature 1 (Trésorier)
    second_approved_by VARCHAR(100),                    -- Signature 2 obligatoire pour montants > 25.000 FCFA
    status VARCHAR(20) NOT NULL DEFAULT 'validé',       -- 'validé', 'en_attente', 'rejeté'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. TABLE IMMUABLE D'AUDIT COMPTABLE (AUDIT TRAIL SÉCURISÉ)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    actor_name VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,                        -- 'ENCAISSEMENT', 'ANNULATION', 'DECAISSEMENT'
    details TEXT NOT NULL,
    amount NUMERIC(12, 2),
    receipt_number VARCHAR(50),
    ip_address INET
);

-- ------------------------------------------------------------------------------
-- 5. TABLE DES MESSAGES & SONDAGES DU SALON
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS discussion_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    channel VARCHAR(30) NOT NULL DEFAULT 'general',     -- 'general', 'bureau', 'urgences', 'reunions'
    content TEXT NOT NULL,
    is_official BOOLEAN DEFAULT FALSE,
    poll_data JSONB,                                    -- Données du sondage et votes
    reactions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- INDEXATION POUR PERFORMANCES OPTIMALES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_contrib_member ON contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_contrib_period ON contributions(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
CREATE INDEX IF NOT EXISTS idx_members_matricule ON members(matricule);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
