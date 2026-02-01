// Article Store - 文章状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Article } from '@/types';
import { db } from '@/services/db.service';

export const useArticleStore = defineStore('article', () => {
    const articles = ref<Article[]>([]);
    const selectedArticleId = ref<number | null>(null);
    const isLoading = ref(false);
    const searchQuery = ref('');
    const filterMode = ref<'all' | 'unread' | 'starred'>('all');

    // Computed
    const selectedArticle = computed(() =>
        articles.value.find(a => a.id === selectedArticleId.value)
    );

    const filteredArticles = computed(() => {
        let result = articles.value;

        // 过滤模式
        if (filterMode.value === 'unread') {
            result = result.filter(a => !a.isRead);
        } else if (filterMode.value === 'starred') {
            result = result.filter(a => a.isStarred);
        }

        // 搜索
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();
            result = result.filter(a =>
                a.title.toLowerCase().includes(query) ||
                a.summary.toLowerCase().includes(query)
            );
        }

        return result;
    });

    const unreadCount = computed(() =>
        articles.value.filter(a => !a.isRead).length
    );

    const starredCount = computed(() =>
        articles.value.filter(a => a.isStarred).length
    );

    // Actions
    async function loadArticles(feedId?: number) {
        isLoading.value = true;
        try {
            if (feedId) {
                articles.value = await db.getArticlesByFeed(feedId);
            } else {
                articles.value = await db.getAllArticles();
            }
        } catch (error) {
            console.error('Failed to load articles:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function loadUnreadArticles() {
        isLoading.value = true;
        try {
            articles.value = await db.getUnreadArticles();
        } catch (error) {
            console.error('Failed to load unread articles:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function loadStarredArticles() {
        isLoading.value = true;
        try {
            articles.value = await db.getStarredArticles();
        } catch (error) {
            console.error('Failed to load starred articles:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function markAsRead(id: number) {
        try {
            await db.markAsRead(id);
            const article = articles.value.find(a => a.id === id);
            if (article) {
                article.isRead = true;
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }

    async function toggleStar(id: number) {
        try {
            await db.toggleStar(id);
            const article = articles.value.find(a => a.id === id);
            if (article) {
                article.isStarred = !article.isStarred;
            }
        } catch (error) {
            console.error('Failed to toggle star:', error);
        }
    }

    async function markAllAsRead() {
        try {
            const promises = articles.value
                .filter(a => !a.isRead)
                .map(a => a.id ? db.markAsRead(a.id) : Promise.resolve());

            await Promise.all(promises);
            articles.value.forEach(a => a.isRead = true);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }

    function selectArticle(id: number | null) {
        selectedArticleId.value = id;
        // 自动标记为已读
        if (id) {
            markAsRead(id);
        }
    }

    function setSearchQuery(query: string) {
        searchQuery.value = query;
    }

    function setFilterMode(mode: 'all' | 'unread' | 'starred') {
        filterMode.value = mode;
    }

    return {
        articles,
        selectedArticleId,
        selectedArticle,
        filteredArticles,
        unreadCount,
        starredCount,
        isLoading,
        searchQuery,
        filterMode,
        loadArticles,
        loadUnreadArticles,
        loadStarredArticles,
        markAsRead,
        toggleStar,
        markAllAsRead,
        selectArticle,
        setSearchQuery,
        setFilterMode
    };
});
