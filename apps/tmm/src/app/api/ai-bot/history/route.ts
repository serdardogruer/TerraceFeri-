import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const WA_HISTORY_FILE = path.join(DATA_DIR, 'whatsapp_history.json');
const VOICE_HISTORY_FILE = path.join(DATA_DIR, 'voice_history.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function GET(req: NextRequest) {
  try {
    ensureDataDir();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'whatsapp';

    const targetFile = type === 'voice' ? VOICE_HISTORY_FILE : WA_HISTORY_FILE;

    if (fs.existsSync(targetFile)) {
      const data = fs.readFileSync(targetFile, 'utf8');
      return NextResponse.json({ success: true, data: JSON.parse(data || '[]') });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    console.error('Error reading chat history:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    ensureDataDir();
    const body = await req.json();
    const { type = 'whatsapp', messages } = body;

    const targetFile = type === 'voice' ? VOICE_HISTORY_FILE : WA_HISTORY_FILE;

    fs.writeFileSync(targetFile, JSON.stringify(messages || [], null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving chat history:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
