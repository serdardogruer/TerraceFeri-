import { NextRequest, NextResponse } from 'next/server';
import { apartmentDb } from '../../../../modules/apartment/database/client';

export async function GET() {
  try {
    const apartments = await apartmentDb.apartment.findMany({
      where: { deletedAt: null },
      orderBy: [
        { block: 'asc' },
        { unit: 'asc' }
      ],
    });
    return NextResponse.json({ success: true, data: apartments });
  } catch (error) {
    console.error('Error fetching apartments:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newApartment = await apartmentDb.apartment.create({
      data: {
        block: body.block,
        unit: body.unit,
        shortCode: body.shortCode,
        residentName: body.residentName,
        status: body.status,
        floor: body.floor,
        type: body.type,
        phone: body.phone || null,
        plate1: body.plate1 || null,
        plate2: body.plate2 || null,
        plate3: body.plate3 || null,
      }
    });

    return NextResponse.json({ success: true, data: newApartment }, { status: 201 });
  } catch (error) {
    console.error('Error creating apartment:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updatedApartment = await apartmentDb.apartment.update({
      where: { id: body.id },
      data: {
        block: body.block,
        unit: body.unit,
        shortCode: body.shortCode,
        residentName: body.residentName,
        status: body.status,
        floor: body.floor,
        type: body.type,
        phone: body.phone || null,
        plate1: body.plate1 || null,
        plate2: body.plate2 || null,
        plate3: body.plate3 || null,
      }
    });

    return NextResponse.json({ success: true, data: updatedApartment });
  } catch (error) {
    console.error('Error updating apartment:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    await apartmentDb.apartment.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting apartment:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
