// RSS 解析和管理服务
import type { Feed, Article, RSSFeed, RSSItem } from '@/types';
import { db } from './db.service';

class RSSService {
    /**
     * 获取 RSS Feed
     */
    async fetchFeed(feedUrl: string): Promise<RSSFeed> {
        try {
            // 使用 Vercel Serverless Function 作为代理
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL || '/api'}/rss-proxy?url=${encodeURIComponent(feedUrl)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const feed = await response.json();

            return {
                title: feed.title || 'Unknown Feed',
                description: feed.description,
                link: feed.link,
                items: feed.items.map((item: any) => this.parseItem(item))
            };
        } catch (error) {
            console.error('Error fetching RSS feed:', error);
            throw new Error(`Failed to fetch feed: ${feedUrl}`);
        }
    }

    /**
     * 解析 RSS Item
     */
    private parseItem(item: any): RSSItem {
        const content = item.contentEncoded || item.content || item.summary || '';
        const thumbnail = this.extractThumbnail(item);

        return {
            title: item.title || 'Untitled',
            link: item.link || '',
            content: content,
            summary: this.createSummary(content),
            author: item.creator || item.author || undefined,
            pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            guid: item.guid || item.link || this.generateGuid(item),
            thumbnail
        };
    }

    /**
     * 提取缩略图
     */
    private extractThumbnail(item: any): string | undefined {
        // 尝试从多个字段提取图片
        if (item.thumbnail?.url) return item.thumbnail.url;
        if (item.media?.url) return item.media.url;
        if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
            return item.enclosure.url;
        }

        // 从内容中提取第一张图片
        const content = item.contentEncoded || item.content || '';
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        return imgMatch ? imgMatch[1] : undefined;
    }

    /**
     * 创建摘要
     */
    private createSummary(content: string, maxLength = 200): string {
        const text = content.replace(/<[^>]*>/g, '').trim();
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    /**
     * 生成唯一 GUID
     */
    private generateGuid(item: any): string {
        const str = `${item.title}-${item.link}-${item.pubDate}`;
        return btoa(str).substring(0, 32);
    }

    /**
     * 添加订阅源
     */
    async addFeed(url: string, category = '未分类'): Promise<Feed> {
        try {
            const feedData = await this.fetchFeed(url);

            const feed: Feed = {
                url,
                title: feedData.title,
                category,
                updateInterval: 30,
                lastUpdate: new Date(),
                unreadCount: 0
            };

            const feedId = await db.addFeed(feed);
            feed.id = feedId;

            // 添加文章
            await this.updateFeedArticles(feedId, feedData.items);

            return feed;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 更新订阅源文章
     */
    async updateFeedArticles(feedId: number, items: RSSItem[]): Promise<number> {
        let newCount = 0;

        for (const item of items) {
            const article: Article = {
                feedId,
                guid: item.guid,
                title: item.title,
                link: item.link,
                content: item.content,
                summary: item.summary,
                author: item.author,
                pubDate: item.pubDate,
                isRead: false,
                isStarred: false,
                thumbnail: item.thumbnail
            };

            const id = await db.addArticle(article);
            if (id) newCount++;
        }

        // 更新未读数量
        const unreadCount = await db.articles
            .where('feedId')
            .equals(feedId)
            .and((a: Article) => !a.isRead)
            .count();

        await db.updateFeed(feedId, {
            lastUpdate: new Date(),
            unreadCount
        });

        return newCount;
    }

    /**
     * 刷新订阅源
     */
    async refreshFeed(feed: Feed): Promise<number> {
        try {
            const feedData = await this.fetchFeed(feed.url);
            return await this.updateFeedArticles(feed.id!, feedData.items);
        } catch (error) {
            console.error(`Error refreshing feed ${feed.title}:`, error);
            return 0;
        }
    }

    /**
     * 刷新所有订阅源
     */
    async refreshAllFeeds(): Promise<void> {
        const feeds = await db.getAllFeeds();
        const promises = feeds.map(feed => this.refreshFeed(feed));
        await Promise.all(promises);
    }

    /**
     * 导出 OPML
     */
    async exportOPML(): Promise<string> {
        const feeds = await db.getAllFeeds();

        let opml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        opml += '<opml version="2.0">\n';
        opml += '  <head>\n';
        opml += '    <title>RSS AI Reader Subscriptions</title>\n';
        opml += '  </head>\n';
        opml += '  <body>\n';

        // 按分类分组
        const categories = new Map<string, Feed[]>();
        feeds.forEach(feed => {
            const cat = feed.category || '未分类';
            if (!categories.has(cat)) {
                categories.set(cat, []);
            }
            categories.get(cat)!.push(feed);
        });

        categories.forEach((feeds, category) => {
            opml += `    <outline text="${category}" title="${category}">\n`;
            feeds.forEach(feed => {
                opml += `      <outline type="rss" text="${feed.title}" title="${feed.title}" xmlUrl="${feed.url}" />\n`;
            });
            opml += '    </outline>\n';
        });

        opml += '  </body>\n';
        opml += '</opml>';

        return opml;
    }

    /**
     * 导入 OPML
     */
    async importOPML(opmlContent: string): Promise<number> {
        const parser = new DOMParser();
        const doc = parser.parseFromString(opmlContent, 'text/xml');
        const outlines = doc.querySelectorAll('outline[type="rss"]');

        let count = 0;
        for (const outline of Array.from(outlines)) {
            const url = outline.getAttribute('xmlUrl');
            const category = outline.parentElement?.getAttribute('text') || '未分类';

            if (url) {
                try {
                    await this.addFeed(url, category);
                    count++;
                } catch (error) {
                    console.error(`Failed to import feed: ${url}`, error);
                }
            }
        }

        return count;
    }
}

export const rssService = new RSSService();
