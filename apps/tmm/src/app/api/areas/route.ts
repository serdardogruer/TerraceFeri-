import { NextRequest, NextResponse } from 'next/server';
import { areaDb } from '../../../../modules/area/database/client';

export async function GET() {
  try {
    const areas = await areaDb.area.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: areas });
  } catch (error) {
    console.error('Error fetching areas:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newArea = await areaDb.area.create({
      data: {
        name: body.name,
        type: body.type,
        parentId: body.parentId || null,
        isDailyReport: body.isDailyReport,
        isMonthlyReport: body.isMonthlyReport,
        isManagerView: body.isManagerView,
        isHidden: body.isHidden
      }
    });

    return NextResponse.json({ success: true, data: newArea }, { status: 201 });
  } catch (error) {
    console.error('Error creating area:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updatedArea = await areaDb.area.update({
      where: { id: body.id },
      data: {
        name: body.name,
        type: body.type,
        parentId: body.parentId || null,
        isDailyReport: body.isDailyReport,
        isMonthlyReport: body.isMonthlyReport,
        isManagerView: body.isManagerView,
        isHidden: body.isHidden
      }
    });

    return NextResponse.json({ success: true, data: updatedArea });
  } catch (error) {
    console.error('Error updating area:', error);
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

    await areaDb.area.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting area:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
