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
    const BLOB_PATH = 'data/comments.json';

    try {
        let comments = [];
        try {
            const { blobs } = await list();
            const existingBlob = blobs.find(b => b.pathname === BLOB_PATH);
            
            if (existingBlob) {
                const res = await fetch(existingBlob.url);
                if (res.ok) {
                    comments = await res.json();
                }
            }
        } catch (listError) {
            console.error('List Error (Normal if first time):', listError);
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
            
            await put(BLOB_PATH, JSON.stringify(comments), {
                access: 'public',
                contentType: 'application/json',
                addRandomSuffix: false
            });

            return response.status(201).json(newComment);
        }

        if (method === 'DELETE') {
            const { id } = request.query;
            if (!id) {
                return response.status(400).json({ error: 'Comment ID is required' });
            }

            comments = comments.filter(c => c.id !== parseInt(id) && String(c.id) !== String(id));
            
            await put(BLOB_PATH, JSON.stringify(comments), {
                access: 'public',
                contentType: 'application/json',
                addRandomSuffix: false
            });

            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Blob Server Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
