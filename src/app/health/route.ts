const startedAt = Date.now();

export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({
    status: 'ok',
    app: 'bbk-explorer-front',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startedAt) / 1000),
  });
}
