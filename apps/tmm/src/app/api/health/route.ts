import { NextResponse } from 'next/server';
import { coreDb } from '@modules/core/database/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    // Test basic query
    await coreDb.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'connected';
  } catch (error: any) {
    dbStatus = `error: ${error?.message || 'DB unreachable'}`;
  }

  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    service: 'TerraceFeri TMM Core',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    system: {
      nodeVersion: process.version,
      memoryRssMb: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    },
    responseTimeMs: Date.now() - startTime,
  };

  const statusCode = dbStatus === 'connected' ? 200 : 503;
  return NextResponse.json(healthData, { status: statusCode });
}
