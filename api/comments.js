import { put, list } from '@vercel/blob';

const profanityList = ['küfür1', 'küfür2', 'argo1', 'çirkin-kelime'];

function filterText(text) {
    let filteredText = text;
    profanityList.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredText = filteredText.replace(regex, '***');
    });
    return filteredText;
}

export default async function handler(request, response) {
    const { method } = request;
    const BLOB_PATH = 'blog-comments.json';

    try {
        console.log(`[API] Method: ${method}, Path: ${BLOB_PATH}`);
        
        let comments = [];
        try {
            // Try to find the blob
            const { blobs } = await list();
            // Filter by exact match or ending with our path
            const existingBlob = blobs.find(b => b.pathname === BLOB_PATH || b.pathname.endsWith('/' + BLOB_PATH));
            
            if (existingBlob) {
                console.log(`[API] Fetching from: ${existingBlob.url}`);
                const res = await fetch(existingBlob.url);
                if (res.ok) {
                    const data = await res.json();
                    comments = Array.isArray(data) ? data : [];
                }
            } else {
                console.log('[API] Blob not found, starting with empty array');
            }
        } catch (e) {
            console.error('[API] Error during list/fetch:', e);
        }

        if (method === 'GET') {
            return response.status(200).json(comments);
        }

        if (method === 'POST') {
            const newComment = request.body;
            if (!newComment || !newComment.text) {
                return response.status(400).json({ error: 'Comment text is required' });
            }

            newComment.text = filterText(newComment.text);
            comments.push(newComment);
            
            console.log('[API] Saving to Blob...');
            const blob = await put(BLOB_PATH, JSON.stringify(comments), {
                access: 'public',
                contentType: 'application/json',
                addRandomSuffix: false
            });
            console.log(`[API] Saved to: ${blob.url}`);

            return response.status(201).json(newComment);
        }

        if (method === 'DELETE') {
            const { id } = request.query;
            if (!id) return response.status(400).json({ error: 'ID required' });

            comments = comments.filter(c => String(c.id) !== String(id));
            
            await put(BLOB_PATH, JSON.stringify(comments), {
                access: 'public',
                contentType: 'application/json',
                addRandomSuffix: false
            });

            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[API] CRITICAL ERROR:', error);
        return response.status(500).json({ error: error.message });
    }
}
