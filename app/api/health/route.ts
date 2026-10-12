import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const uptime = process.uptime ? process.uptime() : 0;
  const memoryUsage = process.memoryUsage ? process.memoryUsage().rss : 0;

  return NextResponse.json(
    {
      status: 'healthy',
      app: 'Portal News',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(uptime),
      memoryRssMb: Math.round(memoryUsage / (1024 * 1024)),
      environment: process.env.NODE_ENV || 'production',
      platform: process.env.VERCEL ? 'vercel-serverless' : process.env.NETLIFY ? 'netlify-serverless' : 'dedicated-node',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
