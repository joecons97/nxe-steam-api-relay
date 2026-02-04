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
        const token = url.searchParams.get('token');

        if (!token) {
            return new Response(JSON.stringify(), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const encryptedData = await context.env.API_KEYS.get(token);

        if (encryptedData) {
            // Delete after retrieval
            await context.env.API_KEYS.delete(token);

            return new Response(JSON.stringify({ encryptedData }), {
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