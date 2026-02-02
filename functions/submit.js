export async function onRequest(context) {
    // CORS preflight
    if (context.request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    if (context.request.method !== 'POST') {
        return new Response(`${context.request.method} Method Not Allowed`, { status: 405 });
    }

    try {
        const { code, apiKey } = await context.request.json();

        if (!code || !apiKey) {
            return new Response(JSON.stringify({ error: 'Missing code or apiKey' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Store in KV with 10 minute expiration
        await context.env.API_KEYS.put(code, apiKey, { expirationTtl: 600 });

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}