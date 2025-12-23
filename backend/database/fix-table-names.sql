-- Fix Table Names - Normalize to Lowercase
-- This script handles the case where tables were created with uppercase names
-- PostgreSQL is case-sensitive with quoted identifiers, but defaults to lowercase

-- Drop uppercase "User" table if it exists and migrate to lowercase "users"
DO $$ 
BEGIN
    -- Check if uppercase "User" table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
    ) THEN
        RAISE NOTICE '✓ Found uppercase "User" table, migrating to lowercase "users"...';
        
        -- Create lowercase users table if not exists
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'admin',
            phone VARCHAR(50),
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        );
        
        -- Copy data from "User" to users (if users table is empty)
        INSERT INTO users (id, name, email, password, role, phone, status, created_at, updated_at, last_login)
        SELECT 
            "id", 
            "name", 
            "email", 
            "password", 
            COALESCE("role", 'admin'),
            "phone",
            COALESCE("status", 'active'),
            COALESCE("createdAt", CURRENT_TIMESTAMP),
            COALESCE("updatedAt", CURRENT_TIMESTAMP),
            NULL
        FROM "User"
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.email = "User"."email")
        ON CONFLICT (email) DO NOTHING;
        
        -- Get the max id from both tables to set the sequence correctly
        PERFORM setval('users_id_seq', 
            COALESCE((SELECT MAX(id) FROM users), 0) + 1, 
            false
        );
        
        -- Drop the old "User" table
        DROP TABLE IF EXISTS "User" CASCADE;
        
        RAISE NOTICE '✓ Successfully migrated "User" → users';
    ELSE
        RAISE NOTICE '✓ Table "User" does not exist (this is correct)';
    END IF;
    
    -- Ensure lowercase users table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) THEN
        RAISE NOTICE '! Creating lowercase "users" table...';
        
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'admin',
            phone VARCHAR(50),
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        );
        
        RAISE NOTICE '✓ Created lowercase "users" table';
    ELSE
        RAISE NOTICE '✓ Lowercase "users" table already exists';
    END IF;
    
END $$;

-- Verify the table structure
SELECT 
    'users' as table_name,
    COUNT(*) as record_count
FROM users;

-- Show table structure
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;
