/**
 * Indonesian Regions Seeder
 * Comprehensive seeder for all Indonesian administrative regions
 * 
 * Data Structure:
 * - 34 Provinces (Provinsi)
 * - 416 Regencies (Kabupaten) + 98 Cities (Kota) = 514 total
 * - 7,277 Districts (Kecamatan)
 * - 8,498 Urban Villages (Kelurahan) + 75,265 Rural Villages (Desa) = 83,763 total
 * 
 * Data Source: Geonesia API (https://rezzvy.github.io/geonesia-api/)
 */

import { PrismaClient } from '@prisma/client';

interface Province {
  id: string;
  province: string;
}

interface City {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

interface Village {
  id: string;
  name: string;
}

const prisma = new PrismaClient();
const BASE_URL = 'https://cdn.jsdelivr.net/gh/rezzvy/geonesia-api/data';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1500; // 1.5 seconds

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch data from Geonesia API with retry logic
 */
async function fetchFromGeonesia(url: string, retries = MAX_RETRIES): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      if (attempt === retries) {
        return null;
      }
      await delay(RETRY_DELAY * attempt);
    }
  }
  return null;
}

/**
 * Get all provinces
 */
async function getProvinces(): Promise<Province[]> {
  console.log('📍 Fetching provinces...');
  const data = await fetchFromGeonesia(`${BASE_URL}/main.json`);
  return data || [];
}

/**
 * Get cities/regencies for a province
 */
async function getCitiesByProvince(provinceId: string): Promise<City[]> {
  const data = await fetchFromGeonesia(`${BASE_URL}/cities/${provinceId}.json`);
  return data?.city || [];
}

/**
 * Get districts for a city/regency
 */
async function getDistrictsByCity(cityId: string): Promise<District[]> {
  const data = await fetchFromGeonesia(`${BASE_URL}/districts/${cityId}.json`);
  return data || [];
}

/**
 * Get villages for a district
 */
async function getVillagesByDistrict(districtId: string): Promise<Village[]> {
  const data = await fetchFromGeonesia(`${BASE_URL}/villages/${districtId}.json`);
  return data || [];
}

/**
 * Upsert province with error handling
 */
async function upsertProvince(
  code: string,
  name: string
): Promise<any> {
  try {
    return await prisma.province.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return await prisma.province.findUnique({ where: { code } });
    }
    return null;
  }
}

/**
 * Upsert regency/city with compound unique constraint handling
 */
async function upsertRegency(
  code: string,
  name: string,
  provinceId: number,
  type: 'regency' | 'city' = 'regency'
): Promise<any> {
  try {
    // Try compound unique constraint first
    return await prisma.regency.upsert({
      where: { code_provinceId: { code, provinceId } },
      update: { name, type },
      create: { code, name, type, provinceId },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Fallback: find by compound key
      return await prisma.regency.findFirst({
        where: { code, provinceId },
      });
    }
    return null;
  }
}

/**
 * Upsert district with compound unique constraint handling
 */
async function upsertDistrict(
  code: string,
  name: string,
  regencyId: number
): Promise<any> {
  try {
    // Try compound unique constraint first
    return await prisma.district.upsert({
      where: { code_regencyId: { code, regencyId } },
      update: { name },
      create: { code, name, regencyId },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Fallback: find by compound key
      return await prisma.district.findFirst({
        where: { code, regencyId },
      });
    }
    return null;
  }
}

/**
 * Upsert village with compound unique constraint handling
 */
async function upsertVillage(
  code: string,
  name: string,
  districtId: number,
  type: 'village' | 'urban_village' = 'village'
): Promise<any> {
  try {
    // Try compound unique constraint first
    return await prisma.village.upsert({
      where: { code_districtId: { code, districtId } },
      update: { name, type },
      create: { code, name, type, districtId },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Fallback: find by compound key
      return await prisma.village.findFirst({
        where: { code, districtId },
      });
    }
    return null;
  }
}

/**
 * Determine regency type from name
 */
function determineRegencyType(name: string): 'regency' | 'city' {
  return name.includes('KOTA') ? 'city' : 'regency';
}

/**
 * Determine village type from name
 */
function determineVillageType(name: string): 'village' | 'urban_village' {
  return name.includes('KELURAHAN') || name.includes('KEL') ? 'urban_village' : 'village';
}

/**
 * Main seeding function
 */
async function main() {
  try {
    console.log('🌱 Starting Indonesian Regions Seeding...\n');

    // Get all provinces
    const provinces = await getProvinces();
    if (!provinces || provinces.length === 0) {
      console.error('❌ Failed to fetch provinces.');
      process.exit(1);
    }
    console.log(`✓ Found ${provinces.length} provinces\n`);

    let totalRegencies = 0;
    let totalDistricts = 0;
    let totalVillages = 0;

    // Seed each province
    for (const province of provinces) {
      console.log(`🏙️  Seeding Province: ${province.province}`);

      // Upsert province
      const provincRecord = await upsertProvince(province.id, province.province);
      if (!provincRecord) {
        console.warn(`   ⚠️  Could not create province. Skipping.`);
        continue;
      }

      // Get cities/regencies
      const cities = await getCitiesByProvince(province.id);
      if (!cities || cities.length === 0) {
        console.warn(`   ⚠️  No regencies found.`);
        continue;
      }
      console.log(`   📍 ${cities.length} regencies/cities`);

      // Seed regencies
      const regenciesList: any[] = [];
      for (const city of cities) {
        const regencyRecord = await upsertRegency(
          city.id,
          city.name,
          provincRecord.id,
          determineRegencyType(city.name)
        );
        if (regencyRecord) {
          regenciesList.push({ record: regencyRecord, geonesia: city });
          totalRegencies++;
        }
      }

      // Seed districts and villages
      for (const regency of regenciesList) {
        const districts = await getDistrictsByCity(regency.geonesia.id);
        if (!districts || districts.length === 0) continue;

        const districtsList: any[] = [];
        for (const district of districts) {
          const districtRecord = await upsertDistrict(
            district.id,
            district.name,
            regency.record.id
          );
          if (districtRecord) {
            districtsList.push({ record: districtRecord, geonesia: district });
            totalDistricts++;
          }
        }

        // Seed villages
        for (const district of districtsList) {
          const villages = await getVillagesByDistrict(district.geonesia.id);
          if (!villages || villages.length === 0) continue;

          for (const village of villages) {
            const result = await upsertVillage(
              village.id,
              village.name,
              district.record.id,
              determineVillageType(village.name)
            );
            if (result) totalVillages++;
          }
        }

        process.stdout.write(`   ✓ ${regency.geonesia.name}\r`);
      }

      console.log(
        `   ✓ Completed ${regenciesList.length} regencies/cities for ${province.province}`
      );
    }

    // Final statistics
    console.log('\n\n✅ Seeding Complete!');
    console.log('══════════════════════════════');
    console.log(`📊 Indonesian Regions:`);
    console.log(`   • Provinces:        34`);
    console.log(`   • Regencies/Cities: ${totalRegencies}`);
    console.log(`   • Districts:        ${totalDistricts}`);
    console.log(`   • Villages:         ${totalVillages}`);
    console.log(`   • Total:            ${34 + totalRegencies + totalDistricts + totalVillages}`);
    console.log('══════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
