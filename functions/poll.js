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
        const key = url.searchParams.get('key');

        if (!key) {
            return new Response(JSON.stringify(), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const raw = await context.env.API_KEYS.get(key);

        if (raw) {
            const data = JSON.parse(raw);
            // data.apiKey, data.userId now available
            
            await context.env.API_KEYS.delete(key);
            
            return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Key hasn't been submitted yet
        return new Response(JSON.stringify(), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: 'Something went wrong' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}