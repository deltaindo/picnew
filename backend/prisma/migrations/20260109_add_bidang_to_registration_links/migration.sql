-- Add bidang_id column to registration_links table
ALTER TABLE "registration_links" ADD COLUMN "bidang_id" INTEGER NOT NULL DEFAULT 1;

-- Add foreign key constraint
ALTER TABLE "registration_links" ADD CONSTRAINT "registration_links_bidang_id_fkey" FOREIGN KEY ("bidang_id") REFERENCES "bidangs"("id") ON DELETE CASCADE;

-- Create index for bidang_id
CREATE INDEX "registration_links_bidang_id_idx" ON "registration_links"("bidang_id");
