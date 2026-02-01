// IndexedDB 数据库服务 (使用 Dexie.js)
import Dexie, { Table } from 'dexie';
import type { Feed, Article, Translation, Settings } from '@/types';

export class RSSDatabase extends Dexie {
    feeds!: Table<Feed, number>;
    articles!: Table<Article, number>;
    translations!: Table<Translation, number>;
    settings!: Table<Settings, number>;

    constructor() {
        super('RSSReaderDB');

        this.version(1).stores({
            feeds: '++id, url, category, lastUpdate',
            articles: '++id, feedId, guid, pubDate, isRead, isStarred',
            translations: '++id, articleId, sourceText, targetLang',
            settings: '++id'
        });
    }

    async getSettings(): Promise<Settings> {
        const settings = await this.settings.toArray();
        if (settings.length === 0) {
            // 创建默认设置
            const defaultSettings: Settings = {
                theme: 'light',
                fontSize: 16,
                translationProvider: 'openai',
                apiKey: '',
                autoMarkRead: false,
                updateInterval: 30,
                targetLanguage: 'zh-CN'
            };
            await this.settings.add(defaultSettings);
            return defaultSettings;
        }
        return settings[0];
    }

    async updateSettings(settings: Partial<Settings>): Promise<void> {
        const current = await this.getSettings();
        if (current.id) {
            await this.settings.update(current.id, settings);
        }
    }

    async addFeed(feed: Feed): Promise<number> {
        return await this.feeds.add(feed);
    }

    async updateFeed(id: number, updates: Partial<Feed>): Promise<void> {
        await this.feeds.update(id, updates);
    }

    async deleteFeed(id: number): Promise<void> {
        await this.feeds.delete(id);
        // 删除相关文章
        await this.articles.where('feedId').equals(id).delete();
    }

    async getAllFeeds(): Promise<Feed[]> {
        return await this.feeds.toArray();
    }

    async getFeedsByCategory(category: string): Promise<Feed[]> {
        return await this.feeds.where('category').equals(category).toArray();
    }

    async addArticle(article: Article): Promise<number | undefined> {
        // 检查是否已存在
        const existing = await this.articles.where('guid').equals(article.guid).first();
        if (existing) {
            return existing.id;
        }
        return await this.articles.add(article);
    }

    async getArticlesByFeed(feedId: number, limit = 50): Promise<Article[]> {
        return await this.articles
            .where('feedId')
            .equals(feedId)
            .reverse()
            .sortBy('pubDate')
            .then(articles => articles.slice(0, limit));
    }

    async getAllArticles(limit = 100): Promise<Article[]> {
        return await this.articles
            .orderBy('pubDate')
            .reverse()
            .limit(limit)
            .toArray();
    }

    async getUnreadArticles(): Promise<Article[]> {
        return await this.articles.where('isRead').equals(false).toArray();
    }

    async getStarredArticles(): Promise<Article[]> {
        return await this.articles.where('isStarred').equals(true).toArray();
    }

    async markAsRead(id: number): Promise<void> {
        await this.articles.update(id, { isRead: true });
    }

    async toggleStar(id: number): Promise<void> {
        const article = await this.articles.get(id);
        if (article) {
            await this.articles.update(id, { isStarred: !article.isStarred });
        }
    }

    async getTranslation(articleId: number, targetLang: string): Promise<Translation | undefined> {
        return await this.translations
            .where('[articleId+targetLang]')
            .equals([articleId, targetLang])
            .first();
    }

    async saveTranslation(translation: Translation): Promise<number> {
        return await this.translations.add(translation);
    }

    async clearOldArticles(daysToKeep = 30): Promise<void> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        await this.articles
            .where('pubDate')
            .below(cutoffDate)
            .and(article => !article.isStarred)
            .delete();
    }
}

// 导出数据库实例
export const db = new RSSDatabase();
