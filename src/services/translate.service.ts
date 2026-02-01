// AI 翻译服务
import type { Translation } from '@/types';
import { db } from './db.service';

interface TranslationProvider {
    translate(text: string, targetLang: string, apiKey: string): Promise<string>;
}

/**
 * OpenAI 翻译提供者
 */
class OpenAIProvider implements TranslationProvider {
    async translate(text: string, targetLang: string, apiKey: string): Promise<string> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `Translate the following text to ${targetLang}. Only return the translation, no explanations:\n\n${text}`
                }],
                temperature: 0.3,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }
}

/**
 * DeepL 翻译提供者
 */
class DeepLProvider implements TranslationProvider {
    async translate(text: string, targetLang: string, apiKey: string): Promise<string> {
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `DeepL-Auth-Key ${apiKey}`
            },
            body: new URLSearchParams({
                text,
                target_lang: targetLang.toUpperCase()
            })
        });

        if (!response.ok) {
            throw new Error(`DeepL API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.translations[0].text;
    }
}

/**
 * Google Translate 提供者 (使用免费 API)
 */
class GoogleProvider implements TranslationProvider {
    async translate(text: string, targetLang: string, apiKey: string): Promise<string> {
        const response = await fetch(
            `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: text,
                    target: targetLang
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Google Translate API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data.translations[0].translatedText;
    }
}

class TranslationService {
    private providers: Map<string, TranslationProvider>;

    constructor() {
        this.providers = new Map([
            ['openai', new OpenAIProvider()],
            ['deepl', new DeepLProvider()],
            ['google', new GoogleProvider()]
        ]);
    }

    /**
     * 翻译文本
     */
    async translate(
        text: string,
        targetLang: string,
        provider: 'openai' | 'deepl' | 'google',
        apiKey: string,
        articleId?: number
    ): Promise<string> {
        // 检查缓存
        if (articleId) {
            const cached = await this.getCachedTranslation(articleId, targetLang);
            if (cached) {
                return cached;
            }
        }

        // 获取提供者
        const translationProvider = this.providers.get(provider);
        if (!translationProvider) {
            throw new Error(`Unknown translation provider: ${provider}`);
        }

        // 翻译
        const translatedText = await translationProvider.translate(text, targetLang, apiKey);

        // 缓存结果
        if (articleId) {
            await this.cacheTranslation(articleId, text, targetLang, translatedText);
        }

        return translatedText;
    }

    /**
     * 翻译文章
     */
    async translateArticle(
        articleId: number,
        targetLang: string,
        provider: 'openai' | 'deepl' | 'google',
        apiKey: string
    ): Promise<string> {
        const article = await db.articles.get(articleId);
        if (!article) {
            throw new Error('Article not found');
        }

        // 检查缓存
        const cached = await this.getCachedTranslation(articleId, targetLang);
        if (cached) {
            return cached;
        }

        // 翻译内容
        const content = article.content || article.summary;
        return await this.translate(content, targetLang, provider, apiKey, articleId);
    }

    /**
     * 获取缓存的翻译
     */
    private async getCachedTranslation(
        articleId: number,
        targetLang: string
    ): Promise<string | null> {
        const translation = await db.getTranslation(articleId, targetLang);
        return translation ? translation.translatedText : null;
    }

    /**
     * 缓存翻译结果
     */
    private async cacheTranslation(
        articleId: number,
        sourceText: string,
        targetLang: string,
        translatedText: string
    ): Promise<void> {
        const translation: Translation = {
            articleId,
            sourceText: this.hashText(sourceText),
            targetLang,
            translatedText,
            createTime: new Date()
        };

        await db.saveTranslation(translation);
    }

    /**
     * 简单哈希函数
     */
    private hashText(text: string): string {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    /**
     * 检测语言
     */
    detectLanguage(text: string): string {
        // 简单的语言检测
        const chineseRegex = /[\u4e00-\u9fa5]/;
        const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/;
        const koreanRegex = /[\uac00-\ud7af]/;

        if (chineseRegex.test(text)) return 'zh';
        if (japaneseRegex.test(text)) return 'ja';
        if (koreanRegex.test(text)) return 'ko';
        return 'en';
    }
}

export const translationService = new TranslationService();
