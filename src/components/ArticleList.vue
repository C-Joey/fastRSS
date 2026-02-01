<template>
  <div class="article-list h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
    <!-- 头部 -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2 mb-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索文章..."
          class="flex-1 input"
        />
        <button @click="markAllRead" class="btn btn-ghost p-2" title="全部标为已读">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <div class="flex gap-2">
        <button
          v-for="mode in filterModes"
          :key="mode.value"
          @click="setFilter(mode.value)"
          :class="['px-3 py-1 text-sm rounded-lg transition-colors', filterMode === mode.value ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700']"
        >
          {{ mode.label }}
        </button>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="isLoading" class="flex items-center justify-center h-32">
        <div class="spinner"></div>
      </div>

      <div v-else-if="filteredArticles.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>暂无文章</p>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <article
          v-for="article in filteredArticles"
          :key="article.id"
          @click="selectArticle(article.id!)"
          :class="['p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800', selectedArticleId === article.id ? 'bg-primary-50 dark:bg-primary-900/20' : '', !article.isRead ? 'border-l-4 border-primary-600' : '']"
        >
          <div class="flex items-start gap-3">
            <img
              v-if="article.thumbnail"
              :src="article.thumbnail"
              :alt="article.title"
              class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
            />
            <div class="flex-1 min-w-0">
              <h3 :class="['font-semibold mb-1 line-clamp-2', !article.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400']">
                {{ article.title }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {{ article.summary }}
              </p>
              <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                <span v-if="article.author">{{ article.author }}</span>
                <span>{{ formatDate(article.pubDate) }}</span>
                <button
                  v-if="article.isStarred"
                  @click.stop="toggleStar(article.id!)"
                  class="text-yellow-500 hover:text-yellow-600"
                >
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- 底部统计 -->
    <div class="p-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
      共 {{ filteredArticles.length }} 篇文章
      <span v-if="unreadCount > 0"> · {{ unreadCount }} 篇未读</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useArticleStore } from '@/stores/article.store';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const articleStore = useArticleStore();
const { filteredArticles, selectedArticleId, isLoading, searchQuery, filterMode, unreadCount } = storeToRefs(articleStore);

const filterModes = [
  { value: 'all', label: '全部' },
  { value: 'unread', label: '未读' },
  { value: 'starred', label: '收藏' }
];

function selectArticle(id: number) {
  articleStore.selectArticle(id);
}

function toggleStar(id: number) {
  articleStore.toggleStar(id);
}

function markAllRead() {
  if (confirm('确定要将所有文章标记为已读吗?')) {
    articleStore.markAllAsRead();
  }
}

function setFilter(mode: 'all' | 'unread' | 'starred') {
  articleStore.setFilterMode(mode);
}

function formatDate(date: Date): string {
  return dayjs(date).fromNow();
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
