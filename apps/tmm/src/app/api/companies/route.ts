import { NextRequest, NextResponse } from 'next/server';
import { companyDb } from '../../../../modules/company/database/client';

export async function GET() {
  try {
    const companies = await companyDb.company.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ success: true, data: companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newCompany = await companyDb.company.create({
      data: {
        name: body.name,
        serviceType: body.serviceType || null,
        contactPerson: body.contactPerson || null,
        phone: body.phone || null,
        email: body.email || null,
        contractStatus: body.contractStatus || 'Active',
        contractDate: body.contractDate ? new Date(body.contractDate) : null,
        contractDuration: body.contractDuration ? parseInt(body.contractDuration, 10) : null,
        notes: body.notes || null,
        reportFields: body.reportFields || '["name","serviceType","contractStatus"]',
      }
    });

    return NextResponse.json({ success: true, data: newCompany }, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updatedCompany = await companyDb.company.update({
      where: { id: body.id },
      data: {
        name: body.name,
        serviceType: body.serviceType || null,
        contactPerson: body.contactPerson || null,
        phone: body.phone || null,
        email: body.email || null,
        contractStatus: body.contractStatus || 'Active',
        contractDate: body.contractDate ? new Date(body.contractDate) : null,
        contractDuration: body.contractDuration ? parseInt(body.contractDuration, 10) : null,
        notes: body.notes || null,
        reportFields: body.reportFields || '["name","serviceType","contractStatus"]',
      }
    });

    return NextResponse.json({ success: true, data: updatedCompany });
  } catch (error) {
    console.error('Error updating company:', error);
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

    await companyDb.company.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
