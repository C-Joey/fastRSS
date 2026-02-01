// TypeScript 类型定义

export interface Feed {
    id?: number;
    url: string;
    title: string;
    category: string;
    favicon?: string;
    updateInterval: number; // 分钟
    lastUpdate?: Date;
    unreadCount: number;
}

export interface Article {
    id?: number;
    feedId: number;
    guid: string;
    title: string;
    link: string;
    content: string;
    summary: string;
    author?: string;
    pubDate: Date;
    isRead: boolean;
    isStarred: boolean;
    thumbnail?: string;
}

export interface Translation {
    id?: number;
    articleId: number;
    sourceText: string; // MD5 hash
    targetLang: string;
    translatedText: string;
    createTime: Date;
}

export interface Settings {
    theme: 'light' | 'dark';
    fontSize: number;
    translationProvider: 'openai' | 'deepl' | 'google';
    apiKey: string;
    autoMarkRead: boolean;
    updateInterval: number;
    targetLanguage: string;
}

export interface RSSItem {
    title: string;
    link: string;
    content: string;
    summary: string;
    author?: string;
    pubDate: Date;
    guid: string;
    thumbnail?: string;
}

export interface RSSFeed {
    title: string;
    description?: string;
    link?: string;
    items: RSSItem[];
}
