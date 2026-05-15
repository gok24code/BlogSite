import { put, list } from '@vercel/blob';

export default async function handler(request, response) {
    const { method } = request;
    const BLOB_PATH = 'blog-posts.json';

    try {
        let dynamicPosts = {};
        try {
            const { blobs } = await list();
            const existingBlob = blobs.find(b => b.pathname === BLOB_PATH || b.pathname.endsWith('/' + BLOB_PATH));
            
            if (existingBlob) {
                const res = await fetch(existingBlob.url);
                if (res.ok) {
                    const data = await res.json();
                    dynamicPosts = (data && typeof data === 'object') ? data : {};
                }
            }
        } catch (e) {
            console.error('[API] Posts List Error:', e);
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
            if (!postId) return response.status(400).json({ error: 'Post ID required' });

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
        console.error('[API] CRITICAL POSTS ERROR:', error);
        return response.status(500).json({ error: error.message });
    }
}
