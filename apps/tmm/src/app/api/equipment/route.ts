import { NextRequest, NextResponse } from 'next/server';
import { equipmentDb } from '../../../../modules/equipment/database/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const areaId = searchParams.get('areaId');

    const equipment = await equipmentDb.equipment.findMany({
      where: { 
        deletedAt: null,
        ...(areaId ? { areaId } : {})
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: equipment });
  } catch (error) {
    console.error('Equipment GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const newEquipment = await equipmentDb.equipment.create({
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
        isHidden: body.isHidden
      }
    });

    return NextResponse.json({ success: true, data: newEquipment });
  } catch (error) {
    console.error('Equipment POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create equipment' }, { status: 500 });
  }
}
