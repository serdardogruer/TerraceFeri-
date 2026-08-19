import { NextRequest, NextResponse } from 'next/server';
import { MetersDB } from '@/lib/meters-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search')?.toLowerCase();

    const [allReadings, meters] = await Promise.all([
      MetersDB.getReadings(),
      MetersDB.getMeters()
    ]);

    let filtered = [...allReadings];

    if (type && type !== 'Hepsi') {
      filtered = filtered.filter(m => m.type.toLowerCase() === type.toLowerCase());
    }

    if (search) {
      filtered = filtered.filter(m => 
        m.readDate.toLowerCase().includes(search) ||
        m.meterNo.toLowerCase().includes(search) || 
        (m.location && m.location.toLowerCase().includes(search)) ||
        (m.notes && m.notes.toLowerCase().includes(search))
      );
    }

    // Sort by readDate descending, then readTime descending
    filtered.sort((a, b) => {
      const dateA = `${a.readDate}T${a.readTime || '00:00'}`;
      const dateB = `${b.readDate}T${b.readTime || '00:00'}`;
      return dateB.localeCompare(dateA);
    });

    return NextResponse.json({ success: true, data: filtered, meters });
  } catch (error) {
    console.error('Error fetching meters:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const now = new Date();
    const readDate = body.readDate || now.toISOString().split('T')[0];
    const readTime = body.readTime || now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const [meters, allReadings] = await Promise.all([
      MetersDB.getMeters(),
      MetersDB.getReadings()
    ]);

    let selectedMeter = meters.find(m => m.id === body.meterId);
    if (!selectedMeter) {
      selectedMeter = meters.find(m => m.type === (body.type || 'Elektrik')) || meters[0];
    }
    
    // Find previous day's reading
    const prevReading = allReadings.find(r => r.meterId === selectedMeter.id && r.readDate < readDate);

    const newReading = {
      id: body.id || `r-${readDate}-${selectedMeter.id}`,
      meterId: selectedMeter.id,
      meterNo: selectedMeter.meterNo,
      type: selectedMeter.type,
      location: selectedMeter.location || '',
      unit: selectedMeter.unit,
      readDate,
      readTime,
      aktif: Number(body.aktif) || 0,
      prevAktif: Number(body.prevAktif) || (prevReading ? prevReading.aktif : Number(body.aktif) || 0),
      reaktif: Number(body.reaktif) || 0,
      prevReaktif: Number(body.prevReaktif) || (prevReading ? prevReading.reaktif : Number(body.reaktif) || 0),
      kapasitif: Number(body.kapasitif) || 0,
      prevKapasitif: Number(body.prevKapasitif) || (prevReading ? prevReading.kapasitif : Number(body.kapasitif) || 0),
      value: Number(body.value) || 0,
      prevValue: Number(body.prevValue) || (prevReading ? prevReading.value : Number(body.value) || 0),
      status: body.status || 'Normal',
      notes: body.notes || 'Günlük okuma kaydı'
    };

    const saved = await MetersDB.addOrUpdateReading(newReading);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error creating meter reading:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const allReadings = await MetersDB.getReadings();
    const current = allReadings.find(m => m.id === body.id);
    
    if (!current) {
      // If not found by ID, attempt create/upsert
      return POST(req);
    }

    const updated = {
      ...current,
      meterNo: body.meterNo !== undefined ? body.meterNo : current.meterNo,
      type: body.type !== undefined ? body.type : current.type,
      location: body.location !== undefined ? body.location : current.location,
      readDate: body.readDate !== undefined ? body.readDate : current.readDate,
      readTime: body.readTime !== undefined ? body.readTime : current.readTime,
      aktif: body.aktif !== undefined ? Number(body.aktif) : current.aktif,
      prevAktif: body.prevAktif !== undefined ? Number(body.prevAktif) : current.prevAktif,
      reaktif: body.reaktif !== undefined ? Number(body.reaktif) : current.reaktif,
      prevReaktif: body.prevReaktif !== undefined ? Number(body.prevReaktif) : current.prevReaktif,
      kapasitif: body.kapasitif !== undefined ? Number(body.kapasitif) : current.kapasitif,
      prevKapasitif: body.prevKapasitif !== undefined ? Number(body.prevKapasitif) : current.prevKapasitif,
      value: body.value !== undefined ? Number(body.value) : current.value,
      prevValue: body.prevValue !== undefined ? Number(body.prevValue) : current.prevValue,
      status: body.status !== undefined ? body.status : current.status,
      notes: body.notes !== undefined ? body.notes : current.notes,
    };

    const saved = await MetersDB.addOrUpdateReading(updated);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error updating meter reading:', error);
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

    const ok = await MetersDB.deleteReading(id);
    return NextResponse.json({ success: ok, message: ok ? 'Deleted successfully' : 'Not found' });
  } catch (error) {
    console.error('Error deleting meter reading:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
