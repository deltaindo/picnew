-- Add lastLogin column to users table if it doesn't exist
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3);

-- Verify the column was created
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'lastLogin';
