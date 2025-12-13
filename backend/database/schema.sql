/**
 * 🗄️ DATABASE SCHEMA SETUP
 * 
 * PostgreSQL schema for scan persistence
 * Supports complete scan lifecycle, retry tracking, and progress monitoring
 */

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 👥 USERS TABLE
-- Tracks user accounts and subscription plans
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    plan VARCHAR(20) NOT NULL DEFAULT 'FREE' CHECK (plan IN ('GUEST', 'FREE', 'PRO')),
    subscription_active BOOLEAN NOT NULL DEFAULT false,
    subscription_expires_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 📊 USAGE COUNTERS TABLE
-- Tracks daily usage per user/IP for plan enforcement
CREATE TABLE IF NOT EXISTS usage_counters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    scans_used INTEGER NOT NULL DEFAULT 0,
    retries_used INTEGER NOT NULL DEFAULT 0,
    downloads_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Ensure we have either user_id or ip_address for tracking
    CONSTRAINT usage_counters_identifier_check CHECK (
        (user_id IS NOT NULL) OR (ip_address IS NOT NULL)
    )
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- Indexes for usage counters (critical for performance)
CREATE INDEX IF NOT EXISTS idx_usage_counters_user_date ON usage_counters(user_id, date);
CREATE INDEX IF NOT EXISTS idx_usage_counters_ip_date ON usage_counters(ip_address, date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_counters_user_unique ON usage_counters(user_id, date) 
    WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_counters_ip_unique ON usage_counters(ip_address, date) 
    WHERE ip_address IS NOT NULL AND user_id IS NULL;

-- 1️⃣ SCANS TABLE
-- Main scan tracking with progress and lifecycle state
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'partial', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    progress_completed INTEGER NOT NULL DEFAULT 0,
    progress_total INTEGER NOT NULL DEFAULT 6, -- Six standard services
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for efficient scan lookups
CREATE INDEX IF NOT EXISTS idx_scans_id ON scans(id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);

-- 2️⃣ SCAN_SERVICES TABLE  
-- Individual service execution results with retry tracking
CREATE TABLE IF NOT EXISTS scan_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    service_name VARCHAR(50) NOT NULL CHECK (service_name IN ('accessibility', 'duplicateContent', 'backlinks', 'schema', 'multiLanguage', 'rankTracker')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'success', 'failed')),
    score INTEGER NULL CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
    data JSONB NULL,
    issues JSONB NULL DEFAULT '[]'::jsonb,
    error JSONB NULL,
    execution_time_ms INTEGER NULL,
    retry_attempts INTEGER NOT NULL DEFAULT 0,
    max_retry_attempts INTEGER NOT NULL DEFAULT 2,
    started_at TIMESTAMP WITH TIME ZONE NULL,
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for efficient service lookups
CREATE INDEX IF NOT EXISTS idx_scan_services_scan_id ON scan_services(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_services_status ON scan_services(status);
CREATE INDEX IF NOT EXISTS idx_scan_services_service_name ON scan_services(service_name);

-- Unique constraint to prevent duplicate services per scan
CREATE UNIQUE INDEX IF NOT EXISTS idx_scan_services_unique ON scan_services(scan_id, service_name);

-- 3️⃣ SCAN CACHE TABLE
-- Smart caching to reduce redundant scans and API costs
CREATE TABLE IF NOT EXISTS scan_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL UNIQUE, -- hash(normalized_url + enabled_services)
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for scan cache (critical for performance)
CREATE INDEX IF NOT EXISTS idx_scan_cache_key ON scan_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_scan_cache_expires ON scan_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_scan_cache_scan_id ON scan_cache(scan_id);

-- 4️⃣ SCAN METRICS TABLE
-- Observability & monitoring for scan-level analytics
CREATE TABLE IF NOT EXISTS scan_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('GUEST', 'FREE', 'PRO')),
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('GUEST', 'FREE', 'PRO')),
    url TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'partial', 'failed')),
    cached BOOLEAN NOT NULL DEFAULT false,
    total_execution_time_ms INTEGER NULL,
    services_executed INTEGER NOT NULL DEFAULT 0,
    services_failed INTEGER NOT NULL DEFAULT 0,
    cache_hit BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5️⃣ SERVICE METRICS TABLE  
-- Observability & monitoring for service-level analytics
CREATE TABLE IF NOT EXISTS service_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL,
    service_name VARCHAR(50) NOT NULL CHECK (service_name IN ('accessibility', 'duplicateContent', 'backlinks', 'schema', 'multiLanguage', 'rankTracker')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'success', 'failed')),
    execution_time_ms INTEGER NULL,
    retry_attempts INTEGER NOT NULL DEFAULT 0,
    error_code VARCHAR(50) NULL,
    error_message TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for scan metrics (critical for analytics)
