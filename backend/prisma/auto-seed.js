const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Auto-seed function that runs on startup
 * Checks if master data exists, if not, seeds it
 */
async function autoSeed() {
  try {
    console.log('\n🌱 Checking if database needs seeding...');

    // Check if PIC already exists
    const picCount = await prisma.PIC.count();
    if (picCount > 0) {
      console.log('✅ Master data already exists. Skipping auto-seed.');
      return;
    }

    console.log('📊 Starting auto-seeding process...\n');

    // 1. Seed PIC (Person In Charge)
    console.log('📌 Seeding PIC (Person In Charge)...');
    const picNames = [
      'Ghaida Trisnanda',
      'Yuyun',
      'Echasita',
      'Erje',
      'Nur Afidah',
      'Hafid',
      'Daniel Setiono',
    ];

    for (const name of picNames) {
      await prisma.PIC.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
    console.log(`✅ PIC seeded: ${picNames.length} entries\n`);

    // 2. Seed Marketing
    console.log('📢 Seeding Marketing Personnel...');
    const marketingNames = [
      'Agustyani',
      'Atikah',
      'Anik',
      'Yoppi',
      'Intang',
      'Hafid',
      'Ali M',
      'Erje',
      'Indri',
      'Bayu',
      'Yunny',
      'Eko',
    ];

    for (const name of marketingNames) {
      await prisma.Marketing.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
    console.log(`✅ Marketing seeded: ${marketingNames.length} entries\n`);

    // 3. Seed Program Types
    console.log('📋 Seeding Program Types...');
    const programTypes = [
      { name: 'Reguler', description: 'Program Reguler' },
      { name: 'Inhouse', description: 'Program Inhouse' },
      { name: 'BNSP', description: 'Program BNSP' },
    ];

    for (const program of programTypes) {
      await prisma.ProgramType.upsert({
        where: { name: program.name },
        update: { description: program.description },
        create: program,
      });
    }
    console.log(`✅ Program Types seeded: ${programTypes.length} entries\n`);

    console.log('🎉 Auto-seeding completed successfully!\n');
    console.log('📊 Master Data Summary:');
    console.log(`   • PIC: ${picNames.length} entries`);
    console.log(`   • Marketing: ${marketingNames.length} entries`);
    console.log(`   • Program Types: ${programTypes.length} entries`);
    console.log();
  } catch (error) {
    console.error('❌ Auto-seeding failed:', error);
    throw error;
  }
}

/**
 * Reset all master data - use with caution!
 */
async function resetMasterData() {
  try {
    console.log('\n⚠️  WARNING: Deleting all master data...\n');

    await prisma.PIC.deleteMany({});
    console.log('✅ PIC cleared');

    await prisma.Marketing.deleteMany({});
    console.log('✅ Marketing cleared');

    await prisma.ProgramType.deleteMany({});
    console.log('✅ Program Types cleared');

    console.log('\n✅ Master data reset complete!\n');
  } catch (error) {
    console.error('❌ Reset failed:', error);
    throw error;
  }
}

/**
 * Check current master data status
 */
async function checkMasterDataStatus() {
  try {
    const picCount = await prisma.PIC.count();
    const marketingCount = await prisma.Marketing.count();
    const programTypeCount = await prisma.ProgramType.count();

    return {
      pic: picCount,
      marketing: marketingCount,
      programTypes: programTypeCount,
      isSeeded: picCount > 0 && marketingCount > 0 && programTypeCount > 0,
    };
  } catch (error) {
    console.error('❌ Status check failed:', error);
    throw error;
  }
}

module.exports = {
  autoSeed,
  resetMasterData,
  checkMasterDataStatus,
};