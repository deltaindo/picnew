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
 * Upsert province
 */
async function upsertProvince(
  code: string,
  name: string
): Promise<any> {
  return await prisma.province.upsert({
    where: { code },
    update: {},
    create: {
      code,
      name,
    },
  });
}

/**
 * Upsert regency/city
 */
async function upsertRegency(
  code: string,
  name: string,
  provinceId: number,
  type: 'regency' | 'city' = 'regency'
): Promise<any> {
  return await prisma.regency.upsert({
    where: { code },
    update: {},
    create: {
      code,
      name,
      type,
      provinceId,
    },
  });
}

/**
 * Upsert district
 */
async function upsertDistrict(
  code: string,
  name: string,
  regencyId: number
): Promise<any> {
  return await prisma.district.upsert({
    where: { code },
    update: {},
    create: {
      code,
      name,
      regencyId,
    },
  });
}

/**
 * Upsert village
 */
async function upsertVillage(
  code: string,
  name: string,
  districtId: number,
  type: 'village' | 'urban_village' = 'village'
): Promise<any> {
  return await prisma.village.upsert({
    where: { code },
    update: {},
    create: {
      code,
      name,
      type,
      districtId,
    },
  });
}

/**
 * Batch insert with chunking to avoid memory issues
 */
async function batchInsert<T>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<any>
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processor));
    
    const progress = Math.min(i + batchSize, items.length);
    process.stdout.write(`\r  Progress: ${progress}/${items.length}`);
  }
  console.log('\n');
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

    // Seed each province with its regencies, districts, and villages
    for (const province of provinces) {
      console.log(`\n🏙️  Seeding Province: ${province.province} (${province.id})`);

      // Upsert province
      const provincRecord = await upsertProvince(province.id, province.province);

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
        regenciesList.push({ record: regencyRecord, geonesia: city });
        totalRegencies++;
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
          districtsList.push({ record: districtRecord, geonesia: district });
          totalDistricts++;
        }

        // Seed villages for each district
        for (const district of districtsList) {
          const villages = await getVillagesByDistrict(district.geonesia.id);

          if (villages.length > 0) {
            // Seed villages in batch with chunking
            const villageProcessors = villages.map(village => async () => {
              const villageType = determineVillageType(village.name);
              await upsertVillage(
                village.id,
                village.name,
                district.record.id,
                villageType
              );
              totalVillages++;
            });

            // Process villages with concurrency control
            const CONCURRENCY = 10;
            for (let i = 0; i < villageProcessors.length; i += CONCURRENCY) {
              const batch = villageProcessors.slice(i, i + CONCURRENCY);
              await Promise.all(batch.map(p => p()));
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
