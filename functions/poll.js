export async function onRequest(context) {
    if (context.request.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    if (!context.env.API_KEYS) {
        return new Response(JSON.stringify({ error: 'KV namespace not bound' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const url = new URL(context.request.url);
        const code = url.searchParams.get('code');

        if (!code) {
            return new Response(JSON.stringify({ error: 'Missing code' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const raw = await context.env.API_KEYS.get(code);

        if (raw) {
            const data = JSON.parse(raw);
            // data.apiKey, data.userId now available
            
            await context.env.API_KEYS.delete(code);
            
            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Key hasn't been submitted yet
        return new Response(JSON.stringify(null), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}