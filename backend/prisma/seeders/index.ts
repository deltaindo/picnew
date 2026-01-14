/**
 * Seeder Index - Centralized seed data exports
 *
 * This file provides organized access to all seed data
 * and ensures consistency with the database schema.
 */

// ==================== SEED DATA TYPES ====================

export interface BidangSeed {
  name: string;
  description?: string;
}

export interface TrainingClassSeed {
  name: string;
  level: number;
}

export interface PersonnelTypeSeed {
  name: string;
}

export interface DocumentTypeSeed {
  name: string;
}

export interface TrainingProgramSeed {
  name: string;
  description?: string;
  bidangId?: number;
  durationDays: number;
}

export interface ProgramTypeSeed {
  name: string;
  description?: string;
}

export interface PicSeed {
  name: string;
}

export interface MarketingSeed {
  name: string;
}

// ==================== SEED DATA ====================

export const bidangSeeds: BidangSeed[] = [
  {
    name: "PAA (PESAWAT ANGKAT DAN ANGKUT)",
    description: "Keselamatan Pesawat Angkat dan Angkut",
  },
  {
    name: "AK3U (KEAHLIAN K3 UMUM)",
    description: "Keahlian Keselamatan dan Kesehatan Kerja Umum",
  },
  {
    name: "ELEVATOR DAN ESKALATOR",
    description: "Keselamatan Elevator dan Eskalator",
  },
  {
    name: "LISTRIK",
    description: "Keselamatan dan Kesehatan Kerja Kelistrikan",
  },
  {
    name: "PENANGGULANGAN KEBAKARAN",
    description: "Pencegahan dan Penanggulangan Kebakaran",
  },
  {
    name: "BEKERJA PADA KETINGGIAN",
    description: "Keselamatan Bekerja pada Ketinggian",
  },
  {
    name: "PESAWAT TENAGA DAN PRODUKSI",
    description: "Keselamatan Pesawat Tenaga dan Produksi",
  },
  {
    name: "KONSTRUKSI DAN BANGUNAN",
    description: "Keselamatan Konstruksi dan Bangunan",
  },
  {
    name: "PESAWAT UAP, BEJANA TEKANAN DAN TANGKI TIMBUN",
    description: "Keselamatan Pesawat Uap dan Bejana Tekanan",
  },
  {
    name: "LINGKUNGAN KERJA DAN BAHAN BERBAHAYA",
    description: "Keselamatan Lingkungan Kerja dan B3",
  },
  { name: "KESEHATAN KERJA", description: "Kesehatan dan Higiene Kerja" },
  { name: "PENGELASAN", description: "Keselamatan Pengelasan" },
  {
    name: "SISTEM MANAJEMEN K3",
    description: "Sistem Manajemen Keselamatan dan Kesehatan Kerja",
  },
];

export const trainingClassSeeds: TrainingClassSeed[] = [
  { name: "AHLI", level: 3 },
  { name: "SUPERVISI SCAFFOLDING", level: 3 },
  { name: "TEKNISI SCAFFOLDING", level: 2 },
  { name: "TEKNISI", level: 2 },
  { name: "KELAS A", level: 1 },
  { name: "KELAS B", level: 2 },
  { name: "KELAS C", level: 3 },
  { name: "KELAS D", level: 4 },
  { name: "OPERATOR", level: 2 },
  { name: "TEKNISI PESAWAT UAP", level: 2 },
  { name: "TEKNISI BEJANA TEKAN DAN TANGKI TIMBUN", level: 2 },
  { name: "KELAS I", level: 1 },
  { name: "KELAS II", level: 2 },
  { name: "KELAS III", level: 3 },
  { name: "PETUGAS", level: 1 },
  { name: "UTAMA", level: 3 },
  { name: "MADYA", level: 2 },
  { name: "REGU PENYELAMAT", level: 2 },
  { name: "TKBT 2", level: 2 },
  { name: "TKPK 1", level: 1 },
  { name: "TKPK 2", level: 2 },
  { name: "TEKNISI & OPERATOR", level: 2 },
];

export const personnelTypeSeeds: PersonnelTypeSeed[] = [
  { name: "OPERATOR MESIN" },
  { name: "PEKERJA KONSTRUKSI" },
  { name: "TEKNISI MESIN" },
  { name: "SUPERVISOR K3" },
  { name: "AHLI K3" },
  { name: "PETUGAS KEBAKARAN" },
  { name: "TEKNISI LISTRIK" },
];

export const documentTypeSeeds: DocumentTypeSeed[] = [
  { name: "Sertifikat Pelatihan" },
  { name: "Ijazah" },
  { name: "KTP" },
  { name: "Surat Keterangan Kerja" },
  { name: "Pas Foto" },
  { name: "Surat Keterangan Sehat" },
];

export const programTypeSeeds: ProgramTypeSeed[] = [
  { name: "Reguler", description: "Program Reguler" },
  { name: "Inhouse", description: "Program Inhouse" },
  { name: "Mitra PJK3", description: "Program MitraPJK3" },
];

export const picSeeds: PicSeed[] = [
  { name: "Ghaida Trisnanda" },
  { name: "Yuyun" },
  { name: "Echasita" },
  { name: "Erje" },
  { name: "Nur Afidah" },
  { name: "Hafid" },
  { name: "Daniel Setiono" },
];

