export async function onRequest(context) {
    if (context.request.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
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

        const apiKey = await context.env.API_KEYS.get(code);

        if (apiKey) {
            // Delete after retrieval - one time use
            await context.env.API_KEYS.delete(code);

            return new Response(JSON.stringify({ apiKey }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Key hasn't been submitted yet
        return new Response(JSON.stringify({ apiKey: null }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Something went wrong' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}