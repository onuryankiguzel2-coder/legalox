// LegalOX claude-proxy — Supabase Edge Function
// Tarayıcıdan gelen istekleri Anthropic API'ye güvenli şekilde iletir (CORS dahil)
Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.text();
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01'
      },
      body
    });
    const data = await r.text();
    return new Response(data, { status: r.status, headers: { ...cors, 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: { message: String(e) } }), { status: 500, headers: { ...cors, 'content-type': 'application/json' } });
  }
});