CREATE INDEX IF NOT EXISTS idx_scan_metrics_scan_id ON scan_metrics(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_metrics_user_type ON scan_metrics(user_type);
CREATE INDEX IF NOT EXISTS idx_scan_metrics_status ON scan_metrics(status);
CREATE INDEX IF NOT EXISTS idx_scan_metrics_created_at ON scan_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_metrics_cached ON scan_metrics(cached);

-- Indexes for service metrics (critical for performance analysis)
CREATE INDEX IF NOT EXISTS idx_service_metrics_scan_id ON service_metrics(scan_id);
CREATE INDEX IF NOT EXISTS idx_service_metrics_service_name ON service_metrics(service_name);
CREATE INDEX IF NOT EXISTS idx_service_metrics_status ON service_metrics(status);
CREATE INDEX IF NOT EXISTS idx_service_metrics_created_at ON service_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_metrics_execution_time ON service_metrics(execution_time_ms);

-- 🔄 AUTOMATIC UPDATED_AT TRIGGER
-- Updates updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to both tables
DROP TRIGGER IF EXISTS update_scans_updated_at ON scans;
CREATE TRIGGER update_scans_updated_at 
    BEFORE UPDATE ON scans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scan_services_updated_at ON scan_services;
CREATE TRIGGER update_scan_services_updated_at 
    BEFORE UPDATE ON scan_services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 📊 PROGRESS CALCULATION FUNCTION
-- Automatically updates scan progress when services change
CREATE OR REPLACE FUNCTION update_scan_progress()
RETURNS TRIGGER AS $$
DECLARE
    completed_count INTEGER;
    total_count INTEGER;
    new_percentage INTEGER;
    new_status VARCHAR(20);
    success_count INTEGER;
BEGIN
    -- Count completed services (success + failed)
    SELECT COUNT(*)
    INTO completed_count
    FROM scan_services 
    WHERE scan_id = COALESCE(NEW.scan_id, OLD.scan_id) 
    AND status IN ('success', 'failed');
    
    -- Count total services
    SELECT COUNT(*)
    INTO total_count
    FROM scan_services 
    WHERE scan_id = COALESCE(NEW.scan_id, OLD.scan_id);
    
    -- Count successful services
    SELECT COUNT(*)
    INTO success_count
    FROM scan_services 
    WHERE scan_id = COALESCE(NEW.scan_id, OLD.scan_id) 
    AND status = 'success';
    
    -- Calculate percentage
    new_percentage = CASE 
        WHEN total_count > 0 THEN FLOOR((completed_count * 100.0) / total_count)
        ELSE 0 
    END;
    
    -- Determine scan status
    IF completed_count = total_count THEN
        -- All services complete, determine final status
        IF success_count = total_count THEN
            new_status = 'completed';
        ELSIF success_count > 0 THEN
            new_status = 'partial';
        ELSE
            new_status = 'failed';
        END IF;
        
        -- Set completed_at if not already set
        UPDATE scans 
        SET 
            progress_completed = completed_count,
            progress_percentage = new_percentage,
            status = new_status,
            completed_at = CASE 
                WHEN completed_at IS NULL THEN NOW() 
                ELSE completed_at 
            END
        WHERE id = COALESCE(NEW.scan_id, OLD.scan_id);
    ELSE
        -- Scan still in progress
        UPDATE scans 
        SET 
            progress_completed = completed_count,
            progress_percentage = new_percentage,
            status = CASE 
                WHEN completed_count > 0 THEN 'running'
                ELSE status 
            END
        WHERE id = COALESCE(NEW.scan_id, OLD.scan_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply progress trigger to scan_services
DROP TRIGGER IF EXISTS update_scan_progress_trigger ON scan_services;
CREATE TRIGGER update_scan_progress_trigger
    AFTER INSERT OR UPDATE OR DELETE ON scan_services
    FOR EACH ROW EXECUTE FUNCTION update_scan_progress();

-- 📋 SAMPLE DATA VIEWS (for monitoring)
-- View for scan overview
CREATE OR REPLACE VIEW scan_overview AS
SELECT 
    s.id,
    s.url,
    s.status,
    s.started_at,
    s.completed_at,
    s.progress_completed || '/' || s.progress_total AS progress,
    s.progress_percentage || '%' AS percentage,
    EXTRACT(EPOCH FROM (COALESCE(s.completed_at, NOW()) - s.started_at))::INTEGER AS duration_seconds
FROM scans s
ORDER BY s.created_at DESC;

-- View for service status summary
CREATE OR REPLACE VIEW service_status_summary AS
SELECT 
    ss.scan_id,
    s.url,
    ss.service_name,
    ss.status,
    ss.score,
    ss.retry_attempts,
    ss.execution_time_ms,
    ss.completed_at
FROM scan_services ss
JOIN scans s ON s.id = ss.scan_id
ORDER BY ss.scan_id, ss.service_name;