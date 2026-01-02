-- Step 1: Backup PascalCase data to temporary tables
CREATE TABLE IF NOT EXISTS "pic_backup" AS SELECT * FROM "PIC";
CREATE TABLE IF NOT EXISTS "marketing_backup" AS SELECT * FROM "Marketing";
CREATE TABLE IF NOT EXISTS "program_type_backup" AS SELECT * FROM "ProgramType";

-- Step 2: Drop constraints that reference the old tables
ALTER TABLE "registration_links" DROP CONSTRAINT IF EXISTS "registration_links_picId_fkey";
ALTER TABLE "registration_links" DROP CONSTRAINT IF EXISTS "registration_links_marketingId_fkey";
ALTER TABLE "registration_links" DROP CONSTRAINT IF EXISTS "registration_links_programTypeId_fkey";

-- Step 3: Rename PascalCase tables to snake_case (only if they exist and are different)
DO $$ 
BEGIN
  -- Rename PIC table if it exists and pic doesn't
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'PIC') AND
     NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pic') THEN
    ALTER TABLE "PIC" RENAME TO "pic";
  END IF;
  
  -- Rename Marketing table if it exists and marketing doesn't
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Marketing') AND
     NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketing') THEN
    ALTER TABLE "Marketing" RENAME TO "marketing";
  END IF;
  
  -- Rename ProgramType table if it exists and program_type doesn't
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ProgramType') AND
     NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'program_type') THEN
    ALTER TABLE "ProgramType" RENAME TO "program_type";
  END IF;
END $$;

-- Step 4: Re-create foreign key constraints
ALTER TABLE "registration_links" ADD CONSTRAINT "registration_links_picId_fkey" FOREIGN KEY ("picId") REFERENCES "pic"(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "registration_links" ADD CONSTRAINT "registration_links_marketingId_fkey" FOREIGN KEY ("marketingId") REFERENCES "marketing"(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "registration_links" ADD CONSTRAINT "registration_links_programTypeId_fkey" FOREIGN KEY ("programTypeId") REFERENCES "program_type"(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 5: Drop backup tables
DROP TABLE IF EXISTS "pic_backup";
DROP TABLE IF EXISTS "marketing_backup";
DROP TABLE IF EXISTS "program_type_backup";

-- Step 6: Verify the schema
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
