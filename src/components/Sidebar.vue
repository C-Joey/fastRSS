<template>
  <div class="sidebar h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
    <!-- 头部 -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
        RSS Reader
      </h1>
    </div>

    <!-- 快捷视图 -->
    <div class="p-2 border-b border-gray-200 dark:border-gray-700">
      <button
        @click="selectView('all')"
        :class="['w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors', currentView === 'all' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300']"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span class="flex-1 text-left">全部文章</span>
        <span v-if="totalUnread > 0" class="px-2 py-0.5 text-xs font-medium bg-primary-600 text-white rounded-full">{{ totalUnread }}</span>
      </button>

      <button
        @click="selectView('unread')"
        :class="['w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mt-1', currentView === 'unread' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300']"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span class="flex-1 text-left">未读</span>
      </button>

      <button
        @click="selectView('starred')"
        :class="['w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mt-1', currentView === 'starred' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300']"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <span class="flex-1 text-left">收藏</span>
      </button>
    </div>

    <!-- 订阅源列表 -->
    <div class="flex-1 overflow-y-auto p-2">
      <div class="flex items-center justify-between px-3 py-2">
        <h2 class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">订阅源</h2>
        <button @click="showAddFeed = true" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
          <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <!-- 按分类显示订阅源 -->
      <div v-for="[category, categoryFeeds] in feedsByCategory" :key="category" class="mb-3">
        <div class="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-500">{{ category }}</div>
        <button
          v-for="feed in categoryFeeds"
          :key="feed.id"
          @click="selectFeed(feed.id!)"
          :class="['w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left', selectedFeedId === feed.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300']"
        >
          <div class="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
            {{ feed.title.charAt(0).toUpperCase() }}
          </div>
          <span class="flex-1 truncate text-sm">{{ feed.title }}</span>
          <span v-if="feed.unreadCount > 0" class="px-1.5 py-0.5 text-xs font-medium bg-primary-600 text-white rounded">{{ feed.unreadCount }}</span>
        </button>
      </div>

      <div v-if="feeds.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        <p class="text-sm">暂无订阅源</p>
        <button @click="showAddFeed = true" class="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
          添加第一个订阅源
        </button>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
      <button @click="refreshAll" :disabled="isLoading" class="w-full btn btn-secondary text-sm">
        <svg v-if="!isLoading" class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span v-if="isLoading" class="spinner mr-2"></span>
        {{ isLoading ? '刷新中...' : '刷新全部' }}
      </button>
      <button @click="$emit('openSettings')" class="w-full btn btn-ghost text-sm">
        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        设置
      </button>
    </div>

    <!-- 添加订阅源对话框 -->
    <div v-if="showAddFeed" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showAddFeed = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">添加订阅源</h3>
        <input
          v-model="newFeedUrl"
          type="url"
          placeholder="输入 RSS Feed URL"
          class="input mb-3"
          @keyup.enter="addFeed"
        />
        <input
          v-model="newFeedCategory"
          type="text"
          placeholder="分类 (可选)"
          class="input mb-4"
          @keyup.enter="addFeed"
        />
        <div class="flex gap-2">
          <button @click="showAddFeed = false" class="flex-1 btn btn-secondary">取消</button>
          <button @click="addFeed" :disabled="!newFeedUrl" class="flex-1 btn btn-primary">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFeedStore } from '@/stores/feed.store';
import { useArticleStore } from '@/stores/article.store';
import { storeToRefs } from 'pinia';

defineEmits(['openSettings']);

const feedStore = useFeedStore();
const articleStore = useArticleStore();

const { feeds, selectedFeedId, feedsByCategory, totalUnread, isLoading } = storeToRefs(feedStore);

const currentView = ref<'all' | 'unread' | 'starred'>('all');
const showAddFeed = ref(false);
const newFeedUrl = ref('');
const newFeedCategory = ref('未分类');

function selectView(view: 'all' | 'unread' | 'starred') {
  currentView.value = view;
  feedStore.selectFeed(null);
  
  if (view === 'all') {
    articleStore.loadArticles();
  } else if (view === 'unread') {
    articleStore.loadUnreadArticles();
  } else {
    articleStore.loadStarredArticles();
  }
}

function selectFeed(feedId: number) {
  currentView.value = 'all';
  feedStore.selectFeed(feedId);
  articleStore.loadArticles(feedId);
}

async function addFeed() {
  if (!newFeedUrl.value) return;
  
  try {
    await feedStore.addFeed(newFeedUrl.value, newFeedCategory.value || '未分类');
    showAddFeed.value = false;
    newFeedUrl.value = '';
    newFeedCategory.value = '未分类';
  } catch (error) {
    alert('添加订阅源失败,请检查 URL 是否正确');
  }
}

async function refreshAll() {
  await feedStore.refreshAllFeeds();
  if (currentView.value === 'all') {
    articleStore.loadArticles();
  }
}
</script>
