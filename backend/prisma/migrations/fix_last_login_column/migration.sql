-- Drop incorrect column if it exists
ALTER TABLE "users" DROP COLUMN IF EXISTS "lastLogin";

-- Add correct column
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP(3);
