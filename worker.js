const SYNC_PIN = 'memo2024';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/sync') {
      const pin = request.headers.get('x-sync-pin');
      const cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-sync-pin',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: cors });
      }
      if (pin !== SYNC_PIN) {
        return new Response('{"error":"Invalid PIN"}', {
          status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      if (request.method === 'GET') {
        const data = await env.MEMO_STORE.get('sync_data');
        return new Response(data || '{"notes":[],"folders":[]}', {
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      if (request.method === 'POST') {
        const body = await request.text();
        await env.MEMO_STORE.put('sync_data', body);
        return new Response('{"ok":true}', {
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    // 静的ファイルはCloudflare Pagesが処理
    return new Response('Not found', { status: 404 });
  },
};
