import { NextRequest, NextResponse } from 'next/server';
import { equipmentDb } from '../../../../modules/equipment/database/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const areaId = searchParams.get('areaId');
    const id = searchParams.get('id');

    if (id) {
      const equipment = await equipmentDb.equipment.findFirst({
        where: { id, deletedAt: null }
      });
      return NextResponse.json({ success: true, data: equipment });
    }

    const equipments = await equipmentDb.equipment.findMany({
      where: {
        deletedAt: null,
        ...(areaId ? { areaId } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: equipments });
  } catch (error) {
    console.error('Error fetching equipments:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.areaId) {
      return NextResponse.json({ success: false, message: 'areaId is required' }, { status: 400 });
    }

    const newEq = await equipmentDb.equipment.create({
      data: {
        areaId: body.areaId,
        name: body.name,
        code: body.code || null,
        type: body.type,
        isDailyReport: body.isDailyReport || false,
        isMonthlyReport: body.isMonthlyReport || false,
        isManagerView: body.isManagerView ?? true,
        isHidden: body.isHidden || false,
      }
    });

    return NextResponse.json({ success: true, data: newEq }, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updatedEq = await equipmentDb.equipment.update({
      where: { id: body.id },
      data: {
        areaId: body.areaId,
        name: body.name,
        code: body.code,
        type: body.type,
        technicalDetails: body.technicalDetails,
        workingPrinciple: body.workingPrinciple,
        duty: body.duty,
        usageInfo: body.usageInfo,
        practicalInfo: body.practicalInfo,
        possibleFaults: body.possibleFaults,
        isDailyReport: body.isDailyReport,
        isMonthlyReport: body.isMonthlyReport,
        isManagerView: body.isManagerView,
        isHidden: body.isHidden,
      }
    });

    return NextResponse.json({ success: true, data: updatedEq });
  } catch (error) {
    console.error('Error updating equipment:', error);
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

    await equipmentDb.equipment.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
