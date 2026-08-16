import { NextRequest, NextResponse } from 'next/server';
import { MetersDB } from '@/lib/meters-db';

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: MetersDB.getMeters() });
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
      unit: body.type === 'Elektrik' ? 'kWh' : 'm³'
    };

    MetersDB.addMeter(newMeter);

    return NextResponse.json({ success: true, data: newMeter });
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

    const ok = MetersDB.deleteMeter(id);

    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error('Error deleting meter:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
