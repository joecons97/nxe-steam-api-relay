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

    if (!context.env.API_KEYS) {
        return new Response(JSON.stringify({ error: 'KV namespace not bound' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (context.request.method !== 'POST') {
        return new Response(`${context.request.method} Method Not Allowed`, { status: 405 });
    }

    try {
        const { token, encryptedData } = await context.request.json();

        if (!token || !encryptedData) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Store in KV with 10 minute expiration
        await context.env.API_KEYS.put(token, encryptedData, { expirationTtl: 600 });

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