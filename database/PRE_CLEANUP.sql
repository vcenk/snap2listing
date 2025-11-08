-- ============================================================================
-- PRE-CLEANUP SCRIPT - Run this FIRST before FRESH_DATABASE_SCHEMA.sql
-- ============================================================================
-- This script safely drops all existing functions, triggers, and tables
-- Handles duplicate functions and other edge cases
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL TRIGGERS
-- ============================================================================

DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN
        SELECT tgname, relname
        FROM pg_trigger
        JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
        WHERE tgname LIKE 'on_auth%' OR tgname LIKE '%user%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I CASCADE',
                      trigger_record.tgname,
                      trigger_record.relname);
        RAISE NOTICE 'Dropped trigger: %.%', trigger_record.relname, trigger_record.tgname;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 2: DROP ALL CUSTOM FUNCTIONS (including duplicates)
-- ============================================================================

DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname IN (
            'deduct_credits',
            'is_trial_expired',
            'get_trial_days_remaining',
            'add_image_quota',
            'add_video_quota',
            'increment_usage',
            'can_generate_video',
            'increment_video_usage',
            'can_generate_image',
            'increment_image_usage',
            'handle_new_user',
            'get_user_stats',
            'reset_monthly_usage'
        )
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',
                      func_record.schema_name,
                      func_record.function_name,
                      func_record.args);
        RAISE NOTICE 'Dropped function: %.%(%)',
                     func_record.schema_name,
                     func_record.function_name,
                     func_record.args;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 3: DROP ALL TABLES IN CORRECT ORDER (reverse dependencies)
-- ============================================================================

-- Drop child tables first (those with foreign keys)
DROP TABLE IF EXISTS credit_usage_log CASCADE;
DROP TABLE IF EXISTS export_logs CASCADE;
DROP TABLE IF EXISTS listing_channels CASCADE;
DROP TABLE IF EXISTS listing_images CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS shops CASCADE;

-- Drop reference tables
DROP TABLE IF EXISTS channels CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS credit_costs CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS users CASCADE;

-- Drop unused/legacy tables (if they exist)
DROP TABLE IF EXISTS keywords CASCADE;
DROP TABLE IF EXISTS listing_versions CASCADE;
DROP TABLE IF EXISTS brand_kits CASCADE;
DROP TABLE IF EXISTS insight_reports CASCADE;
DROP TABLE IF EXISTS export_kits CASCADE;
DROP TABLE IF EXISTS export_items CASCADE;
DROP TABLE IF EXISTS listings_exports CASCADE;
DROP TABLE IF EXISTS ai_generation_history CASCADE;
DROP TABLE IF EXISTS usage_logs CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS designs CASCADE;

-- ============================================================================
-- STEP 4: VERIFY CLEANUP
-- ============================================================================

-- List remaining tables (should be empty or only system tables)
SELECT
    'Remaining tables:' as status,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- List remaining functions (should be empty)
SELECT
    'Remaining functions:' as status,
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY proname;

-- ============================================================================
-- PRE-CLEANUP COMPLETE
-- ============================================================================
-- Next: Run FRESH_DATABASE_SCHEMA.sql
-- ============================================================================
