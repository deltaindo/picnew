-- CreateTable PIC
CREATE TABLE "pic" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for PIC
CREATE UNIQUE INDEX "pic_name_key" ON "pic"("name");
CREATE INDEX "pic_name_idx" ON "pic"("name");

-- CreateTable Marketing
CREATE TABLE "marketing" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for Marketing
CREATE UNIQUE INDEX "marketing_name_key" ON "marketing"("name");

-- CreateTable ProgramType
CREATE TABLE "program_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for ProgramType
CREATE UNIQUE INDEX "program_type_name_key" ON "program_type"("name");

-- Add foreign key constraints to registration_links
ALTER TABLE "registration_links" ADD CONSTRAINT "registration_links_picId_fkey" FOREIGN KEY ("picId") REFERENCES "pic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "registration_links" ADD CONSTRAINT "registration_links_marketingId_fkey" FOREIGN KEY ("marketingId") REFERENCES "marketing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "registration_links" ADD CONSTRAINT "registration_links_programTypeId_fkey" FOREIGN KEY ("programTypeId") REFERENCES "program_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
