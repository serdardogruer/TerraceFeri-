import { NextRequest, NextResponse } from 'next/server';
import { MetersDB } from '@/lib/meters-db';

export async function GET() {
  try {
    const meters = await MetersDB.getMeters();
    return NextResponse.json({ success: true, data: meters });
  } catch (error) {
    console.error('Error fetching meters registry:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.meterNo || !body.type) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const newMeter = {
      id: `m-${Date.now()}`,
      meterNo: body.meterNo,
      name: body.name || `${body.type} Sayacı`,
      type: body.type,
      unit: body.type === 'Elektrik' ? 'kWh' : 'm³',
      location: body.location || null
    };

    const saved = await MetersDB.addMeter(newMeter);

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error creating new meter:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Meter ID required' }, { status: 400 });
    }

    const ok = await MetersDB.deleteMeter(id);

    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error('Error deleting meter:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
