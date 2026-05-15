import { put, list, del } from '@vercel/blob';

// Basit bir küfür filtresi (Örnek amaçlı, liste genişletilebilir)
const profanityList = ['küfür1', 'küfür2', 'argo1', 'çirkin-kelime']; // Buraya gerçek kelimeleri ekleyebilirsiniz

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
        // Mevcut yorumları getir
        let comments = [];
        const { blobs } = await list({ prefix: BLOB_PATH });
        const existingBlob = blobs.find(b => b.pathname === BLOB_PATH);
        
        if (existingBlob) {
            const res = await fetch(existingBlob.url);
            comments = await res.json();
        }

        if (method === 'GET') {
            return response.status(200).json(comments);
        }

        if (method === 'POST') {
            const newComment = request.body;
            if (!newComment || !newComment.text) {
                return response.status(400).json({ error: 'Comment text is required' });
            }

            // Küfür Filtresi Uygula
            newComment.text = filterText(newComment.text);

            comments.push(newComment);
            
            // Dosyayı güncelle (Blob'da üzerine yazma doğrudan yok, aynı isimle yeni yüklenir)
            await put(BLOB_PATH, JSON.stringify(comments), {
                access: 'public',
                contentType: 'application/json',
                addRandomSuffix: false // İsmin sabit kalmasını sağlar
            });

            return response.status(201).json(newComment);
        }

        if (method === 'DELETE') {
            const { id } = request.query;
            if (!id) {
                return response.status(400).json({ error: 'Comment ID is required' });
            }

            comments = comments.filter(c => c.id !== parseInt(id) && c.id !== id);
            
            await put(BLOB_PATH, JSON.stringify(comments), {
                access: 'public',
                contentType: 'application/json',
                addRandomSuffix: false
            });

            return response.status(200).json({ success: true });
        }

        return response.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Blob Error:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
