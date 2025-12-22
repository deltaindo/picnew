import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { exec } from 'child_process';
import { promisify } from 'util';

const prisma = new PrismaClient();
const execAsync = promisify(exec);

async function main() {
  console.log('🌱 Seeding database...\n');

  try {
    // 1. Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@delta-indonesia.com' },
      update: {},
      create: {
        email: 'admin@delta-indonesia.com',
        password: adminPassword,
        name: 'Admin Delta',
        phone: '+62812345678',
        role: 'admin',
      },
    });
    console.log('✓ Admin user created:', admin.email);

    // 2. Create Bidang (Sectors)
    const bidang = await Promise.all([
      prisma.bidang.upsert({
        where: { name: 'PAA (PESAWAT ANGKAT DAN ANGKUT)' },
        update: {},
        create: { name: 'PAA (PESAWAT ANGKAT DAN ANGKUT)', description: 'Pelatihan keselamatan untuk pesawat angkat dan angkut' },
      }),
      prisma.bidang.upsert({
        where: { name: 'AK3U (KEAHLIAN K3 UMUM)' },
        update: {},
        create: { name: 'AK3U (KEAHLIAN K3 UMUM)', description: 'Pelatihan umum keselamatan dan kesehatan kerja' },
      }),
      prisma.bidang.upsert({
        where: { name: 'ELEVATOR DAN ESKALATOR' },
        update: {},
        create: { name: 'ELEVATOR DAN ESKALATOR', description: 'Pelatihan khusus elevator dan eskalator' },
      }),
      prisma.bidang.upsert({
        where: { name: 'LISTRIK' },
        update: {},
        create: { name: 'LISTRIK', description: 'Pelatihan keselamatan listrik dan instalasi' },
      }),
      prisma.bidang.upsert({
        where: { name: 'PENANGGULANGAN KEBAKARAN' },
        update: {},
        create: { name: 'PENANGGULANGAN KEBAKARAN', description: 'Pelatihan pengendalian dan penanggulangan kebakaran' },
      }),
      prisma.bidang.upsert({
        where: { name: 'BEKERJA PADA KETINGGIAN' },
        update: {},
        create: { name: 'BEKERJA PADA KETINGGIAN', description: 'Pelatihan keselamatan bekerja pada ketinggian' },
      }),
      prisma.bidang.upsert({
        where: { name: 'PESAWAT TENAGA DAN PRODUKSI' },
        update: {},
        create: { name: 'PESAWAT TENAGA DAN PRODUKSI', description: 'Pelatihan pesawat tenaga dan produksi' },
      }),
      prisma.bidang.upsert({
        where: { name: 'KONSTRUKSI DAN BANGUNAN' },
        update: {},
        create: { name: 'KONSTRUKSI DAN BANGUNAN', description: 'Pelatihan keselamatan konstruksi dan bangunan' },
      }),
      prisma.bidang.upsert({
        where: { name: 'PESAWAT UAP, BEJANA TEKANAN DAN TANGKI TIMBUN' },
        update: {},
        create: { name: 'PESAWAT UAP, BEJANA TEKANAN DAN TANGKI TIMBUN', description: 'Pelatihan pesawat uap dan bejana tekanan' },
      }),
      prisma.bidang.upsert({
        where: { name: 'LINGKUNGAN KERJA DAN BAHAN BERBAHAYA' },
        update: {},
        create: { name: 'LINGKUNGAN KERJA DAN BAHAN BERBAHAYA', description: 'Pelatihan lingkungan kerja dan bahan berbahaya' },
      }),
      prisma.bidang.upsert({
        where: { name: 'KESEHATAN KERJA' },
        update: {},
        create: { name: 'KESEHATAN KERJA', description: 'Pelatihan kesehatan kerja dan higiene' },
      }),
      prisma.bidang.upsert({
        where: { name: 'PENGELASAN' },
        update: {},
        create: { name: 'PENGELASAN', description: 'Pelatihan keselamatan pengelasan' },
      }),
      prisma.bidang.upsert({
        where: { name: 'SISTEM MANAJEMEN K3' },
        update: {},
        create: { name: 'SISTEM MANAJEMEN K3', description: 'Pelatihan sistem manajemen keselamatan dan kesehatan kerja' },
      }),
    ]);
    console.log(`✓ ${bidang.length} Bidang created\n`);

    // 3. Create Training Classes
    const classes = await Promise.all([
      prisma.trainingClass.upsert({ where: { name: 'AHLI' }, update: {}, create: { name: 'AHLI', level: 5 } }),
      prisma.trainingClass.upsert({ where: { name: 'SUPERVISI SCAFFOLDING' }, update: {}, create: { name: 'SUPERVISI SCAFFOLDING', level: 4 } }),
      prisma.trainingClass.upsert({ where: { name: 'TEKNISI SCAFFOLDING' }, update: {}, create: { name: 'TEKNISI SCAFFOLDING', level: 3 } }),
      prisma.trainingClass.upsert({ where: { name: 'TEKNISI' }, update: {}, create: { name: 'TEKNISI', level: 3 } }),
      prisma.trainingClass.upsert({ where: { name: 'KELAS A' }, update: {}, create: { name: 'KELAS A', level: 2 } }),
      prisma.trainingClass.upsert({ where: { name: 'KELAS B' }, update: {}, create: { name: 'KELAS B', level: 2 } }),
      prisma.trainingClass.upsert({ where: { name: 'KELAS C' }, update: {}, create: { name: 'KELAS C', level: 1 } }),
      prisma.trainingClass.upsert({ where: { name: 'KELAS D' }, update: {}, create: { name: 'KELAS D', level: 1 } }),
      prisma.trainingClass.upsert({ where: { name: 'OPERATOR' }, update: {}, create: { name: 'OPERATOR', level: 2 } }),
      prisma.trainingClass.upsert({ where: { name: 'PETUGAS' }, update: {}, create: { name: 'PETUGAS', level: 1 } }),
      prisma.trainingClass.upsert({ where: { name: 'UTAMA' }, update: {}, create: { name: 'UTAMA', level: 5 } }),
      prisma.trainingClass.upsert({ where: { name: 'MADYA' }, update: {}, create: { name: 'MADYA', level: 4 } }),
    ]);
    console.log(`✓ ${classes.length} Training Classes created\n`);

    // 4. Create Personnel Types
    const personnelTypes = await Promise.all([
      prisma.personnelType.upsert({ where: { name: 'OPERATOR' }, update: {}, create: { name: 'OPERATOR' } }),
      prisma.personnelType.upsert({ where: { name: 'JURU' }, update: {}, create: { name: 'JURU' } }),
      prisma.personnelType.upsert({ where: { name: 'TEKNISI' }, update: {}, create: { name: 'TEKNISI' } }),
      prisma.personnelType.upsert({ where: { name: 'AHLI K3' }, update: {}, create: { name: 'AHLI K3' } }),
      prisma.personnelType.upsert({ where: { name: 'SUPERVISI' }, update: {}, create: { name: 'SUPERVISI' } }),
      prisma.personnelType.upsert({ where: { name: 'PETUGAS' }, update: {}, create: { name: 'PETUGAS' } }),
    ]);
    console.log(`✓ ${personnelTypes.length} Personnel Types created\n`);

    // 5. Create Training Programs
    const trainingPrograms = await Promise.all([
      prisma.trainingProgram.upsert({
        where: { name: 'AHLI K3 UMUM' },
        update: {},
        create: { name: 'AHLI K3 UMUM', bidangId: bidang[1].id, durationDays: 16, minParticipants: 10, maxParticipants: 30 },
      }),
      prisma.trainingProgram.upsert({
        where: { name: 'K3 LISTRIK' },
        update: {},
        create: { name: 'K3 LISTRIK', bidangId: bidang[3].id, durationDays: 5, minParticipants: 10, maxParticipants: 25 },
      }),
      prisma.trainingProgram.upsert({
        where: { name: 'K3 KONSTRUKSI' },
        update: {},
        create: { name: 'K3 KONSTRUKSI', bidangId: bidang[7].id, durationDays: 5, minParticipants: 10, maxParticipants: 25 },
      }),
      prisma.trainingProgram.upsert({
        where: { name: 'K3 ELEVATOR ESKALATOR' },
        update: {},
        create: { name: 'K3 ELEVATOR ESKALATOR', bidangId: bidang[2].id, durationDays: 5, minParticipants: 8, maxParticipants: 20 },
      }),
      prisma.trainingProgram.upsert({
        where: { name: 'K3 KEBAKARAN' },
        update: {},
        create: { name: 'K3 KEBAKARAN', bidangId: bidang[4].id, durationDays: 3, minParticipants: 8, maxParticipants: 20 },
      }),
    ]);
    console.log(`✓ ${trainingPrograms.length} Training Programs created\n`);

    // 6. Seed Indonesian Regions
    console.log('📍 Seeding Indonesian Regions...');
    console.log('   This will seed all 34 provinces, 514 regencies/cities, 7,277 districts, and 75,574+ villages');
    console.log('   Running: npx ts-node prisma/seeders/indonesian-regions.ts\n');

    try {
      await execAsync('npx ts-node prisma/seeders/indonesian-regions.ts', {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
    } catch (error: any) {
      console.warn('⚠️  Warning: Indonesian regions seeder encountered an issue.');
      console.warn('   This is likely due to API rate limiting or network issues.');
      console.warn('   You can run the seeder separately with: npx ts-node prisma/seeders/indonesian-regions.ts\n');
    }

    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
