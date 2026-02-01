import type { VercelRequest, VercelResponse } from '@vercel/node';
import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'media'],
            ['content:encoded', 'contentEncoded'],
            ['media:thumbnail', 'thumbnail']
        ]
    }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid URL parameter' });
    }

    try {
        const feed = await parser.parseURL(url);
        return res.status(200).json(feed);
    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch RSS feed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
