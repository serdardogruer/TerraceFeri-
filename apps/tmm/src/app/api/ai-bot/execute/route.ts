import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/modules/ai-bot/ai-service';
import { CommandExecutor } from '@/modules/ai-bot/command-executor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.message || body.text || '';

    if (!text) {
      return NextResponse.json({ success: false, message: 'Mesaj metni boş olamaz' }, { status: 400 });
    }

    // 1. AI Intent Parse
    const parsedCommand = await AIService.parseCommand(text);

    // 2. Command Execution
    const executionResult = await CommandExecutor.execute(parsedCommand);

    return NextResponse.json({
      success: executionResult.success,
      intent: parsedCommand.intent,
      summary: parsedCommand.summary,
      message: executionResult.message,
      data: executionResult.data
    });
  } catch (error: any) {
    console.error('AI Bot webhook execution error:', error);
    return NextResponse.json({
      success: false,
      message: `İşlem hatası: ${error?.message || String(error)}`
    }, { status: 500 });
  }
}
