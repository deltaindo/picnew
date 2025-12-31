-- ============================================================================
-- PicNew - Database Duplicate Table Cleanup Script
-- ============================================================================
-- 
-- This script removes duplicate snake_case table definitions that conflict
-- with Prisma's PascalCase naming convention.
--
-- IMPORTANT: This script assumes your actual data is in the PascalCase tables.
-- If your data is in lowercase tables, run the migration script instead!
--
-- ============================================================================

-- Step 1: Verify current state
echo "Step 1: Current database state"
echo "================================"
\echo 'Tables starting with PIC/pic:'
\dt "pic*"

\echo 'Tables starting with Marketing/marketing:'
\dt "marketing*"

\echo 'Tables starting with ProgramType/program:'
\dt "program*"

-- Step 2: Check data distribution
echo "Step 2: Data distribution check"
echo "================================"

SELECT 'PIC (PascalCase)' as table_name, COUNT(*) as record_count 
FROM \"PIC\" 
UNION ALL
SELECT 'pic (snake_case)' as table_name, COUNT(*) as record_count 
FROM \"pic\"
ORDER BY record_count DESC;

SELECT 'Marketing (PascalCase)' as table_name, COUNT(*) as record_count 
FROM \"Marketing\" 
UNION ALL
SELECT 'marketing (snake_case)' as table_name, COUNT(*) as record_count 
FROM \"marketing\"
ORDER BY record_count DESC;

SELECT 'ProgramType (PascalCase)' as table_name, COUNT(*) as record_count 
FROM \"ProgramType\" 
UNION ALL
SELECT 'program_type (snake_case)' as table_name, COUNT(*) as record_count 
FROM \"program_type\"
ORDER BY record_count DESC;

-- Step 3: Drop snake_case duplicates
echo "Step 3: Removing duplicate snake_case tables"
echo "============================================="

-- Drop foreign key constraints first (if any)
DROP TABLE IF EXISTS \"pic\" CASCADE;
DROP TABLE IF EXISTS \"marketing\" CASCADE;
DROP TABLE IF EXISTS \"program_type\" CASCADE;

-- Step 4: Verify cleanup
echo "Step 4: Verification"
echo "===================="

\echo 'Remaining PIC/pic tables:'
\dt \"pic*\"

\echo 'Remaining Marketing/marketing tables:'
\dt \"marketing*\"

\echo 'Remaining ProgramType/program tables:'
\dt \"program*\"

\echo 'Final record counts:'
SELECT 'PIC' as table_name, COUNT(*) as count FROM \"PIC\"
UNION ALL
SELECT 'Marketing' as table_name, COUNT(*) as count FROM \"Marketing\"
UNION ALL
SELECT 'ProgramType' as table_name, COUNT(*) as count FROM \"ProgramType\";

-- Step 5: Done!
echo "Step 5: Cleanup Complete!"
echo "========================="
echo "✓ Duplicate tables removed"
echo "✓ Database structure is clean"
echo "✓ Ready for API queries"