export const marketingSeeds: MarketingSeed[] = [
  { name: "Agustyani" },
  { name: "Atikah" },
  { name: "Anik" },
  { name: "Yoppi" },
  { name: "Intang" },
  { name: "Hafid" },
  { name: "Ali M" },
  { name: "Erje" },
  { name: "Indri" },
  { name: "Bayu" },
  { name: "Yunny" },
  { name: "Eko" },
];

// ==================== TRAINING PROGRAMS MAPPING ====================

export const trainingProgramSeeds: Omit<TrainingProgramSeed, "bidangId">[] = [
  {
    name: "AHLI K3 UMUM",
    description: "Pelatihan Ahli Keselamatan dan Kesehatan Kerja Umum",
    durationDays: 12,
  },
  {
    name: "AUDITOR SMK3",
    description: "Pelatihan Auditor Sistem Manajemen K3",
    durationDays: 5,
  },
  {
    name: "K3 KONSTRUKSI",
    description: "Pelatihan K3 Konstruksi dan Bangunan",
    durationDays: 5,
  },
  {
    name: "K3 LISTRIK",
    description: "Pelatihan K3 Kelistrikan",
    durationDays: 5,
  },
  {
    name: "K3 ELEVATOR ESKALATOR",
    description: "Pelatihan K3 Elevator dan Eskalator",
    durationDays: 4,
  },
  {
    name: "K3 KEBAKARAN",
    description: "Pelatihan K3 Penanggulangan Kebakaran",
    durationDays: 4,
  },
  {
    name: "K3 PAA",
    description: "Pelatihan K3 Pesawat Angkat dan Angkut",
    durationDays: 5,
  },
  {
    name: "K3 PTP",
    description: "Pelatihan K3 Pesawat Tenaga dan Produksi",
    durationDays: 5,
  },
  {
    name: "K3 PUBT",
    description: "Pelatihan K3 Pesawat Uap dan Bejana Tekanan",
    durationDays: 5,
  },
  { name: "K3 LAS", description: "Pelatihan K3 Pengelasan", durationDays: 3 },
  {
    name: "K3 KIMIA",
    description: "Pelatihan K3 Bahan Kimia Berbahaya",
    durationDays: 4,
  },
  {
    name: "K3 RUANG TERBATAS",
    description: "Pelatihan K3 Bekerja di Ruang Terbatas",
    durationDays: 2,
  },
  {
    name: "K3 PEKERJAAN PADA KETINGGIAN",
    description: "Pelatihan K3 Bekerja pada Ketinggian",
    durationDays: 3,
  },
  {
    name: "K3 KESEHATAN KERJA",
    description: "Pelatihan Kesehatan dan Higiene Kerja",
    durationDays: 4,
  },
  {
    name: "TKBT 2",
    description: "Teknisi Keselamatan Bejana Tekan Tingkat 2",
    durationDays: 5,
  },
  {
    name: "TKBT 1",
    description: "Teknisi Keselamatan Bejana Tekan Tingkat 1",
    durationDays: 4,
  },
  {
    name: "TKPK 1",
    description: "Teknisi Keselamatan Pesawat Khusus Tingkat 1",
    durationDays: 4,
  },
  {
    name: "TKPK 2",
    description: "Teknisi Keselamatan Pesawat Khusus Tingkat 2",
    durationDays: 5,
  },
];

/**
 * Bidang mapping for training programs
 * Maps training program names to bidang identifiers
 */
export const bidangMapping: Record<string, keyof typeof bidangMap> = {
  "AHLI K3 UMUM": "AK3U",
  "AUDITOR SMK3": "SMK3",
  "K3 KONSTRUKSI": "KONSTRUKSI",
  "K3 LISTRIK": "LISTRIK",
  "K3 ELEVATOR ESKALATOR": "ELEVATOR",
  "K3 KEBAKARAN": "KEBAKARAN",
  "K3 PAA": "PAA",
  "K3 PTP": "PTP",
  "K3 PUBT": "PUBT",
  "K3 LAS": "LAS",
  "K3 KIMIA": "KIMIA",
  "K3 RUANG TERBATAS": "KIMIA",
  "K3 PEKERJAAN PADA KETINGGIAN": "KETINGGIAN",
  "K3 KESEHATAN KERJA": "KESEHATAN",
  "TKBT 2": "PUBT",
  "TKBT 1": "PUBT",
  "TKPK 1": "PAA",
  "TKPK 2": "PAA",
};

const bidangMap = {
  PAA: 0,
  AK3U: 1,
  ELEVATOR: 2,
  LISTRIK: 3,
  KEBAKARAN: 4,
  KETINGGIAN: 5,
  PTP: 6,
  KONSTRUKSI: 7,
  PUBT: 8,
  KIMIA: 9,
  KESEHATAN: 10,
  LAS: 11,
  SMK3: 12,
};

// ==================== STATISTICS ====================

export const seedStatistics = {
  bidang: bidangSeeds.length,
  trainingClasses: trainingClassSeeds.length,
  personnelTypes: personnelTypeSeeds.length,
  documentTypes: documentTypeSeeds.length,
  trainingPrograms: trainingProgramSeeds.length,
  programTypes: programTypeSeeds.length,
  pic: picSeeds.length,
  marketing: marketingSeeds.length,
} as const;
