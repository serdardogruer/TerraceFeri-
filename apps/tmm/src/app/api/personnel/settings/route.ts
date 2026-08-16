import { NextResponse } from 'next/server';
import { prismaPersonnel } from '../../../../../modules/personnel/database/client';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const newSetting = await prismaPersonnel.locationSetting.create({
      data: {
        locationId: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000),
        name: data.name,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        allowedRadiusMeters: parseInt(data.allowedRadiusMeters, 10),
        allowedIps: Array.isArray(data.allowedIps) ? data.allowedIps : [],
      }
    });

    return NextResponse.json({ success: true, setting: newSetting });
  } catch (error: any) {
    console.error('Error creating location setting:', error);
    return NextResponse.json({ error: error.message || 'Ayarlar kaydedilirken hata oluştu.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();

    if (!data.id) {
      return NextResponse.json({ error: 'ID eksik.' }, { status: 400 });
    }

    const updatedSetting = await prismaPersonnel.locationSetting.update({
      where: { id: data.id },
      data: {
        name: data.name,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        allowedRadiusMeters: parseInt(data.allowedRadiusMeters, 10),
        allowedIps: Array.isArray(data.allowedIps) ? data.allowedIps : [],
      }
    });

    return NextResponse.json({ success: true, setting: updatedSetting });
  } catch (error: any) {
    console.error('Error updating location setting:', error);
    return NextResponse.json({ error: error.message || 'Ayarlar güncellenirken hata oluştu.' }, { status: 500 });
  }
}
