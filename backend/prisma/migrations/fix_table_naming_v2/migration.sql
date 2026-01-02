-- Safe migration: Fix table naming from PascalCase to snake_case
-- This version handles cases where tables are already migrated

-- Step 1: Handle PIC table
DO $$ 
BEGIN
  -- If PIC exists (old style), rename to pic
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'PIC' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pic' AND table_schema = 'public') THEN
      ALTER TABLE "PIC" RENAME TO "pic";
    ELSE
      -- Both exist, drop old one
      DROP TABLE IF EXISTS "PIC" CASCADE;
    END IF;
  END IF;
END $$;

-- Step 2: Handle Marketing table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Marketing' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketing' AND table_schema = 'public') THEN
      ALTER TABLE "Marketing" RENAME TO "marketing";
    ELSE
      DROP TABLE IF EXISTS "Marketing" CASCADE;
    END IF;
  END IF;
END $$;

-- Step 3: Handle ProgramType table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ProgramType' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_type' AND table_schema = 'public') THEN
      ALTER TABLE "ProgramType" RENAME TO "program_type";
    ELSE
      DROP TABLE IF EXISTS "ProgramType" CASCADE;
    END IF;
  END IF;
END $$;

-- Step 4: Re-create foreign key constraints if they don't exist
DO $$
BEGIN
  -- Add PIC foreign key if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'registration_links_picId_fkey'
  ) THEN
    ALTER TABLE "registration_links" ADD CONSTRAINT "registration_links_picId_fkey" 
      FOREIGN KEY ("picId") REFERENCES "pic"(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  
  -- Add Marketing foreign key if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'registration_links_marketingId_fkey'
  ) THEN
    ALTER TABLE "registration_links" ADD CONSTRAINT "registration_links_marketingId_fkey" 
      FOREIGN KEY ("marketingId") REFERENCES "marketing"(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  
  -- Add ProgramType foreign key if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'registration_links_programTypeId_fkey'
  ) THEN
    ALTER TABLE "registration_links" ADD CONSTRAINT "registration_links_programTypeId_fkey" 
      FOREIGN KEY ("programTypeId") REFERENCES "program_type"(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
