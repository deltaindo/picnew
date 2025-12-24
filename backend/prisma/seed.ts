import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

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

  // 2. Create bidang (sectors) - Real K3 sectors
  const bidangList = [
    { name: 'PAA (PESAWAT ANGKAT DAN ANGKUT)', description: 'Keselamatan Pesawat Angkat dan Angkut' },
    { name: 'AK3U (KEAHLIAN K3 UMUM)', description: 'Keahlian Keselamatan dan Kesehatan Kerja Umum' },
    { name: 'ELEVATOR DAN ESKALATOR', description: 'Keselamatan Elevator dan Eskalator' },
    { name: 'LISTRIK', description: 'Keselamatan dan Kesehatan Kerja Kelistrikan' },
    { name: 'PENANGGULANGAN KEBAKARAN', description: 'Pencegahan dan Penanggulangan Kebakaran' },
    { name: 'BEKERJA PADA KETINGGIAN', description: 'Keselamatan Bekerja pada Ketinggian' },
    { name: 'PESAWAT TENAGA DAN PRODUKSI', description: 'Keselamatan Pesawat Tenaga dan Produksi' },
    { name: 'KONSTRUKSI DAN BANGUNAN', description: 'Keselamatan Konstruksi dan Bangunan' },
    { name: 'PESAWAT UAP, BEJANA TEKANAN DAN TANGKI TIMBUN', description: 'Keselamatan Pesawat Uap dan Bejana Tekanan' },
    { name: 'LINGKUNGAN KERJA DAN BAHAN BERBAHAYA', description: 'Keselamatan Lingkungan Kerja dan B3' },
    { name: 'KESEHATAN KERJA', description: 'Kesehatan dan Higiene Kerja' },
    { name: 'PENGELASAN', description: 'Keselamatan Pengelasan' },
    { name: 'SISTEM MANAJEMEN K3', description: 'Sistem Manajemen Keselamatan dan Kesehatan Kerja' },
  ];

  const bidangs: { id: number; name: string }[] = [];
  for (const bidang of bidangList) {
    const created = await prisma.bidang.upsert({
      where: { name: bidang.name },
      update: {},
      create: bidang,
    });
    bidangs.push(created);
    console.log('✅ Bidang created:', created.name);
  }

  // Create bidang map for easy lookup
  const bidangMap: Record<string, number> = {};
  bidangs.forEach(b => {
    if (b.name.includes('PAA')) bidangMap['PAA'] = b.id;
    if (b.name.includes('AK3U')) bidangMap['AK3U'] = b.id;
    if (b.name.includes('ELEVATOR')) bidangMap['ELEVATOR'] = b.id;
    if (b.name.includes('LISTRIK')) bidangMap['LISTRIK'] = b.id;
    if (b.name.includes('KEBAKARAN')) bidangMap['KEBAKARAN'] = b.id;
    if (b.name.includes('KETINGGIAN')) bidangMap['KETINGGIAN'] = b.id;
    if (b.name.includes('PESAWAT TENAGA')) bidangMap['PTP'] = b.id;
    if (b.name.includes('KONSTRUKSI')) bidangMap['KONSTRUKSI'] = b.id;
    if (b.name.includes('PESAWAT UAP')) bidangMap['PUBT'] = b.id;
    if (b.name.includes('LINGKUNGAN')) bidangMap['KIMIA'] = b.id;
    if (b.name.includes('KESEHATAN KERJA')) bidangMap['KESEHATAN'] = b.id;
    if (b.name.includes('PENGELASAN')) bidangMap['LAS'] = b.id;
    if (b.name.includes('SISTEM MANAJEMEN')) bidangMap['SMK3'] = b.id;
  });

  // 3. Create training classes - Real K3 classes
  const classList = [
    { name: 'AHLI', level: 3 },
    { name: 'SUPERVISI SCAFFOLDING', level: 3 },
    { name: 'TEKNISI SCAFFOLDING', level: 2 },
    { name: 'TEKNISI', level: 2 },
    { name: 'KELAS A', level: 1 },
    { name: 'KELAS B', level: 2 },
    { name: 'KELAS C', level: 3 },
    { name: 'KELAS D', level: 4 },
    { name: 'OPERATOR', level: 2 },
    { name: 'TEKNISI PESAWAT UAP', level: 2 },
    { name: 'TEKNISI BEJANA TEKAN DAN TANGKI TIMBUN', level: 2 },
    { name: 'KELAS I', level: 1 },
    { name: 'KELAS II', level: 2 },
    { name: 'KELAS III', level: 3 },
    { name: 'PETUGAS', level: 1 },
    { name: 'UTAMA', level: 3 },
    { name: 'MADYA', level: 2 },
    { name: 'REGU PENYELAMAT', level: 2 },
    { name: 'TKBT 2', level: 2 },
    { name: 'TKPK 1', level: 1 },
    { name: 'TKPK 2', level: 2 },
    { name: 'TEKNISI & OPERATOR', level: 2 },
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
    { name: 'PETUGAS KEBAKARAN' },
    { name: 'TEKNISI LISTRIK' },
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
    { name: 'Surat Keterangan Kerja' },
    { name: 'Pas Foto' },
    { name: 'Surat Keterangan Sehat' },
  ];

  for (const docType of docTypesList) {
    const created = await prisma.documentType.upsert({
      where: { name: docType.name },
      update: {},
      create: docType,
    });
    console.log('✅ Document Type created:', created.name);
  }

  // 6. Create training programs - Real K3 Training Programs
  const trainingProgramsList = [
    { name: 'AHLI K3 UMUM', description: 'Pelatihan Ahli Keselamatan dan Kesehatan Kerja Umum', bidangId: bidangMap['AK3U'], durationDays: 12 },
    { name: 'AUDITOR SMK3', description: 'Pelatihan Auditor Sistem Manajemen K3', bidangId: bidangMap['SMK3'], durationDays: 5 },
    { name: 'K3 KONSTRUKSI', description: 'Pelatihan K3 Konstruksi dan Bangunan', bidangId: bidangMap['KONSTRUKSI'], durationDays: 5 },
    { name: 'K3 LISTRIK', description: 'Pelatihan K3 Kelistrikan', bidangId: bidangMap['LISTRIK'], durationDays: 5 },
    { name: 'K3 ELEVATOR ESKALATOR', description: 'Pelatihan K3 Elevator dan Eskalator', bidangId: bidangMap['ELEVATOR'], durationDays: 4 },
    { name: 'K3 KEBAKARAN', description: 'Pelatihan K3 Penanggulangan Kebakaran', bidangId: bidangMap['KEBAKARAN'], durationDays: 4 },
    { name: 'K3 PAA', description: 'Pelatihan K3 Pesawat Angkat dan Angkut', bidangId: bidangMap['PAA'], durationDays: 5 },
    { name: 'K3 PTP', description: 'Pelatihan K3 Pesawat Tenaga dan Produksi', bidangId: bidangMap['PTP'], durationDays: 5 },
    { name: 'K3 PUBT', description: 'Pelatihan K3 Pesawat Uap dan Bejana Tekanan', bidangId: bidangMap['PUBT'], durationDays: 5 },
    { name: 'K3 LAS', description: 'Pelatihan K3 Pengelasan', bidangId: bidangMap['LAS'], durationDays: 3 },
    { name: 'K3 KIMIA', description: 'Pelatihan K3 Bahan Kimia Berbahaya', bidangId: bidangMap['KIMIA'], durationDays: 4 },
    { name: 'K3 RUANG TERBATAS', description: 'Pelatihan K3 Bekerja di Ruang Terbatas', bidangId: bidangMap['KIMIA'], durationDays: 2 },
    { name: 'K3 PEKERJAAN PADA KETINGGIAN', description: 'Pelatihan K3 Bekerja pada Ketinggian', bidangId: bidangMap['KETINGGIAN'], durationDays: 3 },
    { name: 'K3 KESEHATAN KERJA', description: 'Pelatihan Kesehatan dan Higiene Kerja', bidangId: bidangMap['KESEHATAN'], durationDays: 4 },
    { name: 'TKBT 2', description: 'Teknisi Keselamatan Bejana Tekan Tingkat 2', bidangId: bidangMap['PUBT'], durationDays: 5 },
    { name: 'TKBT 1', description: 'Teknisi Keselamatan Bejana Tekan Tingkat 1', bidangId: bidangMap['PUBT'], durationDays: 4 },
    { name: 'TKPK 1', description: 'Teknisi Keselamatan Pesawat Khusus Tingkat 1', bidangId: bidangMap['PAA'], durationDays: 4 },
    { name: 'TKPK 2', description: 'Teknisi Keselamatan Pesawat Khusus Tingkat 2', bidangId: bidangMap['PAA'], durationDays: 5 },
  ];

  for (const program of trainingProgramsList) {
    const created = await prisma.trainingProgram.upsert({
      where: { name: program.name },
      update: {},
      create: program,
    });
    console.log('✅ Training Program created:', created.name);
  }

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Login Credentials:');
  console.log('   Email: admin@deltaindo.com');
  console.log('   Password: admin123');
  console.log('\n📊 Seeded Data Summary:');
  console.log(`   - ${bidangList.length} Bidang (sectors)`);
  console.log(`   - ${classList.length} Training Classes`);
  console.log(`   - ${personnelTypesList.length} Personnel Types`);
  console.log(`   - ${docTypesList.length} Document Types`);
  console.log(`   - ${trainingProgramsList.length} Training Programs`);
}

main()
  .catch((error) => {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
