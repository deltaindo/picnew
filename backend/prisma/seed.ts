import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create admin user
    console.log('\n📝 Seeding Users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@deltaindo.com' },
      update: { password: hashedPassword },
      create: {
        email: 'admin@deltaindo.com',
        password: hashedPassword,
        name: 'Admin Delta Indonesia',
        role: 'admin',
        phone: '081234567890',
      },
    });
    console.log('✅ Admin user created/updated:', adminUser.email);

    // 2. Create bidang (sectors) - Real K3 sectors
    console.log('\n📋 Seeding Bidang (Sectors)...');
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
    }
    console.log(`✅ ${bidangs.length} Bidang created`);

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

    // 3. Create training programs - Real K3 Training Programs
    console.log('\n📚 Seeding Training Programs...');
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
      await prisma.trainingProgram.upsert({
        where: { name: program.name },
        update: {},
        create: program,
      });
    }
    console.log(`✅ ${trainingProgramsList.length} Training Programs created`);

    // 4. Create training classes - Real K3 classes
    console.log('\n🎓 Seeding Training Classes...');
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
      await prisma.trainingClass.upsert({
        where: { name: cls.name },
        update: {},
        create: cls,
      });
    }
    console.log(`✅ ${classList.length} Training Classes created`);

    // 5. Create personnel types
    console.log('\n👥 Seeding Personnel Types...');
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
      await prisma.personnelType.upsert({
        where: { name: type.name },
        update: {},
        create: type,
      });
    }
    console.log(`✅ ${personnelTypesList.length} Personnel Types created`);

    // 6. Create document types
    console.log('\n📄 Seeding Document Types...');
    const docTypesList = [
      { name: 'Sertifikat Pelatihan' },
      { name: 'Ijazah' },
      { name: 'KTP' },
      { name: 'Surat Keterangan Kerja' },
      { name: 'Pas Foto' },
      { name: 'Surat Keterangan Sehat' },
    ];

    for (const docType of docTypesList) {
      await prisma.documentType.upsert({
        where: { name: docType.name },
        update: {},
        create: docType,
      });
    }
    console.log(`✅ ${docTypesList.length} Document Types created`);

    // 7. Create PIC (Person In Charge) - NEW
    console.log('\n👔 Seeding PIC (Person In Charge)...');
    const picList = [
      'Ghaida Trisnanda',
      'Yuyun',
      'Echasita',
      'Erje',
      'Nur Afidah',
      'Hafid',
      'Daniel Setiono',
    ];

    for (const picName of picList) {
      await prisma.pic.upsert({
        where: { name: picName },
        update: {},
        create: { name: picName },
      });
    }
    console.log(`✅ ${picList.length} PIC created`);

    // 8. Create Marketing - NEW
    console.log('\n📢 Seeding Marketing Personnel...');
    const marketingList = [
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

    for (const marketingName of marketingList) {
      await prisma.marketing.upsert({
        where: { name: marketingName },
        update: {},
        create: { name: marketingName },
      });
    }
    console.log(`✅ ${marketingList.length} Marketing personnel created`);

    // 9. Create Program Types (Reguler, Inhouse, BNSP) - NEW
    console.log('\n🎯 Seeding Program Types...');
    const programTypeList = [
      { name: 'Reguler', description: 'Program Reguler' },
      { name: 'Inhouse', description: 'Program Inhouse' },
      { name: 'BNSP', description: 'Program BNSP' },
    ];

    for (const programType of programTypeList) {
      await prisma.programType.upsert({
        where: { name: programType.name },
        update: { description: programType.description },
        create: programType,
      });
    }
    console.log(`✅ ${programTypeList.length} Program Types created`);

    // Verify user was created
    const userCount = await prisma.user.count();
    console.log('\n✅ User count in database:', userCount);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Test Login Credentials:');
    console.log('   Email: admin@deltaindo.com');
    console.log('   Password: admin123');
    console.log('\n📊 Seeded Data Summary:');
    console.log(`   - ${bidangList.length} Bidang (sectors)`);
    console.log(`   - ${trainingProgramsList.length} Training Programs`);
    console.log(`   - ${classList.length} Training Classes`);
    console.log(`   - ${personnelTypesList.length} Personnel Types`);
    console.log(`   - ${docTypesList.length} Document Types`);
    console.log(`   - ${picList.length} PIC (Person In Charge)`);
    console.log(`   - ${marketingList.length} Marketing`);
    console.log(`   - ${programTypeList.length} Program Types`);
    console.log(`   - ${userCount} Admin User(s)`);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('❌ Fatal seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
