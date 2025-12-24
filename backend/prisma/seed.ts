import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out to preserve data)
  // await prisma.bidang.deleteMany();
  // await prisma.trainingClass.deleteMany();
  // await prisma.personnelType.deleteMany();
  // await prisma.user.deleteMany();

  // 1. Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@deltaindo.com' },
    update: {},
    create: {
      email: 'admin@deltaindo.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin Delta Indonesia',
      role: 'super_admin',
      phone: '081234567890',
    },
  });
  console.log('✅ Admin user created/updated:', adminUser.email);

  // 2. Create bidang (sectors)
  const bidangList = [
    {
      name: 'K3 LISTRIK',
      description: 'Keselamatan dan Kesehatan Kerja di bidang Kelistrikan',
    },
    {
      name: 'K3 UMUM',
      description: 'Keselamatan dan Kesehatan Kerja Umum',
    },
    {
      name: 'PAA',
      description: 'Peralatan dan Alat-alat industri',
    },
    {
      name: 'OPERATOR PENGANGKAT',
      description: 'Operator Mesin Pengangkat dan Pemindah Beban',
    },
  ];

  for (const bidang of bidangList) {
    const created = await prisma.bidang.upsert({
      where: { name: bidang.name },
      update: {},
      create: bidang,
    });
    console.log('✅ Bidang created:', created.name);
  }

  // 3. Create training classes
  const classList = [
    { name: 'AHLI', level: 3 },
    { name: 'OPERATOR', level: 2 },
    { name: 'TEKNISI', level: 2 },
    { name: 'PEKERJA LAPANGAN', level: 1 },
  ];

  for (const cls of classList) {
    const created = await prisma.trainingClass.upsert({
      where: { name: cls.name },
      update: {},
      create: cls,
    });
    console.log('✅ Class created:', created.name, `(Level: ${created.level})`);
  }

  // 4. Create personnel types
  const personnelTypesList = [
    { name: 'OPERATOR MESIN' },
    { name: 'PEKERJA KONSTRUKSI' },
    { name: 'TEKNISI MESIN' },
    { name: 'SUPERVISOR K3' },
    { name: 'AHLI K3' },
  ];

  for (const type of personnelTypesList) {
    const created = await prisma.personnelType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
    console.log('✅ Personnel Type created:', created.name);
  }

  // 5. Create document types
  const docTypesList = [
    { name: 'Sertifikat Pelatihan' },
    { name: 'Ijazah' },
    { name: 'KTP' },
    { name: 'Surat Keterangan' },
  ];

  for (const docType of docTypesList) {
    const created = await prisma.documentType.upsert({
      where: { name: docType.name },
      update: {},
      create: docType,
    });
    console.log('✅ Document Type created:', created.name);
  }

  // 6. Create training programs
  const trainingProgramsList = [
    {
      name: 'Inhouse',
      description: 'Pelatihan internal khusus untuk karyawan perusahaan',
    },
    {
      name: 'Reguler',
      description: 'Pelatihan terbuka untuk umum sesuai jadwal reguler',
    },
    {
      name: 'Mitra PJK3',
      description: 'Pelatihan kerjasama dengan mitra PJK3',
    },
  ];

  for (const program of trainingProgramsList) {
    const created = await prisma.trainingProgram.upsert({
      where: { name: program.name },
      update: {},
      create: program,
    });
    console.log('✅ Training Program created:', created.name);
  }

  // 7. Create sample trainings
  const trainingsList = [
    {
      name: 'K3 Listrik Level 1',
      description: 'Pelatihan Keselamatan dan Kesehatan Kerja Kelistrikan Tingkat Dasar',
      start_date: new Date('2025-01-15'),
      end_date: new Date('2025-01-20'),
      location: 'Jakarta Training Center',
      duration_days: 5,
      max_participants: 30,
      instructor: 'Ir. Budi Santoso',
      status: 'scheduled',
    },
    {
      name: 'K3 Umum Level 2',
      description: 'Pelatihan Keselamatan dan Kesehatan Kerja Umum Tingkat Menengah',
      start_date: new Date('2025-02-10'),
      end_date: new Date('2025-02-15'),
      location: 'Surabaya Training Center',
      duration_days: 5,
      max_participants: 25,
      instructor: 'Ir. Siti Nurhaliza',
      status: 'scheduled',
    },
    {
      name: 'Operator Pengangkat Level 1',
      description: 'Pelatihan Operator Mesin Pengangkat dan Pemindah Beban',
      start_date: new Date('2025-03-01'),
      end_date: new Date('2025-03-05'),
      location: 'Medan Training Center',
      duration_days: 4,
      max_participants: 20,
      instructor: 'Ir. Hendra Wijaya',
      status: 'scheduled',
    },
    {
      name: 'K3 Listrik Level 3 (Ahli)',
      description: 'Pelatihan Keselamatan dan Kesehatan Kerja Kelistrikan Tingkat Ahli',
      start_date: new Date('2025-04-01'),
      end_date: new Date('2025-04-10'),
      location: 'Bandung Training Center',
      duration_days: 9,
      max_participants: 15,
      instructor: 'Dr. Ir. Bambang Setiawan',
      status: 'scheduled',
    },
  ];

  for (const training of trainingsList) {
    const created = await prisma.training.upsert({
      where: { name: training.name },
      update: {},
      create: training,
    });
    console.log('✅ Training created:', created.name);
  }

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Login Credentials:');
  console.log('   Email: admin@deltaindo.com');
  console.log('   Password: admin123');
}

main()
  .catch((error) => {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
