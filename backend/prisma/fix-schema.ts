import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Automatic schema repair script
 * Runs BEFORE seeding to fix any schema mismatches
 * Converts old personnel_type_id column to bidang_id if needed
 */
async function fixSchema() {
  console.log('🔧 Starting automatic schema repair...');
  
  try {
    // Check if column exists in database
    const result = await prisma.$queryRaw<Array<{ column_name: string }>>(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'registration_links' 
      AND column_name IN ('personnel_type_id', 'bidang_id')
    `);

    const hasPersonnelTypeId = result.some(col => col.column_name === 'personnel_type_id');
    const hasBidangId = result.some(col => col.column_name === 'bidang_id');

    console.log('📊 Current schema state:');
    console.log(`   - personnel_type_id column: ${hasPersonnelTypeId ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`   - bidang_id column: ${hasBidangId ? '✅ EXISTS' : '❌ MISSING'}`);

    // Fix 1: If old column exists but new one doesn't, rename it
    if (hasPersonnelTypeId && !hasBidangId) {
      console.log('\n🔄 Fixing schema: Renaming personnel_type_id → bidang_id...');
      
      try {
        // First, drop the foreign key constraint if it exists
        await prisma.$executeRawUnsafe(`
          ALTER TABLE registration_links 
          DROP CONSTRAINT IF EXISTS registration_links_personnel_type_id_fkey
        `);
        console.log('   ✅ Dropped old foreign key');
      } catch (e) {
        console.log('   ℹ️ No old foreign key to drop (OK)');
      }

      try {
        // Rename the column
        await prisma.$executeRawUnsafe(`
          ALTER TABLE registration_links 
          RENAME COLUMN personnel_type_id TO bidang_id
        `);
        console.log('   ✅ Column renamed');
      } catch (e) {
        console.log('   ℹ️ Column rename might have already happened (OK)');
      }
    }

    // Fix 2: If new column doesn't exist, create it
    if (!hasBidangId) {
      console.log('\n🔧 Creating bidang_id column...');
      
      try {
        // Add the column if it doesn't exist
        await prisma.$executeRawUnsafe(`
          ALTER TABLE registration_links 
          ADD COLUMN IF NOT EXISTS bidang_id INTEGER NOT NULL DEFAULT 1
        `);
        console.log('   ✅ bidang_id column created');

        // Add the foreign key constraint
        await prisma.$executeRawUnsafe(`
          ALTER TABLE registration_links 
          ADD CONSTRAINT registration_links_bidang_id_fkey 
          FOREIGN KEY (bidang_id) REFERENCES bidangs(id) ON DELETE CASCADE
        `);
        console.log('   ✅ Foreign key constraint added');
      } catch (e: any) {
        if (e.message.includes('already exists')) {
          console.log('   ℹ️ Column already exists (OK)');
        } else {
          console.error('   ❌ Error adding column:', e.message);
          throw e;
        }
      }
    }

    // Fix 3: Add index if missing
    try {
      const indexCheck = await prisma.$queryRaw<Array<{ indexname: string }>>(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'registration_links' 
        AND indexname LIKE '%bidang_id%'
      `);

      if (!indexCheck || indexCheck.length === 0) {
        console.log('\n📑 Adding index for bidang_id...');
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS registration_links_bidang_id_idx 
          ON registration_links(bidang_id)
        `);
        console.log('   ✅ Index created');
      }
    } catch (e) {
      console.log('   ℹ️ Index might already exist (OK)');
    }

    // Verify final schema
    const finalResult = await prisma.$queryRaw<Array<{ column_name: string }>>(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'registration_links' 
      AND column_name IN ('personnel_type_id', 'bidang_id')
    `);

    const finalHasPersonnelTypeId = finalResult.some(col => col.column_name === 'personnel_type_id');
    const finalHasBidangId = finalResult.some(col => col.column_name === 'bidang_id');

    console.log('\n✅ Final schema state:');
    console.log(`   - personnel_type_id column: ${finalHasPersonnelTypeId ? '⚠️  STILL EXISTS' : '✅ REMOVED'}`);
    console.log(`   - bidang_id column: ${finalHasBidangId ? '✅ EXISTS' : '❌ MISSING'}`);

    if (!finalHasBidangId) {
      throw new Error('❌ Schema repair failed: bidang_id column still missing!');
    }

    console.log('\n🎉 Schema repair completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Schema repair failed:', error);
    throw error;
  }
}

// Export for use in other scripts
export { fixSchema };

// Run directly if called as main script
if (require.main === module) {
  fixSchema()
    .then(() => {
      console.log('\n✅ Schema fix complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Schema fix failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
