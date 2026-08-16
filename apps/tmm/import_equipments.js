const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma-clients/equipment');

async function importEquipments() {
  const prisma = new PrismaClient();
  const workbook = XLSX.readFile('c:/Users/PC/Desktop/TerraceFeri/2025 TEKNİK EKİPMAN LİSTESİ.xls');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(worksheet);

  // Skip the first row as it contains headers like 'EKİPMAN', 'FONKSİYON' etc in values
  const dataRows = json.slice(1);
  let added = 0;

  for (const row of dataRows) {
    const name = row['__EMPTY'];
    if (!name || typeof name !== 'string' || name.trim() === '') continue;

    const functionType = row['__EMPTY_1'] || '';
    const brand = row['__EMPTY_2'] || '';
    const model = row['__EMPTY_3'] || '';
    const serial = row['__EMPTY_4'] || '';
    const capacity = row['__EMPTY_7'] || '';
    const location = row['__EMPTY_8'] || '';

    const technicalDetails = [
      brand ? `Marka: ${brand}` : '',
      model ? `Model: ${model}` : '',
      serial ? `Seri No: ${serial}` : '',
      capacity ? `Kapasite: ${capacity}` : '',
      location ? `Lokasyon: ${location}` : ''
    ].filter(Boolean).join(' | ');

    await prisma.equipment.create({
      data: {
        name: name.trim(),
        type: functionType ? functionType.trim() : 'Genel Ekipman',
        technicalDetails: technicalDetails || null,
        duty: functionType ? functionType.trim() : null,
      }
    });
    added++;
  }

  console.log(`Successfully added ${added} equipments.`);
  await prisma.$disconnect();
}

importEquipments().catch(console.error);
