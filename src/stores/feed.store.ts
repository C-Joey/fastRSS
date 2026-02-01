// Feed Store - 订阅源状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Feed } from '@/types';
import { db } from '@/services/db.service';
import { rssService } from '@/services/rss.service';

export const useFeedStore = defineStore('feed', () => {
    const feeds = ref<Feed[]>([]);
    const selectedFeedId = ref<number | null>(null);
    const isLoading = ref(false);

    // Computed
    const selectedFeed = computed(() =>
        feeds.value.find(f => f.id === selectedFeedId.value)
    );

    const categories = computed(() => {
        const cats = new Set(feeds.value.map(f => f.category));
        return Array.from(cats);
    });

    const feedsByCategory = computed(() => {
        const result = new Map<string, Feed[]>();
        feeds.value.forEach(feed => {
            const cat = feed.category || '未分类';
            if (!result.has(cat)) {
                result.set(cat, []);
            }
            result.get(cat)!.push(feed);
        });
        return result;
    });

    const totalUnread = computed(() =>
        feeds.value.reduce((sum, feed) => sum + feed.unreadCount, 0)
    );

    // Actions
    async function loadFeeds() {
        isLoading.value = true;
        try {
            feeds.value = await db.getAllFeeds();
        } catch (error) {
            console.error('Failed to load feeds:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function addFeed(url: string, category = '未分类') {
        isLoading.value = true;
        try {
            const feed = await rssService.addFeed(url, category);
            feeds.value.push(feed);
            return feed;
        } catch (error) {
            console.error('Failed to add feed:', error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateFeed(id: number, updates: Partial<Feed>) {
        try {
            await db.updateFeed(id, updates);
            const index = feeds.value.findIndex(f => f.id === id);
            if (index !== -1) {
                feeds.value[index] = { ...feeds.value[index], ...updates };
            }
        } catch (error) {
            console.error('Failed to update feed:', error);
            throw error;
        }
    }

    async function deleteFeed(id: number) {
        try {
            await db.deleteFeed(id);
            feeds.value = feeds.value.filter(f => f.id !== id);
            if (selectedFeedId.value === id) {
                selectedFeedId.value = null;
            }
        } catch (error) {
            console.error('Failed to delete feed:', error);
            throw error;
        }
    }

    async function refreshFeed(feed: Feed) {
        isLoading.value = true;
        try {
            await rssService.refreshFeed(feed);
            await loadFeeds(); // 重新加载以更新未读数
        } catch (error) {
            console.error('Failed to refresh feed:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function refreshAllFeeds() {
        isLoading.value = true;
        try {
            await rssService.refreshAllFeeds();
            await loadFeeds();
        } catch (error) {
            console.error('Failed to refresh all feeds:', error);
        } finally {
            isLoading.value = false;
        }
    }

    function selectFeed(id: number | null) {
        selectedFeedId.value = id;
    }

    return {
        feeds,
        selectedFeedId,
        selectedFeed,
        categories,
        feedsByCategory,
        totalUnread,
        isLoading,
        loadFeeds,
        addFeed,
        updateFeed,
        deleteFeed,
        refreshFeed,
        refreshAllFeeds,
        selectFeed
    };
});
