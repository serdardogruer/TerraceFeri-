import { NextRequest, NextResponse } from 'next/server';
import { managementDb } from '../../../../modules/management/database/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const requests = await managementDb.managementRequest.findMany({
      where: {
        deletedAt: null,
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('Error fetching management requests:', error);
    return NextResponse.json({ success: false, message: 'Sunucu hatası: ' + (error?.message || String(error)) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ success: false, message: 'Başlık alanı zorunludur.' }, { status: 400 });
    }

    if (!body.type || !['MALZEME_TALEBI', 'BILGILENDIRME'].includes(body.type)) {
      return NextResponse.json({ success: false, message: 'Geçersiz talep türü.' }, { status: 400 });
    }

    const newRequest = await managementDb.managementRequest.create({
      data: {
        type: body.type,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        category: body.category || 'Genel',
        location: body.location || 'Tesis Geneli',
        urgency: body.urgency || 'Normal',
        status: body.status || 'Beklemede',
        estimatedCost: body.estimatedCost ? parseFloat(body.estimatedCost) : null,
        supplier: body.supplier?.trim() || null,
        itemsJson: body.itemsJson || '[]',
        managementResponse: body.managementResponse?.trim() || null,
        approvedBudget: body.approvedBudget ? parseFloat(body.approvedBudget) : null,
        requesterName: body.requesterName?.trim() || 'Serdar DOĞRUER (Teknik Sorumlu)',
        attachmentUrls: body.attachmentUrls || '[]',
      },
    });

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating management request:', error);
    return NextResponse.json({ success: false, message: 'Kayıt eklenemedi: ' + (error?.message || String(error)) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ success: false, message: 'Kayıt ID gereklidir.' }, { status: 400 });
    }

    const updated = await managementDb.managementRequest.update({
      where: { id: body.id },
      data: {
        type: body.type !== undefined ? body.type : undefined,
        title: body.title !== undefined ? body.title.trim() : undefined,
        description: body.description !== undefined ? (body.description?.trim() || null) : undefined,
        category: body.category !== undefined ? body.category : undefined,
        location: body.location !== undefined ? body.location : undefined,
        urgency: body.urgency !== undefined ? body.urgency : undefined,
        status: body.status !== undefined ? body.status : undefined,
        estimatedCost: body.estimatedCost !== undefined ? (body.estimatedCost ? parseFloat(body.estimatedCost) : null) : undefined,
        supplier: body.supplier !== undefined ? (body.supplier?.trim() || null) : undefined,
        itemsJson: body.itemsJson !== undefined ? body.itemsJson : undefined,
        managementResponse: body.managementResponse !== undefined ? (body.managementResponse?.trim() || null) : undefined,
        approvedBudget: body.approvedBudget !== undefined ? (body.approvedBudget ? parseFloat(body.approvedBudget) : null) : undefined,
        requesterName: body.requesterName !== undefined ? body.requesterName : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating management request:', error);
    return NextResponse.json({ success: false, message: 'Güncelleme başarısız: ' + (error?.message || String(error)) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID zorunludur.' }, { status: 400 });
    }

    await managementDb.managementRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Kayıt silindi.' });
  } catch (error: any) {
    console.error('Error deleting management request:', error);
    return NextResponse.json({ success: false, message: 'Silme işlemi başarısız: ' + (error?.message || String(error)) }, { status: 500 });
  }
}
