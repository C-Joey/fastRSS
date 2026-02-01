<template>
  <div id="app" class="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
    <!-- 顶部栏 -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="toggleSidebar" class="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">RSS AI Reader</h1>
      </div>

      <div class="flex items-center gap-2">
        <button @click="settingsStore.toggleTheme()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="切换主题">
          <svg v-if="settings.theme === 'light'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 侧边栏 -->
      <div :class="['w-64 flex-shrink-0 transition-transform duration-300', showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']">
        <Sidebar @openSettings="showSettings = true" />
      </div>

      <!-- 文章列表 -->
      <div class="w-96 flex-shrink-0 hidden md:block">
        <ArticleList />
      </div>

      <!-- 阅读器 -->
      <div class="flex-1">
        <ArticleReader />
      </div>
    </div>

    <!-- 设置对话框 -->
    <Settings v-if="showSettings" @close="showSettings = false" />

    <!-- 移动端遮罩 -->
    <div
      v-if="showSidebar"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFeedStore } from '@/stores/feed.store';
import { useArticleStore } from '@/stores/article.store';
import { useSettingsStore } from '@/stores/settings.store';
import { storeToRefs } from 'pinia';

import Sidebar from '@/components/Sidebar.vue';
import ArticleList from '@/components/ArticleList.vue';
import ArticleReader from '@/components/ArticleReader.vue';
import Settings from '@/components/Settings.vue';

const feedStore = useFeedStore();
const articleStore = useArticleStore();
const settingsStore = useSettingsStore();

const { settings } = storeToRefs(settingsStore);

const showSidebar = ref(false);
const showSettings = ref(false);

function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
}

onMounted(async () => {
  // 加载设置
  await settingsStore.loadSettings();
  
  // 加载订阅源
  await feedStore.loadFeeds();
  
  // 加载文章
  await articleStore.loadArticles();

  // 应用字体大小
  document.documentElement.style.setProperty('--font-size-base', `${settings.value.fontSize}px`);

  // 设置自动更新
  setInterval(() => {
    feedStore.refreshAllFeeds();
  }, settings.value.updateInterval * 60 * 1000);
});
</script>
