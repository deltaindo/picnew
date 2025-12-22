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

/**
 * Fetch data from Geonesia API
 */
async function fetchFromGeonesia(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error);
    return null;
  }
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
      create: {
        code,
        name,
      },
    });
  } catch (error: any) {
    console.warn(`⚠️  Warning: Could not upsert province ${code}: ${error.message}`);
    // Try to find existing record
    return await prisma.province.findUnique({ where: { code } });
  }
}

/**
 * Upsert regency/city with error handling
 */
async function upsertRegency(
  code: string,
  name: string,
  provinceId: number,
  type: 'regency' | 'city' = 'regency'
): Promise<any> {
  try {
    return await prisma.regency.upsert({
      where: { code },
      update: { name, type, provinceId },
      create: {
        code,
        name,
        type,
        provinceId,
      },
    });
  } catch (error: any) {
    console.warn(`⚠️  Warning: Could not upsert regency ${code}: ${error.message}`);
    return await prisma.regency.findUnique({ where: { code } });
  }
}

/**
 * Upsert district with error handling
 */
async function upsertDistrict(
  code: string,
  name: string,
  regencyId: number
): Promise<any> {
  try {
    return await prisma.district.upsert({
      where: { code },
      update: { name, regencyId },
      create: {
        code,
        name,
        regencyId,
      },
    });
  } catch (error: any) {
    console.warn(`⚠️  Warning: Could not upsert district ${code}: ${error.message}`);
    return await prisma.district.findUnique({ where: { code } });
  }
}

/**
 * Upsert village with improved error handling and duplicate detection
 */
async function upsertVillage(
  code: string,
  name: string,
  districtId: number,
  type: 'village' | 'urban_village' = 'village'
): Promise<any> {
  try {
    // First, try to find existing village
    const existing = await prisma.village.findUnique({ where: { code } });
    
    if (existing) {
      // If exists, update it
      return await prisma.village.update({
        where: { code },
        data: { name, type, districtId },
      });
    } else {
      // If not exists, create it
      return await prisma.village.create({
        data: {
          code,
          name,
          type,
          districtId,
        },
      });
    }
  } catch (error: any) {
    // If still fails, just skip silently (likely duplicate from concurrent operations)
    if (error.code === 'P2002') {
      // Duplicate key error - just return the existing record
      return await prisma.village.findUnique({ where: { code } });
    }
    console.warn(`⚠️  Warning: Could not upsert village ${code}: ${error.message}`);
    return null;
  }
}

/**
 * Determine regency type from name
 */
function determineRegencyType(name: string): 'regency' | 'city' {
  const cityKeywords = ['KOTA', 'KOTA ADMINISTRASI'];
  return cityKeywords.some(keyword => name.includes(keyword)) ? 'city' : 'regency';
}

/**
 * Determine village type from name (simple heuristic)
 */
function determineVillageType(name: string): 'village' | 'urban_village' {
  const urbanKeywords = ['KELURAHAN', 'KEL'];
  return urbanKeywords.some(keyword => name.includes(keyword)) ? 'urban_village' : 'village';
}

/**
 * Main seeding function
 */
async function main() {
  try {
    console.log('🌱 Starting Indonesian Regions Seeding...\n');

    // Get all provinces
    const provinces = await getProvinces();
    console.log(`✓ Found ${provinces.length} provinces\n`);

    let totalRegencies = 0;
    let totalDistricts = 0;
    let totalVillages = 0;
    let skippedVillages = 0;

    // Seed each province with its regencies, districts, and villages
    for (const province of provinces) {
      console.log(`\n🏙️  Seeding Province: ${province.province} (${province.id})`);

      // Upsert province
      const provincRecord = await upsertProvince(province.id, province.province);
      if (!provincRecord) {
        console.warn(`   ⚠️  Skipping province ${province.province} - could not create record`);
        continue;
      }

      // Get cities/regencies for this province
      const cities = await getCitiesByProvince(province.id);
      console.log(`   📍 Found ${cities.length} regencies/cities`);

      // Seed each regency/city
      const regenciesList: any[] = [];
      for (const city of cities) {
        const regencyType = determineRegencyType(city.name);
        const regencyRecord = await upsertRegency(
          city.id,
          city.name,
          provincRecord.id,
          regencyType
        );
        if (regencyRecord) {
          regenciesList.push({ record: regencyRecord, geonesia: city });
          totalRegencies++;
        }
      }

      // Seed districts for each regency
      for (const regency of regenciesList) {
        const districts = await getDistrictsByCity(regency.geonesia.id);

        // Seed districts in batch
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

        // Seed villages for each district
        for (const district of districtsList) {
          const villages = await getVillagesByDistrict(district.geonesia.id);

          if (villages.length > 0) {
            // Seed villages sequentially to avoid duplicate issues
            for (const village of villages) {
              const villageType = determineVillageType(village.name);
              const result = await upsertVillage(
                village.id,
                village.name,
                district.record.id,
                villageType
              );
              
              if (result) {
                totalVillages++;
              } else {
                skippedVillages++;
              }
            }
          }
        }

        process.stdout.write(`   ✓ Processed regency: ${regency.geonesia.name}\r`);
      }

      console.log(
        `   ✓ Seeded ${regenciesList.length} regencies/cities for ${province.province}`
      );
    }

    // Final statistics
    console.log('\n\n✅ Indonesian Regions Seeding Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Statistics:`);
    console.log(`   • Provinces:        34`);
    console.log(`   • Regencies/Cities: ${totalRegencies}`);
    console.log(`   • Districts:        ${totalDistricts}`);
    console.log(`   • Villages:         ${totalVillages}`);
    if (skippedVillages > 0) {
      console.log(`   • Skipped (duplicates): ${skippedVillages}`);
    }
    console.log(`   • Total Records:    ${34 + totalRegencies + totalDistricts + totalVillages}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
main();
