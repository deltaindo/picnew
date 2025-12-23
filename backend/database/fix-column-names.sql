-- Fix Column Names - Align with Backend Queries
-- Backend expects snake_case (created_at, updated_at) but Prisma created camelCase (createdAt, updatedAt)

DO $$ 
BEGIN
    RAISE NOTICE 'Fixing column names in users table...';
    
    -- Rename createdAt to created_at if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE users RENAME COLUMN "createdAt" TO created_at;
        RAISE NOTICE '✓ Renamed createdAt → created_at';
    ELSE
        RAISE NOTICE '✓ Column created_at already exists';
    END IF;
    
    -- Rename updatedAt to updated_at if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;
        RAISE NOTICE '✓ Renamed updatedAt → updated_at';
    ELSE
        RAISE NOTICE '✓ Column updated_at already exists';
    END IF;
    
    -- Add last_login column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'last_login'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
        RAISE NOTICE '✓ Added last_login column';
    ELSE
        RAISE NOTICE '✓ Column last_login already exists';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        UPDATE users SET status = 'active' WHERE status IS NULL;
        RAISE NOTICE '✓ Added status column';
    ELSE
        RAISE NOTICE '✓ Column status already exists';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Column names fixed successfully!';
    RAISE NOTICE '';
    
END $$;

-- Show final table structure
SELECT 
    'users' as table_name,
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Show all users
SELECT 
    id, 
    email, 
    name, 
    role,
    status,
    created_at,
    updated_at,
    last_login
FROM users;
