import { put, list } from '@vercel/blob';

export default async function handler(request, response) {
    const { method } = request;
    const BLOB_PATH = 'data/posts.json';

    try {
        // Mevcut dinamik yazıları getir
        let dynamicPosts = {};
        const { blobs } = await list({ prefix: BLOB_PATH });
        const existingBlob = blobs.find(b => b.pathname === BLOB_PATH);
        
        if (existingBlob) {
            const res = await fetch(existingBlob.url);
            dynamicPosts = await res.json();
        }

        if (method === 'GET') {
            return response.status(200).json(dynamicPosts);
        }

        if (method === 'POST' || method === 'PUT') {
            const { postId, postData } = request.body;
            if (!postId || !postData) {
                return response.status(400).json({ error: 'Post ID and data are required' });
            }

            dynamicPosts[postId] = postData;
            
            await put(BLOB_PATH, JSON.stringify(dynamicPosts), {
                access: 'public',
                contentType: 'application/json',
                addRandomSuffix: false
            });

            return response.status(200).json({ success: true });
        }

        if (method === 'DELETE') {
            const { postId } = request.query;
            if (!postId) {
                return response.status(400).json({ error: 'Post ID is required' });
            }

            if (dynamicPosts[postId]) {
                delete dynamicPosts[postId];
                await put(BLOB_PATH, JSON.stringify(dynamicPosts), {
                    access: 'public',
                    contentType: 'application/json',
                    addRandomSuffix: false
                });
                return response.status(200).json({ success: true });
            } else {
                return response.status(404).json({ error: 'Post not found' });
            }
        }

        return response.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Blob Error:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
